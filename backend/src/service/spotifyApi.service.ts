import {Request} from "express";
import axios from "axios";
import {encodeFormData} from "./utils.service";
import {getSpotifyAuthString} from "./spotifyUtils.service";

export const SPOTFIY_SCOPES = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing'
export const SPOTIFY_AUTH_API_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_AUTH_API_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

export async function authSpotify(req: Request) {
    const code = req.query.code

    const authString = 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')

    const parsedFormData = encodeFormData({
        code,
        redirect_uri: process.env.SPOTIFY_AUTH_REDIRECT_URL,
        grant_type: 'authorization_code'
    })

    const res = await axios.post(SPOTIFY_AUTH_API_TOKEN_URL, parsedFormData, {
        headers: {
            'Authorization': authString,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    })

    return res.data
}

export async function refreshToken(refreshToken: string) {
    const authString = getSpotifyAuthString()

    const parsedFormData = encodeFormData({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
    })

    const res = await axios.post(SPOTIFY_AUTH_API_TOKEN_URL, parsedFormData, {
        headers: {
            'Authorization': authString,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })

    return res.data
}

export function getSpotifyUserData(accessToken: string) {
    return makeGetRequest('/me', accessToken)
}

export function getPlaybackState(accessToken: string) {
    return makeGetRequest('/me/player', accessToken)
}

export function previousSong(accessToken: string) {
    return makePostRequest('/me/player/previous', accessToken)
}

export function nextSong(accessToken: string) {
    return makePostRequest('/me/player/next', accessToken)
}

export function pauseSong(accessToken: string) {
    return makePutRequest('/me/player/pause', accessToken)
}

export function resumeSong(accessToken: string) {
    return makePutRequest('/me/player/play', accessToken)
}

export function searchSong(accessToken: string, query: string) {
    return makeGetRequest('/search', accessToken, {
        q: query,
        type: 'track',
        limit: 3
    })
}

export function addSongToQueue(accessToken: string, songId: string) {
    return makePostRequest('/me/player/queue', accessToken, {}, { uri: songId })
}

export function getQueue(accessToken: string) {
    return makeGetRequest('/me/player/queue', accessToken)
}

function makeGetRequest(gate: string, accessToken: string, params = {}) {
    const url = SPOTIFY_API_URL + gate
    return axios.get(url, {
        params,
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
}
function makePostRequest(gate: string, accessToken: string, body: any = {}, params: any = {}) {
    const url = SPOTIFY_API_URL + gate
    return axios.post(url, body, {
        params,
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
}

function makePutRequest(gate: string, accessToken: string) {
    const url = SPOTIFY_API_URL + gate
    return axios.put(url, {}, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
}

