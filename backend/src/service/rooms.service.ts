import NodeCache, {errorMonitor} from "node-cache";
import {createUser, getUserBySpotifyId, updateUser} from "./database.service";
import {getUserData} from "./spotifyApi.service";
import {randomString} from "./utils.service";


const roomsCache = new NodeCache({
    // stdTTL: 3600
})

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
    user === null ? await updateUser(newUserData) : await createUser(newUserData)

    const room: Room = {
        id: roomId,
        ownerSpotifyId: ownerId,
        users: []
    }

    setRoom(room)

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
        currentlyActive: false
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

function generateRoomId() {
    let roomId = randomString(6)
    // Get new id if room already exists
    while(roomExists(roomId)) {
        roomId = randomString(6)
    }

    return roomId
}
