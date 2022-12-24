import {Server, Socket} from "socket.io";
import {getQueueWithRoomUsers, getRoom, roomAndUserExists, roomExists} from "./rooms.service";
import cookieParser from "cookie-parser";
import cookie from 'cookie'
import {ExtendedError} from "socket.io/dist/namespace";
import {getPlaybackState} from "./spotifyApi.service";
import {verifyJwtRoomUser} from "./auth.service";

export function socketConnectToRoom(socket: Socket, roomId: string) {
    const roomExistsance = roomExists(roomId ?? '')

    if(!roomId || !roomExistsance) {
        throw new Error('This room does not exist.')
    }

    socket.join(roomId)
}

export async function socketRoomUpdate(socket: Server|Socket, roomId: string, emitToSelf = false) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('This room does not exist.')
    }

    socket.to(roomId).emit('roomUpdate', room)
    emitToSelf && socket.emit('roomUpdate', room)
}

export function getRoomAndUserFromWsHandshakeCookie(cookieString: string) {
    const cookies = cookieParser.JSONCookies(cookie.parse(cookieString))
    const roomUserCookie = cookies?.roomUser as string|undefined

    if(!roomUserCookie) {
        throw new Error('No roomUser cookie found.')
    }

    const userData = verifyJwtRoomUser(roomUserCookie)

    return { roomId: userData.roomId, userRoomId: userData.id }
}

export function socketAuthMiddleware(socket: Socket, next: (err?: ExtendedError|undefined) => void) {
    try {
        const {roomId, userRoomId} = getRoomAndUserFromWsHandshakeCookie(socket.handshake.headers.cookie ?? '')
        const roomAndUserExistance = roomAndUserExists(roomId, userRoomId)

        if(!roomAndUserExistance) {
            return next(new Error('This room does not exist.'))
        }
    } catch(e) {
        return next(new Error('Invalid cookie.'))
    }

    next()
}

export async function updateRoomTrack(roomId: string, socket: Server|Socket) {
    const room = getRoom(roomId)
    if(!room) {
        throw new Error('Room does not exist')
    }

    const accessToken = await getRoomOwnerToken(roomId)

    const playbackState = await getPlaybackState(accessToken)
    const { progress_ms, is_playing } = playbackState.data

    let data: RoomPlaybackStateData | null = null
    if(playbackState.data.item) {
        const track = playbackState.data.item
        const { artists, album, duration_ms, name } = track
        data = { name, is_playing, progress_ms, artists, album, duration_ms }
    }

    socket.to(roomId).emit('trackUpdate', data)
    // Send data to the owner of the socket if one exists
    socket instanceof Socket && socket.emit('trackUpdate', data)
}

export async function getRoomOwnerToken(roomId: string) {
    const room = getRoom(roomId)
    if (!room) {
        throw new Error('Room does not exist')
    }

    return room.accessToken
}

export async function updateRoomQueue(roomId: string, socket: Server|Socket) {
    const queue = await getQueueWithRoomUsers(roomId)

    socket.to(roomId).emit('roomQueueUpdate', queue)
    // Send data to the owner of the socket if one exists
    socket instanceof Socket && socket.emit('roomQueueUpdate', queue)
}

export function handleSocketError(socket: Socket|Server, error: any, serverError: boolean = false, fatal: boolean = false) {
    const message = serverError || !(error instanceof Error) ? 'Unknown error' : error.message

    console.error('Socket error: ', message)
    if(socket instanceof Server) {
        return
    }

    socket.emit('error', message)
    if(fatal) {
        socket.disconnect(true)
    }
}
