import querystring from "querystring";
import {refreshToken, SPOTFIY_SCOPES, SPOTIFY_AUTH_API_URL} from "./spotifyApi.service";
import {randomString} from "./utils.service";
import {Prisma} from "@prisma/client";
import {updateUser} from "./database.service";

export function getSpotifyAuthLink(redirectToDestroy: boolean = false) {
    return SPOTIFY_AUTH_API_URL + '?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: SPOTFIY_SCOPES,
            redirect_uri: redirectToDestroy ? process.env.SPOTIFY_DESTROY_REDIRECT_URL : process.env.SPOTIFY_AUTH_REDIRECT_URL,
            state: randomString(16) // FIXME: How to use this state properly?
        })
}

export async function refreshTokenIfNeeded(user: Prisma.UserGetPayload<{}>) {
    const now = new Date()
    const lastRefresh = new Date(user.lastRefresh)
    const diff = now.getTime() - lastRefresh.getTime()
    if(!process.env.SPOTIFY_TOKEN_LIFETIME_MILLIS) {
        throw new Error('SPOTIFY_TOKEN_LIFETIME_MILLIS is not set')
    }
    const tokenLifetime = parseInt(process.env.SPOTIFY_TOKEN_LIFETIME_MILLIS)

    if(diff > tokenLifetime) {
        const result = await refreshToken(user.refreshToken)
        const newAccessToken = result.access_token
        const newRefreshToken = result.refresh_token
        const updatedUser = await updateUser({
            spotifyId: user.spotifyId,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        })

        return updatedUser.accessToken
    }

    return user.accessToken
}


export function getSpotifyAuthString() {
    return 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
}

export function mapSongsData(songs: any[]) {
    return songs.map((item: any) => {
        return {
            uri: item.uri,
            name: item.name,
            artists: item.artists.map((artist: any) => artist.name).join(', '),
            album: item.album.name,
            albumImage: item.album.images[1].url,
            duration: item.duration_ms,
        }
    })
}
