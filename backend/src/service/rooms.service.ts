import NodeCache from "node-cache";
import {createUser, getUserBySpotifyId, updateUser} from "./database.service";
import {getQueue, getSpotifyUserData} from "./spotifyApi.service";
import {randomString} from "./utils.service";
import {Server} from "socket.io";
import {getRoomOwnerToken, updateRoomQueue, updateRoomTrack} from "./websocketUtils.service";
import {Prisma} from '@prisma/client'
import {refreshTokenIfNeeded} from "./spotifyUtils.service";

const roomsCache = new NodeCache()

const roomsToUpdate = new Set<string>()

export function updateRoomTracksIntervally(io: Server) {
    setInterval(async () => {
        for(const roomId of roomsToUpdate) {
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

export async function createOrGetRoom(ownerData: any): Promise<string> {
    const spotifyOwnerData = await getSpotifyUserData(ownerData.access_token)

    const ownerId = spotifyOwnerData.data.id
    let user = await getUserBySpotifyId(ownerId)

    if(user !== null && roomExists(user.roomId)) {
        return user.roomId
    }

    let roomId = generateRoomId()

    const newUserData: Prisma.UserCreateInput = {
        spotifyId: ownerId,
        roomId,
        accessToken: ownerData.access_token,
        refreshToken: ownerData.refresh_token,
        lastRefresh: new Date()
    }

    // Create or update user
    user === null ? await createUser(newUserData) : await updateUser(newUserData)

    const room: Room = {
        id: roomId,
        ownerSpotifyId: ownerId,
        users: [],
        options: {
            name: spotifyOwnerData.data.display_name + "'s room",
            songsPerUser: process.env.DEFAULT_SONGS_PER_USER ? parseInt(process.env.DEFAULT_SONGS_PER_USER) : 3
        }
    }

    setRoom(room)
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

export function createRoomUser(roomId: string, username: string) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    const roomUser: RoomUser = {
        id: randomString(4),
        username,
        roomId,
        currentlyActive: false,
        songs: []
    }

    // If by chance the id is already taken, generate a new one
    while(room.users.find(user => user.id === roomUser.id)) {
        roomUser.id = randomString(4)
    }

    room.users.push(roomUser)
    setRoom(room)

    return roomUser
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

    const roomOwner = room.ownerSpotifyId
    if(!roomOwner) {
        throw new Error('Room owner does not exist')
    }

    const user = await getUserBySpotifyId(roomOwner)
    if(!user) {
        throw new Error('User does not exist')
    }

    return refreshTokenIfNeeded(user)
}

function generateRoomId() {
    let roomId = randomString(6)
    // Get new id if room already exists
    while(roomExists(roomId)) {
        roomId = randomString(6)
    }

    return roomId
}
