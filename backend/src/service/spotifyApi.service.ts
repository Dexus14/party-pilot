import {Request} from "express";
import axios from "axios";
import {encodeFormData} from "./utils.service";

export const SPOTFIY_SCOPES = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing'
export const SPOTIFY_AUTH_API_URL = 'https://accounts.spotify.com/authorize'

// FIMXE: IMPORTANT - REFRESH TOKEN SOMETIMES
export async function authSpotify(req: Request) {
    const code = req.query.code

    const authString = 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')

    const parsedFormData = encodeFormData({
        code,
        redirect_uri: process.env.SPOTIFY_AUTH_REDIRECT_URL,
        grant_type: 'authorization_code'
    })

    // TODO: Handle error
    const res = await axios.post('https://accounts.spotify.com/api/token', parsedFormData, {
        headers: {
            'Authorization': authString,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    })

    return res.data
}

export function getUserData(accessToken: string) {
    return makeGetRequest('https://api.spotify.com/v1/me', accessToken)
}

export function getPlaybackState(accessToken: string) {
    return makeGetRequest('https://api.spotify.com/v1/me/player', accessToken)
}

export function previousSong(accessToken: string) {
    return makePostRequest('https://api.spotify.com/v1/me/player/previous', accessToken)
}

export function nextSong(accessToken: string) {
    return makePostRequest('https://api.spotify.com/v1/me/player/next', accessToken)
}

export function pauseSong(accessToken: string) {
    return makePutRequest('https://api.spotify.com/v1/me/player/pause', accessToken)
}

export function resumeSong(accessToken: string) {
    return makePutRequest('https://api.spotify.com/v1/me/player/play', accessToken)
}

export function searchSong(accessToken: string, query: string) {
    return makeGetRequest('https://api.spotify.com/v1/search', accessToken, {
        q: query,
        type: 'track',
        limit: 3
    })
}

export function addSongToQueue(accessToken: string, songId: string) {
    return makePostRequest('https://api.spotify.com/v1/me/player/queue', accessToken, {}, { uri: songId })
}

export function getQueue(accessToken: string) {
    return makeGetRequest('https://api.spotify.com/v1/me/player/queue', accessToken)
}

function makeGetRequest(url: string, accessToken: string, params = {}) {
    return axios.get(url, {
        params,
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
}
function makePostRequest(url: string, accessToken: string, body: any = {}, params: any = {}) {
    return axios.post(url, body, {
        params,
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
}

function makePutRequest(url: string, accessToken: string) {
    return axios.put(url, {}, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
}

