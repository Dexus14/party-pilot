import {Server, Socket} from "socket.io";
import {getRoom, removeRoomUser, setRoomUserActive} from "./rooms.service";
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "../interafce/socketInterfaces";
import {nextSong, previousSong} from "./spotifyApi.service";
import {getUserBySpotifyId} from "./database.service";
import {
    socketConnectToRoom,
    getRoomAndUserFromCookie,
    socketAuthMiddleware,
    socketRoomUpdate
} from "./websocketUtils.service";

export function createWebsocketListeners(io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
    >) {

    io.use(socketAuthMiddleware)

    io.on('connection', (socket) => {
        const {roomId, userRoomId} = getRoomAndUserFromCookie(socket.handshake.headers.cookie ?? '')

        try {
            socketConnectToRoom(socket, roomId)
            setRoomUserActive(roomId, userRoomId, true)
            socketRoomUpdate(io, roomId)
        } catch(e) {
            socket.to(socket.id).emit('noRoom')
        }

        // Event listeners
        socket.on('songPrevious', () => eventSongPrevious(socket, roomId))
        socket.on('songNext', () => eventSongNext(socket, roomId))

        socket.on('disconnect', () => eventDisconnect(socket, roomId, userRoomId))
    })
}

async function eventSongPrevious(socket: Socket, roomId: string) {
    const room = getRoom(roomId)
    if (!room) {
        return console.error('no room') // FIXME handle error
    }

    const user = await getUserBySpotifyId(room.ownerSpotifyId)
    if (!user) {
        return console.error('no user') // FIXME handle error
    }
    // TODO: Add trycatch
    await previousSong(user.accessToken)
}

async function eventSongNext(socket: Socket, roomId: string) {
    const room = getRoom(roomId)
    if (!room) {
        return console.error('no room') // FIXME handle error
    }

    const user = await getUserBySpotifyId(room.ownerSpotifyId)

    if (!user) {
        return console.error('no user') // FIXME handle error
    }

    // TODO: Add trycatch
    await nextSong(user.accessToken)
}

function eventDisconnect(socket: Socket, roomId: string, userRoomId: string) {
    setRoomUserActive(roomId, userRoomId, false)
    socketRoomUpdate(socket, roomId)
}
