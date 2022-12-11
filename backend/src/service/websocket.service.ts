import {Server, Socket} from "socket.io";
import {getQueueWithRoomUsers, roomUserAddSong, setRoomUserActive} from "./rooms.service";
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "../interafce/socketInterfaces";
import {addSongToQueue, nextSong, pauseSong, previousSong, resumeSong} from "./spotifyApi.service";
import {
    socketConnectToRoom,
    getRoomAndUserFromCookie,
    socketAuthMiddleware,
    socketRoomUpdate, updateRoomTrack, getRoomOwnerToken, handleSocketError
} from "./websocketUtils.service";

export function createWebsocketListeners(io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
    >) {

    io.use(socketAuthMiddleware)

    io.on('connection', async (socket) => {
        const {roomId, userRoomId} = getRoomAndUserFromCookie(socket.handshake.headers.cookie ?? '')

        try {
            socketConnectToRoom(socket, roomId)
            setRoomUserActive(roomId, userRoomId, true)
            await updateRoomTrack(roomId, socket)
            await socketRoomUpdate(io, roomId)
            socket.emit('roomQueueUpdate', await getQueueWithRoomUsers(roomId))
        } catch(e) {
            if(e instanceof Error) {
                handleSocketError(socket, e, false, true)
            } else {
                throw new Error('socketConnection: Unknown error')
            }
        }

        // Event listeners
        socket.on('songPrevious', () => eventSongPrevious(socket, roomId))
        socket.on('songNext', () => eventSongNext(socket, roomId))
        socket.on('songPause', () => eventSongPause(socket, roomId))
        socket.on('songResume', () => eventSongResume(socket, roomId))
        socket.on('songAddToQueue', (songUri) => eventSongAddToQueue(socket, roomId, userRoomId, songUri))

        socket.on('disconnect', () => eventDisconnect(socket, roomId, userRoomId))
    })
}

async function eventSongPrevious(socket: Socket, roomId: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        await previousSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        handleSocketError(socket, e, true)
    }
}

async function eventSongNext(socket: Socket, roomId: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        await nextSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        handleSocketError(socket, e, true)
    }
}

async function eventSongPause(socket: Socket, roomId: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        await pauseSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        handleSocketError(socket, e, true)
    }
}

async function eventSongResume(socket: Socket, roomId: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        await resumeSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        handleSocketError(socket, e, true)
    }
}

async function eventSongAddToQueue(socket: Socket, roomId: string, userRoomId: string, songUri: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        await addSongToQueue(accessToken, songUri)
        roomUserAddSong(roomId, userRoomId, songUri)

        const queueWithUserData = await getQueueWithRoomUsers(roomId)
        socket.emit('roomQueueUpdate', queueWithUserData)
        socket.to(roomId).emit('roomQueueUpdate', queueWithUserData)
    } catch(e) {
        handleSocketError(socket, e, true)
    }
}

async function eventDisconnect(socket: Socket, roomId: string, userRoomId: string) {
    setRoomUserActive(roomId, userRoomId, false)
    await socketRoomUpdate(socket, roomId)
}
