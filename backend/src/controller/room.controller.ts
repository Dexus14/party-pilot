import {auth} from "../service/spotify.service";
import {createOrGetRoom, getRoom, setRoom} from "../service/rooms.service";
import express from "express";
import querystring from "querystring";
import {randomString} from "../service/utils.service";

export async function roomCreate(req: express.Request, res: express.Response) {
    const ownerData = await auth(req)

    const roomId = await createOrGetRoom(ownerData)

    res
        .redirect(`/room/join/${roomId}`)
}

export async function roomAuth(req: express.Request, res: express.Response) {
    // TODO: Checkout the parameters etc
    const url = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: 'user-read-private user-read-email', // TODO: Add scopes in better way
            redirect_uri: process.env.SPOTIFY_AUTH_REDIRECT_URL,
            state: randomString(16) // FIXME: How to use this state properly?
        })
    res.redirect(url)
}

export async function roomJoinGet(req: express.Request, res: express.Response) {
    const roomId = req?.params?.roomId ?? ''

    res.render('roomJoin', { roomId })
}

export async function roomJoinPost(req: express.Request, res: express.Response) {
    const roomId = req?.body?.roomId as string
    const name = req?.body?.username as string

    const room = await getRoom(roomId)

    if(!room || !name) {
        return res.redirect('/room/join/' + roomId)
    }

    const roomUserData = req.cookies.roomUser

    if(roomUserData !== undefined && roomUserData.roomId !== roomId) {
        // If the user was in a different room remove him from it
        const otherRoom = await getRoom(roomUserData.roomId)
        if(otherRoom) {
            otherRoom.users = otherRoom.users.filter(user => user.id !== roomUserData.id)

            setRoom(otherRoom)
        }
    }

    if(roomUserData === undefined || roomUserData.roomId !== roomId) {
        room.users.push({
            id: randomString(4),
            name,
            roomId
        })

        setRoom(room)

        res.cookie('roomUser', room.users[room.users.length - 1])
    }

    res.redirect('/app')
}

export async function room(req: express.Request, res: express.Response) {
    const roomId = req.params.roomId
    const room = await getRoom(roomId)

    if(!room) {
        return res.send('no such room!')
    }

    res.send(room)
}
