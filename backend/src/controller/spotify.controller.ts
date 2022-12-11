import express from "express";
import {getRoomOwnerToken} from "../service/websocketUtils.service";
import {searchSong} from "../service/spotifyApi.service";
import {mapSongsData} from "../service/spotifyUtils.service";

export async function getSpotifySearchSong(req: express.Request, res: express.Response) {
    const roomId = req.cookies.roomUser.roomId // TODO: Add proper auth
    if(!roomId) {
        return res.status(403).send('You are not in a room')
    }

    const accessToken = await getRoomOwnerToken(roomId)
    const query = req.query.q
    if(!query || typeof query !== 'string') {
        return res.status(400).send('Invalid or missing query')
    }

    try {
        const response = await searchSong(accessToken, query)
        const formattedResponse = mapSongsData(response.data.tracks.items)

        res.send(formattedResponse)
    } catch(e) {
        res.status(500).send('Error while searching song')
    }
}
