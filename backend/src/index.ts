import {Server} from "socket.io";
import express from 'express'
import cors from 'cors'
import {getRoom, roomExists} from "./service/rooms.service";
import cookieParser from "cookie-parser";
import roomRoutes from "./routes/roomRoutes";
require('dotenv').config()

export const app = express()

app.set('view engine', 'ejs');
app.set('views', '/home/adaml/Documents/noldjs/partify/backend/src/views'); // TODO: Add concat with path
app.use(cors({
    origin: 'http://localhost:3000'
}))
app.use(cookieParser())
app.use(express.urlencoded({
    extended: true
}))

app.listen(3002, () => {
    console.log('listening')
})

app.use('/room', roomRoutes)

app.get('/', (req, res) => {
    res.render('index')
})

app.use((req, res) => {
    res.send('404');
});

// SOCKET --------------------------------------------------------------------------------------------

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    roomUpdate: (room: any) => void;
}

interface ClientToServerEvents {
    roomJoin: (message: string, roomId: string) => void;
}

interface InterServerEvents {
    ping: (room: any) => void;
}

interface SocketData {
    message: string;
    roomId: string;
}

const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
    >(8000, {
        cors: {
            origin: ['http://localhost:3000']
        }
})

io.use((socket, next) => {
    const roomExistsStatus = roomExists(socket.data.roomId ?? '')

    if(!roomExistsStatus) {
        return next(new Error('This room does not exist.'))
    }

    next()
})

io.on('connection', (socket) => {
    console.log('connected')

    socket.on('roomJoin', (message, roomId) => {
        socket.join(roomId)

        socket.to(socket.id)
        socket.to(socket.data.roomId ?? '').emit('roomUpdate', socketRoomUpdate(roomId))
    })

})

function socketRoomUpdate(roomId: string) {
    const room = getRoom(roomId)
    io.to(roomId).emit('roomUpdate', room)
}
