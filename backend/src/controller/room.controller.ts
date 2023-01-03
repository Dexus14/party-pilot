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
import {encodeAuthData, verifyJwtRoomUser} from "../service/auth.service";
import {
    checkIsFacebookBrowser,
    getAppUrl,
    getRoomCreateLink,
    getRoomJoinErorrMessage
} from "../service/utils.service";

export async function roomCreateGet(req: express.Request, res: express.Response) {
    try {
        const authData = await authSpotify(req, false, getRoomCreateLink(req))
        const ownerData = await getSpotifyUserData(authData.access_token)

        const roomId = await createOrGetRoom(authData, ownerData.data.id)

        // TODO: maybe generate random username?
        const roomUserData = req.cookies.roomUser
        if (roomUserData && roomAndUserExists(roomId, roomUserData.id)) {
            return res.redirect(getAppUrl(req))
        }

        let roomUser = getRoomOwner(roomId)
        if(!roomUser) {
            roomUser = createRoomUser(roomId, 'owner', true)
        }

        return res.cookie('roomUser', encodeAuthData(roomUser), {
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }).redirect(getAppUrl(req))
    } catch (e) {
        res.status(500).send('Error while creating room') // TODO: add error site
    }
}

export async function roomAuthGet(req: express.Request, res: express.Response) {
    if(req?.query?.destroy === '1') {
        const url = getSpotifyAuthLink(true)
        return res.redirect(url)
    }

    const url = getSpotifyAuthLink(false, getRoomCreateLink(req))
    res.redirect(url)
}

export async function roomJoinGet(req: express.Request, res: express.Response) {
    const isFacebookBrowser = checkIsFacebookBrowser(req.headers['user-agent'] ?? '')

    const roomId = req?.params?.roomId ?? ''
    let error = req?.query?.error ?? ''
    if(error !== ''  && typeof error === 'string') {
        error = getRoomJoinErorrMessage(error)
    }

    res.render('roomJoin', { roomId, error, isFacebookBrowser })
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
    if(req.cookies.roomUser !== undefined) {
        const roomUserData = verifyJwtRoomUser(req.cookies.roomUser)
        if(roomUserData.roomId !== roomId) {
            removeRoomUser(roomUserData.roomId, roomUserData.id)
        } else {
            return res.redirect(getAppUrl(req))
        }
    }

    // Do nothing if he already is in the room
    const roomUser = createRoomUser(roomId, username)

    return res.cookie('roomUser', encodeAuthData(roomUser), {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }).redirect(getAppUrl(req))
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
