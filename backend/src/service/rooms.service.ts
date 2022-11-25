import NodeCache from "node-cache";
import {createUser, getUserBySpotifyId, updateUser} from "./database.service";
import {getUserData} from "./spotify.service";
import {randomString} from "./utils.service";

interface Room {
    id: string
    ownerSpotifyId: any
    users: any[]
}

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

    let roomId = randomString(6)
    // Get new id if room already exists
    while(roomExists(roomId)) {
        roomId = randomString(6)
    }

    if(user === null) {
        // create new user
        await createUser({
            spotifyId: ownerId,
            accessToken: ownerData.access_token,
            refreshToken: ownerData.refresh_token,
            roomId
        })
    } else if(roomExists(user.roomId)) {
        await updateUser({ spotifyId: ownerId, roomId })
    }

    const roomData: Room = {
        id: roomId,
        ownerSpotifyId: ownerId,
        users: []
    }

    roomsCache.set(roomId, roomData)

    return roomId
}

export function getRoom(roomId: string) {
    return roomsCache.get(roomId) as Room | undefined
}

export function setRoom(roomId: string, room: Room) {
    roomsCache.set(roomId, room)
}

export function roomExists(roomId: string) {
    return roomsCache.has(roomId)
}

