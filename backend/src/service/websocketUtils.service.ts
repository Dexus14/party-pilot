import {Server, Socket} from "socket.io";
import {getRoom, roomAndUserExists, roomExists} from "./rooms.service";
import cookieParser from "cookie-parser";
import cookie from 'cookie'
import {ExtendedError} from "socket.io/dist/namespace";
import {getUserBySpotifyId} from "./database.service";
import {getPlaybackState} from "./spotifyApi.service";

export function socketConnectToRoom(socket: Socket, roomId: string) {
    const roomExistsance = roomExists(roomId ?? '')

    if(!roomId || !roomExistsance) {
        throw new Error('This room does not exist.')
    }

    socket.join(roomId)
}

export async function socketRoomUpdate(socket: Server|Socket, roomId: string) {
    const room = getRoom(roomId)
    if(!room) {
        return console.error('no room') // FIXME handle error
    }

    socket.to(roomId).emit('roomUpdate', room)
}

export function getRoomAndUserFromCookie(cookieString: string) {
    // FIXME: better way to handle this?
    const cookies = cookieParser.JSONCookies(cookie.parse(cookieString))
    // @ts-ignore
    const roomId = cookies?.roomUser?.roomId
    // @ts-ignore
    const userRoomId = cookies?.roomUser?.id

    return {roomId, userRoomId}
}

export function socketAuthMiddleware(socket: Socket, next: (err?: ExtendedError|undefined) => void) {
    const {roomId, userRoomId} = getRoomAndUserFromCookie(socket.handshake.headers.cookie ?? '')
    const roomAndUserExistance = roomAndUserExists(roomId, userRoomId)

    if(!roomAndUserExistance) {
        return next(new Error('This room does not exist.'))
    }

    next()
}

export async function updateRoomTrack(roomId: string, socket: Server|Socket) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('updateRoomTrack: Room does not exist')
    }

    const user = await getUserBySpotifyId(room.ownerSpotifyId)
    if(!user) {
        throw new Error('updateRoomTrack: User does not exist')
    }

    const playbackState = await getPlaybackState(user.accessToken)
    const { progress_ms, is_playing } = playbackState.data

    const track = playbackState.data.item
    const { artists, album, duration_ms, name } = track
    const data: RoomPlaybackStateData = { name, is_playing, progress_ms, artists, album, duration_ms }

    socket.to(roomId).emit('trackUpdate', data)
    // Send data to the owner of the socket if one exists
    socket instanceof Socket && socket.emit('trackUpdate', data)
}

export async function getRoomOwnerToken(roomId: string) {
    const room = getRoom(roomId)
    if (!room) {
        throw new Error('no room') // FIXME handle error
    }

    const user = await getUserBySpotifyId(room.ownerSpotifyId)

    if (!user) {
        throw new Error('no user') // FIXME handle error
    }

    return user.accessToken
}
