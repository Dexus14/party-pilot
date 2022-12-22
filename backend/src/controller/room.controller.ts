import {authSpotify, getSpotifyUserData} from "../service/spotifyApi.service";
import {
    createOrGetRoom,
    createRoomUser, destroyRoomByOwnerId,
    getRoomOwner,
    removeRoomUser,
    roomAndUserExists,
    roomExists
} from "../service/rooms.service";
import express from "express";
import {getSpotifyAuthLink} from "../service/spotifyUtils.service";
import jwt from "jsonwebtoken";
import {encodeAuthData, verifyJwtRoomUser} from "../service/auth.service";

export async function roomCreateGet(req: express.Request, res: express.Response) {
    try {
        const authData = await authSpotify(req)
        const ownerData = await getSpotifyUserData(authData.access_token)

        const roomId = await createOrGetRoom(authData, ownerData.data.id)

        // TODO: maybe generate random username?
        const roomUserData = req.cookies.roomUser
        if (roomUserData && roomAndUserExists(roomId, roomUserData.id)) {
            return res.redirect(process.env.APP_URL ?? '')
        }

        let roomUser = getRoomOwner(roomId)
        if(!roomUser) {
            roomUser = createRoomUser(roomId, 'owner', true)
        }

        return res.cookie('roomUser', encodeAuthData(roomUser), {
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }).redirect(process.env.APP_URL ?? '')
    } catch (e) {
        res.status(500).send('Error while creating room') // TODO: add error site
    }
}

export async function roomAuthGet(req: express.Request, res: express.Response) {
    if(req?.query?.destroy === '1') {
        const url = getSpotifyAuthLink(true)
        return res.redirect(url)
    }

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
    const roomUserData = verifyJwtRoomUser(req.cookies.roomUser)
    if(roomUserData !== undefined && roomUserData.roomId !== roomId) {
        removeRoomUser(roomUserData.roomId, roomUserData.id)
    }

    // Do nothing if he already is in the room
    if(roomUserData === undefined || roomUserData.roomId !== roomId) {
        const roomUser = createRoomUser(roomId, username)

        return res.cookie('roomUser', encodeAuthData(roomUser), {
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }).redirect(process.env.APP_URL ?? '')
    }

    res.redirect(process.env.APP_URL ?? '')
}

// TODO: In the future consider adding a way to remove room by user email
export async function destroyRoomGet(req: express.Request, res: express.Response) {
    try {
        const authData = await authSpotify(req, true)
        const ownerData = await getSpotifyUserData(authData.access_token)

        destroyRoomByOwnerId(ownerData.data.id)

        res.redirect('/?success=roomDestroyed')
    } catch (e) {
        return res.redirect('/?error=errorDestroying')
    }
}
