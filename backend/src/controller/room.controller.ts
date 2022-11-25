import {auth} from "../service/spotify.service";
import {createOrGetRoom, getRoom, setRoom} from "../service/rooms.service";
import express from "express";
import querystring from "querystring";
import {randomString} from "../service/utils.service";

export async function roomCreate(req: express.Request, res: express.Response) {
    const ownerData = await auth(req)

    const roomId = await createOrGetRoom(ownerData)
    const room = await getRoom(roomId)

    res
        .redirect(`/room/join/${roomId}`)
}

export async function roomAuth(req: express.Request, res: express.Response) {
    // TODO: Checkout the parameters etc
    const url = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: '2ca454e3515b49328830ec5a9b2fd8b6',
            scope: 'user-read-private user-read-email',
            redirect_uri: 'http://localhost:3002/room/create',
            state: randomString(16) // FIXME: How to use this state properly?
        })
    console.log(url)
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

    console.log(room)
    console.log(roomId)
    console.log(name)

    if(!room || !name) {
        return res.redirect('/room/join/' + roomId)
    }

    const roomUserData = req.cookies.roomUser

    if(!roomUserData || roomUserData.roomId !== roomId) {
        room.users.push({
            id: randomString(4),
            name,
            roomId
        })

        setRoom(roomId, room)

        res.cookie('roomUser', room.users[room.users.length - 1])
    }

    res.redirect('http://localhost:3000')
}

export async function room(req: express.Request, res: express.Response) {
    const roomId = req.params.roomId
    const room = await getRoom(roomId)

    if(!room) {
        return res.send('no such room!')
    }

    res.send(room)
}
