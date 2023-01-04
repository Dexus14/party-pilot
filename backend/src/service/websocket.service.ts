import {Server, Socket} from "socket.io";
import {
    canUserAddSong, destroyRoom,
    getQueueWithRoomUsers,
    getRoomUser,
    roomUserAddSong,
    setRoomUserActive,
    updateRoomOptions
} from "./rooms.service";
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "../interafce/socketInterfaces";
import {addSongToQueue, nextSong, pauseSong, previousSong, resumeSong} from "./spotifyApi.service";
import {
    socketConnectToRoom,
    getRoomAndUserFromWsHandshakeCookie,
    socketAuthMiddleware,
    socketRoomUpdate, updateRoomTrack, getRoomOwnerToken, handleSocketError, updateRoomQueue
} from "./websocketUtils.service";

export function createWebsocketListeners(io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
    >) {

    io.use(socketAuthMiddleware)

    io.on('connection', async (socket) => {
        const {roomId, userRoomId} = getRoomAndUserFromWsHandshakeCookie(socket.handshake.headers.cookie ?? '')

        try {
            socketConnectToRoom(socket, roomId)
            setRoomUserActive(roomId, userRoomId, true)
            await updateRoomTrack(roomId, socket)
            await socketRoomUpdate(io, roomId)
            await updateRoomQueue(roomId, socket)
        } catch(e) {
            if(e instanceof Error) {
                console.log(e.message)
                handleSocketError(socket, e, false)
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
        socket.on('updateRoomOptions', (options) => eventUpdateRoomOptions(socket, roomId, userRoomId, options))
        socket.on('roomDestroy', () => eventRoomDestroy(socket, roomId, userRoomId))
        socket.on('activeUpdate', (active) => eventUpdateActivity(socket, roomId, userRoomId, active))

        socket.on('disconnect', () => eventDisconnect(socket, roomId, userRoomId))
    })
}

async function eventSongPrevious(socket: Socket, roomId: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        await previousSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        handleSocketError(socket, e, false)
    }
}

async function eventSongNext(socket: Socket, roomId: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        await nextSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        handleSocketError(socket, e, false)
    }
}

async function eventSongPause(socket: Socket, roomId: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        await pauseSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        handleSocketError(socket, e, false)
    }
}

async function eventSongResume(socket: Socket, roomId: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        await resumeSong(accessToken)
        await updateRoomTrack(roomId, socket)
    } catch(e) {
        handleSocketError(socket, e, false)
    }
}

async function eventSongAddToQueue(socket: Socket, roomId: string, userRoomId: string, songUri: string) {
    try {
        const accessToken = await getRoomOwnerToken(roomId)

        if(!canUserAddSong(roomId, userRoomId)) {
            return socket.emit('overSongLimit')
        }

        await addSongToQueue(accessToken, songUri)
        roomUserAddSong(roomId, userRoomId, songUri)

        const queueWithUserData = await getQueueWithRoomUsers(roomId)
        socket.emit('roomQueueUpdate', queueWithUserData)
        socket.to(roomId).emit('roomQueueUpdate', queueWithUserData)
    } catch(e) {
        handleSocketError(socket, e, false)
    }
}

async function eventUpdateRoomOptions(socket: Socket, roomId: string, userRoomId: string, options: RoomOptions) {
    try {
        const roomUser = getRoomUser(roomId, userRoomId)

        if(!roomUser.isOwner) {
            return handleSocketError(socket, new Error('Only the owner can change options.'), false)
        }

        updateRoomOptions(roomId, options)
        await socketRoomUpdate(socket, roomId, true)
    } catch(e) {
        handleSocketError(socket, e, false)
    }
}

async function eventDisconnect(socket: Socket, roomId: string, userRoomId: string) {
    try {
        setRoomUserActive(roomId, userRoomId, false)
        await socketRoomUpdate(socket, roomId)
    } catch(e) {
        handleSocketError(socket, e, false)
    }
}

async function eventRoomDestroy(socket: Socket, roomId: string, userRoomId: string) {
    try {
        const roomUser = getRoomUser(roomId, userRoomId)

        if(!roomUser.isOwner) {
            return handleSocketError(socket, new Error('Only the owner can change destroy the room.'), false)
        }

        destroyRoom(roomId)
        socket.emit('roomDestroyed')
        socket.to(roomId).emit('roomDestroyed')
    } catch(e) {
        handleSocketError(socket, e, false)
    }
}

async function eventUpdateActivity(socket: Socket, roomId: string, userRoomId: string, active: boolean) {
    try {
        setRoomUserActive(roomId, userRoomId, active)
        await socketRoomUpdate(socket, roomId)
    } catch(e) {
        handleSocketError(socket, e, false)
    }
}
