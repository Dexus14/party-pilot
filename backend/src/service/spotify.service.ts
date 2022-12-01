import {Request} from "express";
import axios from "axios";
import {encodeFormData} from "./utils.service";

export async function auth(req: Request) {
    const code = req.query.code
    const state = req.query.state

    // TODO: Check body params in a better way
    if(
        typeof code !== 'string' ||
        typeof  state !== 'string'
    ) {
        console.error('No code, state or wrong type during authentication.')
        return
    }

    const authString = 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')

    const parsedFormData = encodeFormData({
        code,
        redirect_uri: 'http://localhost:3002/room/create',
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

function makeGetRequest(url: string, accessToken: string, params = {}) {
    return axios.get(url, {
        params,
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
}
