import {authSpotify} from "../service/spotifyApi.service";
import {createOrGetRoom, createRoomUser, getRoom, removeRoomUser, roomExists, setRoom} from "../service/rooms.service";
import express from "express";
import {getSpotifyAuthLink} from "../service/spotifyUtils.service";

export async function getRoomCreate(req: express.Request, res: express.Response) {
    const ownerData = await authSpotify(req)

    const roomId = await createOrGetRoom(ownerData)

    res.redirect(`/room/join/${roomId}`)
}

export async function getRoomAuth(req: express.Request, res: express.Response) {
    const url = getSpotifyAuthLink()
    res.redirect(url)
}

export async function roomJoinGet(req: express.Request, res: express.Response) {
    const roomId = req?.params?.roomId ?? ''

    res.render('roomJoin', { roomId })
}

export async function roomJoinPost(req: express.Request, res: express.Response) {
    // Get request parameters
    const {roomId, username} = req.body
    if(!roomId || !username) {
        console.log('Missing parameters')
        return res.redirect('/room/join') // TODO: Show error
    }

    // Check room existance
    const roomExistance = roomExists(roomId)
    if(!roomExistance) {
        console.log('Room does not exist')
        return res.redirect('/room/join/' + roomId)
    }

    // If user is already in room, remove him from old room
    const roomUserData = req.cookies.roomUser
    if(roomUserData !== undefined && roomUserData.roomId !== roomId) {
        removeRoomUser(roomUserData.roomId, roomUserData.id)
    }

    // Do nothing if he already is in the room
    if(roomUserData === undefined || roomUserData.roomId !== roomId) {
        const roomUser = createRoomUser(roomId, username)
        res.cookie('roomUser', roomUser)
    }

    res.redirect('/app')
}
