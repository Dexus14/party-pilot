import {authSpotify} from "../service/spotifyApi.service";
import {createOrGetRoom, createRoomUser, removeRoomUser, roomExists} from "../service/rooms.service";
import express from "express";
import {getSpotifyAuthLink} from "../service/spotifyUtils.service";

export async function roomCreateGet(req: express.Request, res: express.Response) {
    const ownerData = await authSpotify(req)

    const roomId = await createOrGetRoom(ownerData)

    res.redirect(`/room/join/${roomId}`)
}

export async function roomAuthGet(req: express.Request, res: express.Response) {
    const url = getSpotifyAuthLink()
    res.redirect(url)
}

export async function roomJoinGet(req: express.Request, res: express.Response) {
    const roomId = req?.params?.roomId ?? ''

    res.render('roomJoin', { roomId })
}

export async function roomJoinPost(req: express.Request, res: express.Response) {
    const {roomId, username} = req.body
    if(!roomId || !username) {
        return res.redirect('/room/join?error=missingParameters')
    }

    const roomExistance = roomExists(roomId)
    if(!roomExistance) {
        return res.redirect('/room/join?error=roomDoesNotExist')
    }

    // If user is already in room, remove him from old room
    const roomUserData = req.cookies.roomUser
    if(roomUserData !== undefined && roomUserData.roomId !== roomId) {
        removeRoomUser(roomUserData.roomId, roomUserData.id)
    }

    // Do nothing if he already is in the room
    if(roomUserData === undefined || roomUserData.roomId !== roomId) {
        const roomUser = createRoomUser(roomId, username)
        return res.cookie('roomUser', roomUser, {
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }).redirect(process.env.APP_URL ?? '')
    }

    res.redirect('/app')
}
