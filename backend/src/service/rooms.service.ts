import NodeCache from "node-cache";
import {createUser, getUserBySpotifyId, updateUser} from "./database.service";
import {addSongToQueue, getQueue, getUserData} from "./spotifyApi.service";
import {randomString} from "./utils.service";
import {Server, Socket} from "socket.io";
import {getRoomOwnerToken, updateRoomTrack} from "./websocketUtils.service";
import express from "express";


const roomsCache = new NodeCache({
    // stdTTL: 3600
})

// TODO: Think about creating better way to keep the room updated
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
                await updateRoomTrack(roomId, io)
            } catch (e) {
                console.error('updateRoomTracksIntervally: ', e)
            }
        }
    }, parseInt(process.env.TRACK_UPDATE_INTERVAL_MS ?? '5000'))
}

export async function createOrGetRoom(ownerData: any): Promise<string> {
    const spotifyOwnerData = await getUserData(ownerData.access_token)

    const ownerId = spotifyOwnerData.data.id
    let user = await getUserBySpotifyId(ownerId)

    if(user !== null && roomExists(user.roomId)) {
        return user.roomId
    }

    let roomId = generateRoomId()

    const newUserData = { // FIXME: Add static type from Prisma
        spotifyId: ownerId,
        roomId,
        accessToken: ownerData.access_token,
        refreshToken: ownerData.refresh_token,
    }

    // Create or update user
    user === null ? await createUser(newUserData) : await updateUser(newUserData)

    const room: Room = {
        id: roomId,
        ownerSpotifyId: ownerId,
        users: []
    }

    setRoom(room)
    roomsToUpdate.add(roomId) // TODO: Think about creating better way to keep the room updated

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
        throw new Error('CreateUser: Room does not exist')
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
        return console.log('setRoomUserActive: Room does not exist')
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
        return console.log('roomUserAddSong: Room does not exist')
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

export async function roomSongAdd(socket: Socket, roomId: string, userRoomId: string, songsongUri: string) {
    const accessToken = await getRoomOwnerToken(roomId)
    
    try {
        // TODO: Add better error here
        // TODO: Check if song is already in queue
        await addSongToQueue(accessToken, songsongUri)
        roomUserAddSong(roomId, userRoomId, songsongUri)

        const xd = await getQueueWithRoomUsers(roomId)
        socket.emit('roomQueueUpdate', xd)
        socket.to(roomId).emit('roomQueueUpdate', xd)
    } catch(e) {
        console.log(e)
    }
}

export async function getQueueWithRoomUsers(roomId: string) {
    const accessToken = await getRoomOwnerToken(roomId)
    const room = getRoom(roomId)
    if(!room) {
        throw new Error()
    }
    const response = await getQueue(accessToken)
    const queue = response.data.queue

    return queue.map((song: any) => {
        const roomUsers = room.users.filter(user => user.songs.includes(song.uri))
        const roomUserNames = roomUsers.map(user => user.username)
        return {
            name: song.name,
            artists: song.artists,
            users: roomUserNames
        }
    })
}

function generateRoomId() {
    let roomId = randomString(6)
    // Get new id if room already exists
    while(roomExists(roomId)) {
        roomId = randomString(6)
    }

    return roomId
}
