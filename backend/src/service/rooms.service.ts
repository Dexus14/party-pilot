import NodeCache from "node-cache";
import {getQueue, getSpotifyUserData} from "./spotifyApi.service";
import {randomString} from "./utils.service";
import {Server} from "socket.io";
import {getRoomOwnerToken, updateRoomQueue, updateRoomTrack} from "./websocketUtils.service";
import {refreshTokenIfNeeded} from "./spotifyUtils.service";
import {ROOM_LIFETIME} from "../index";

const roomsCache = new NodeCache()

// This cache is used to remove the room from the rooms cache when the owner requests it
const roomOwnersCache = new NodeCache()

const roomsToUpdate = new Set<string>()

// Remove owner of the room from owners cache on room expiry / deletion
roomsCache.on('del', (key, value: Room) => roomOwnersCache.del(value.ownerSpotifyId))

export function updateRoomTracksIntervally(io: Server) {
    setInterval(async () => {
        for(const roomId of roomsToUpdate) {
            removeRoomIfExpired(roomId)

            const roomExistance = roomExists(roomId)
            if(!roomExistance) {
                roomsToUpdate.delete(roomId)
                continue
            }

            try {
                await Promise.all([
                    updateRoomTrack(roomId, io),
                    updateRoomQueue(roomId, io),
                    refreshRoomOwnerTokenIfNeeded(roomId)
                ])
            } catch (e) {
                console.error('updateRoomTracksIntervally: ', e)
            }
        }
    }, parseInt(process.env.TRACK_UPDATE_INTERVAL_MS as string))
}

export async function createOrGetRoom(authData: any, ownerSpotifyId: string): Promise<string> {
    const spotifyOwnerData = await getSpotifyUserData(authData.access_token)

    const ownerId = spotifyOwnerData.data.id

    if(roomOwnerExists(ownerId)) {
        return getRoomOwnersRoomId(ownerSpotifyId) as string
    }

    let roomId = generateRoomId()

    const room: Room = {
        id: roomId,
        ownerSpotifyId: ownerId,
        users: [],
        options: {
            name: spotifyOwnerData.data.display_name + "'s room",
            songsPerUser: 0,
            equality: false,
            skipVotes: 0
        },
        accessToken: authData.access_token,
        refreshToken: authData.refresh_token,
        lastRefresh: Date.now(),
        createdAt: Date.now()
    }

    setRoom(room)
    roomOwnersCache.set(ownerSpotifyId, roomId)
    roomsToUpdate.add(roomId)

    return room.id
}

export function getRoom(roomId: string) {
    return roomsCache.get(roomId) as Room | undefined
}

export function setRoom(room: Room) {
    roomsCache.set(room.id, room)
}

export function roomExists(roomId: string) {
    return roomsCache.has(roomId)
}

export function roomAndUserExists(roomId: string, roomUserId: string) {
    if(!roomExists(roomId)) {
        return false
    }

    const room = getRoom(roomId) as Room

    return room.users.some(user => user.id === roomUserId)
}

export function createRoomUser(roomId: string, username: string, isOwner: boolean = false) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    const roomUser: RoomUser = {
        id: randomString(4),
        username,
        roomId,
        currentlyActive: false,
        songs: [],
        isOwner
    }

    // If by chance the id is already taken, generate a new one
    while(room.users.find(user => user.id === roomUser.id)) {
        roomUser.id = randomString(4)
    }

    room.users.push(roomUser)
    setRoom(room)

    return roomUser
}

export function getRoomUser(roomId: string, roomUserId: string) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    const roomUser = room.users.find(user => user.id === roomUserId)
    if(!roomUser) {
        throw new Error('Room user does not exist')
    }

    return roomUser
}

export function getRoomOwner(roomId: string) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    return room.users.find(user => user.isOwner)
}

export function removeRoomUser(roomId: string, roomUserId: string) {
    const room = getRoom(roomId)
    if(!room) {
        return
    }

    room.users = room.users.filter(user => user.id !== roomUserId)

    setRoom(room)
}

export function setRoomUserActive(roomId: string, roomUserId: string, active: boolean) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    room.users.map(user => {
        if(user.id === roomUserId) {
            user.currentlyActive = active
        }
    })

    setRoom(room)
}

export function roomUserAddSong(roomId: string, roomUserId: string, songUri: string) {
    const room = getRoom(roomId)
    if(!room) {
        return console.log('Room does not exist')
    }

    const roomUsers = room.users
    room.users = roomUsers.map(user => {
        if (user.id === roomUserId) {
            user.songs.push(songUri)
        }
        return user
    })

    setRoom(room)
}

export async function getQueueWithRoomUsers(roomId: string) {
    const accessToken = await getRoomOwnerToken(roomId)
    let room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }
    const response = await getQueue(accessToken)
    const queue = response.data.queue

    room = filterUserSongsWithQueue(room, queue)

    return queue.map((song: any) => {
        // @ts-ignore
        const roomUsers = room.users.filter(user => user.songs.includes(song.uri))
        const roomUserNames = roomUsers.map(user => user.username)
        return {
            name: song.name,
            artists: song.artists, // TODO: Add image
            users: roomUserNames
        }
    })
}

export function canUserAddSong(roomId: string, roomUserId: string) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    const roomUser = room.users.find(user => user.id === roomUserId)
    if(!roomUser) {
        throw new Error('Room user does not exist')
    }

    if(!room.options.songsPerUser || room.options.songsPerUser === 0) {
        return true
    }

    return roomUser.songs.length < room.options.songsPerUser
}

export function filterUserSongsWithQueue(room: Room, queue: any[]) {
    room.users = room.users.map(user => {
        user.songs = user.songs.filter(song => queue.some((queueItem: any) => queueItem.uri === song))
        return user
    })

    setRoom(room)
    return room
}

export async function refreshRoomOwnerTokenIfNeeded(roomId: string) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    return refreshTokenIfNeeded(room)
}

export async function updateRoomOptions(roomId: string, options: RoomOptions) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    room.options = options
    setRoom(room)

    return room
}

export function destroyRoomByOwnerId(ownerSpotifyId: string) {
    const roomId = roomOwnersCache.get(ownerSpotifyId) as string|undefined
    if(!roomId) {
        return
    }

    roomsCache.del(roomId)
}

export function destroyRoom(roomId: string) {
    roomsCache.del(roomId)
}

export function getRoomOwnersRoomId(ownerSpotifyId: string) {
    return roomOwnersCache.get(ownerSpotifyId) as string|undefined
}

export function roomOwnerExists(ownerSpotifyId: string) {
    return roomOwnersCache.has(ownerSpotifyId)
}

export function updateRoomTokens(roomId: string, accessToken: string) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    room.accessToken = accessToken
    room.lastRefresh = Date.now()
    setRoom(room)
    return room
}

function generateRoomId() {
    let roomId = randomString(6)
    // Get new id if room already exists
    while(roomExists(roomId)) {
        roomId = randomString(6)
    }

    return roomId
}

function removeRoomIfExpired(roomId: string) {
    const room = getRoom(roomId)
    if(!room) {
        return
    }

    if(room.createdAt + ROOM_LIFETIME < Date.now()) {
        roomsCache.del(roomId)
    }
}
