import {Server} from "socket.io";
import express from 'express'
import cookieParser from "cookie-parser";
import roomRoutes from "./routes/roomRoutes";
import * as path from "path";
import morgan from 'morgan'
import {
    ClientToServerEvents,
    createWebsocketListeners,
    InterServerEvents,
    ServerToClientEvents,
    SocketData
} from "./service/websocket.service";
require('dotenv').config()

export const app = express()

app.set('view engine', 'ejs');
app.set('views', '/home/adaml/Documents/noldjs/partify/backend/src/views'); // TODO: Add concat with path
app.use(cookieParser())
app.use(express.urlencoded({
    extended: true
}))
// app.use(morgan('dev'))

app.listen(3002, () => {
    console.log('listening')
})

app.get('/', (req, res) => {
    res.render('main')
})

app.use('/room', roomRoutes)

app.use(express.static(path.join(__dirname, '../../frontend/build')))
// app.use(express.static(path.join(__dirname, '../../frontend/build')))

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'))
})

app.use((req, res) => {
    res.send('404');
});

// SOCKET --------------------------------------------------------------------------------------------

const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
    >(8000, {
    cors: {
        origin: ['http://localhost:3002'],
        credentials: true
    },
    cookie: true
})

createWebsocketListeners(io)
