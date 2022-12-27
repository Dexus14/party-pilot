import {Server} from "socket.io";
import express from 'express'
import cookieParser from "cookie-parser";
import roomRoutes from "./routes/room.routes";
import * as path from "path";
import morgan from 'morgan'
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "./interafce/socketInterfaces";
import {createWebsocketListeners} from "./service/websocket.service";
import {updateRoomTracksIntervally} from "./service/rooms.service";
import spotifyRoutes from "./routes/spotify.routes";
require('dotenv').config()

if(process.env.APP_ENV === 'dev' && !process.env.APP_URL) {
    throw new Error('APP_URL is not defined')
}

export const APP_URL = process.env.APP_ENV === 'dev' ? process.env.APP_DEV_URL as string : process.env.RENDER_EXTERNAL_URL + '/app' as string

if(!APP_URL) {
    throw new Error('APP_URL is not defined')
}

export const SPOTIFY_AUTH_REDIRECT_URL = APP_URL + '/room/create'
export const SPOTIFY_DESTROY_REDIRECT_URL = APP_URL + '/room/destroy'

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

app.listen(process.env.PORT, () => {
    console.log('Started listening on port ' + process.env.PORT)
})

app.get('/', (req, res) => {
    res.render('main')
})

app.use('/room', roomRoutes)
app.use('/api/spotify', spotifyRoutes)

// Path for static files required by React app
app.use(express.static(path.join(__dirname, '../../frontend/build')))
// Public path
app.use(express.static(path.join(__dirname, '../src/views/public')))

app.get('/app', async (req, res) => {
    process.env.APP_ENV === 'dev' ?
        res.redirect(APP_URL ?? '') :
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
        origin: [APP_URL],
        credentials: true
    },
    cookie: true
})

createWebsocketListeners(io)
updateRoomTracksIntervally(io)
