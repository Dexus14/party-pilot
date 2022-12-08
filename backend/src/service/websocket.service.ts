import {Server, Socket} from "socket.io";
import {getQueueWithRoomUsers, roomSongAdd, roomUserAddSong, setRoomUserActive} from "./rooms.service";
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "../interafce/socketInterfaces";
import {addSongToQueue, nextSong, pauseSong, previousSong, resumeSong} from "./spotifyApi.service";
import {
    socketConnectToRoom,
    getRoomAndUserFromCookie,
    socketAuthMiddleware,
    socketRoomUpdate, updateRoomTrack, getRoomOwnerToken
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
            socket.to(socket.id).emit('noRoom')
        }

        // Event listeners
        socket.on('songPrevious', () => eventSongPrevious(socket, roomId))
        socket.on('songNext', () => eventSongNext(socket, roomId))
        socket.on('songPause', () => eventSongPause(socket, roomId))
        socket.on('songResume', () => eventSongResume(socket, roomId))
        socket.on('songAddToQueue', (songId) => roomSongAdd(socket, roomId, userRoomId, songId)) // FIXME create function

        socket.on('disconnect', () => eventDisconnect(socket, roomId, userRoomId))
    })
}

async function eventSongPrevious(socket: Socket, roomId: string) {
    const accessToken = await getRoomOwnerToken(roomId)

    // TODO: Add trycatch
    await previousSong(accessToken)
    await updateRoomTrack(roomId, socket)
}

async function eventSongNext(socket: Socket, roomId: string) {
    const accessToken = await getRoomOwnerToken(roomId)

    // TODO: Add trycatch
    await nextSong(accessToken)
    await updateRoomTrack(roomId, socket)
}

async function eventSongPause(socket: Socket, roomId: string) {
    const accessToken = await getRoomOwnerToken(roomId)

    try {
        await pauseSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        console.error('error pausing song', e)
    }
}

async function eventSongResume(socket: Socket, roomId: string) {
    const accessToken = await getRoomOwnerToken(roomId)

    try {
        await resumeSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        console.error('error resuming song', e)
    }
}

function eventDisconnect(socket: Socket, roomId: string, userRoomId: string) {
    setRoomUserActive(roomId, userRoomId, false)
    socketRoomUpdate(socket, roomId)
}
