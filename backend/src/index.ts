import {Server} from "socket.io";
import express from 'express'
import cookieParser from "cookie-parser";
import roomRoutes from "./routes/room.routes";
import * as path from "path";
import morgan from 'morgan'
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "./interafce/socketInterfaces";
import {createWebsocketListeners} from "./service/websocket.service";
import {updateRoomTracksIntervally} from "./service/rooms.service";
require('dotenv').config()

// EXPRESS server setup -------------------------------------------------------------------------------------------

export const app = express()

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));
app.use(cookieParser())
app.use(express.urlencoded({
    extended: true
}))
// Logging middleware
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.listen(process.env.APP_PORT, () => {
    console.log('Started listening on port ' + process.env.APP_PORT)
})

app.get('/', (req, res) => {
    res.render('main')
})

app.use('/room', roomRoutes)

// Path for static files required by React app
app.use(express.static(path.join(__dirname, '../../frontend/build')))

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'))
})

// Unknown request handler
app.use((req, res) => {
    res.send('404');
});

// WEBSOCKET server setup --------------------------------------------------------------------------------------------

export const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
    >(8000, {
    cors: {
        origin: ['http://192.168.8.108:' + process.env.APP_PORT], // TODO: Change this to production URL when deploying
        credentials: true
    },
    cookie: true
})

createWebsocketListeners(io)
updateRoomTracksIntervally(io)
