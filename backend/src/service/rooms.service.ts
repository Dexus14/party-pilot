import NodeCache from "node-cache";
import {createUser, getUserBySpotifyId, updateUser} from "./database.service";
import {getUserData} from "./spotify.service";
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

    if(user === null) {
        await createUser({
            spotifyId: ownerId,
            accessToken: ownerData.access_token,
            refreshToken: ownerData.refresh_token,
            roomId
        })
    } else {
        await updateUser({ spotifyId: ownerId, roomId })
    }

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

export function removeRoomUser(roomId: string, roomUser: string) {
    const room = getRoom(roomId)
    if(!room) {
        return
    }

    room.users = room.users.filter(user => user.id !== roomUser)

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
