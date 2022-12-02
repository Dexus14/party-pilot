import {Server, Socket} from "socket.io";
import {getRoom, roomAndUserExists, roomExists} from "./rooms.service";
import cookieParser from "cookie-parser";
import cookie from 'cookie'
import {ExtendedError} from "socket.io/dist/namespace";

export function socketConnectToRoom(socket: Socket, roomId: string) {
    const roomExistsance = roomExists(roomId ?? '')

    if(!roomId || !roomExistsance) {
        throw new Error('This room does not exist.')
    }

    socket.join(roomId)
}

export function socketRoomUpdate(socket: Server|Socket, roomId: string) {
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
