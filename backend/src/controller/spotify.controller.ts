import express from "express";
import {getRoomOwnerToken} from "../service/websocketUtils.service";
import {searchSong} from "../service/spotifyApi.service";

export async function getSpotifySearchSong(req: express.Request, res: express.Response) {
    const roomId = req.cookies.roomUser.roomId // TODO: Add proper auth
    if(!roomId) {
        return res.status(403).send('No room id')
    }

    const accessToken = await getRoomOwnerToken(roomId)
    const query = req.query.q
    if(!query || typeof query !== 'string') {
        return res.status(400).send('Invalid or missing query')
    }

    const response = await searchSong(accessToken, query)
    const formattedResponse = response.data.tracks.items.map((item: any) => {
        return {
            id: item.id,
            name: item.name,
            artists: item.artists.map((artist: any) => artist.name).join(', '),
            album: item.album.name,
            albumImage: item.album.images[2].url,
            duration: item.duration_ms,
        }
    })

    res.send(formattedResponse)
}
