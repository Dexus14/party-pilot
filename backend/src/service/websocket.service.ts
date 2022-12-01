import {Server, Socket} from "socket.io";
import {getRoom, removeRoomUser, roomExists} from "./rooms.service";
import cookieParser from "cookie-parser";
import cookie from 'cookie'
import {ExtendedError} from "socket.io/dist/namespace";
import {room} from "../controller/room.controller";

export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    roomUpdate: (room: any) => void;
    noRoom: () => void;
    someoneHi: (username: string) => void;
}

export interface ClientToServerEvents {
    roomJoin: (message: string, roomId: string) => void;
    sayHi: () => void;
}

export interface InterServerEvents {
    ping: (room: any) => void;
}

export interface SocketData {
    message: string;
    roomId: string;
}

function getRoomAndUserFromCookie(cookieString: string) {
    // FIXME: better way to handle this?
    const cookies = cookieParser.JSONCookies(cookie.parse(cookieString))
    // @ts-ignore
    const roomId = cookies?.roomUser?.roomId
    // @ts-ignore
    const userRoomId = cookies?.roomUser?.id

    return {roomId, userRoomId}
}

function socketAuthMiddleware(socket: Socket, next: (err?: ExtendedError|undefined) => void) {
    const {roomId} = getRoomAndUserFromCookie(socket.handshake.headers.cookie ?? '')
    console.log(roomId)
    const roomExistsStatus = roomExists(roomId ?? '')
    // TODO: Add a check for userRoomId
    if(!roomExistsStatus) {
        return next(new Error('This room does not exist.'))
    }

    next()
}

export function createWebsocketListeners(io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
    >) {
    // FIXME: This function should be somewhere elso
    io.use(socketAuthMiddleware)

    io.on('connection', (socket) => {
        console.log('connected')

        try {
            connectionHandler(socket)
        } catch(e) {
            io.to(socket.id).emit('noRoom')
        }

        const {roomId, userRoomId} = getRoomAndUserFromCookie(socket.handshake.headers.cookie ?? '')
        socketRoomUpdate(io, roomId)

        socket.on('sayHi', () => {
            const {roomId, userRoomId} = getRoomAndUserFromCookie(socket.handshake.headers.cookie ?? '')

            // The room will exist as it's checked by auth middleware
            const room = getRoom(roomId) as Room

            const user = room.users.find(user => user.id === userRoomId)
            if(!user) {
                return socket.to(socket.id).emit('noRoom')
            }
            const username = user.name

            io.to(roomId).emit('someoneHi', username)
        })

        socket.on('disconnect', () => {
            removeRoomUser(roomId, userRoomId)
            socketRoomUpdate(io, roomId)
        })
    })
}

function connectionHandler(socket: Socket) {
    const {roomId, userRoomId} = getRoomAndUserFromCookie(socket.handshake.headers.cookie ?? '')
    const roomExistsance = roomExists(roomId ?? '')

    if(!roomId || !userRoomId || !roomExistsance) {
        throw new Error('This room does not exist.')
    }

    socket.join(roomId)

    socketRoomUpdate(socket, roomId)
}

function socketRoomUpdate(socket: Server|Socket, roomId: string) {
    const room = getRoom(roomId)
    if(!room) {
        return console.error('no room') // FIXME handle error
    }

    socket.to(roomId).emit('roomUpdate', room)
}
