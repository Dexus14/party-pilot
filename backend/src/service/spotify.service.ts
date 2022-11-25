import {Request} from "express";
import axios from "axios";

const encodeFormData = (data: any) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
}

export async function auth(req: Request) {
    const code = req.query.code as string || null
    const state = req.query.state || null

    // TODO: Check body params in a better way
    if(!code) {
        console.error('no code')
        return
    }

    if(state === null) {
        console.error('no state')
        return
    }

    const authString = 'Basic ' + Buffer.from('2ca454e3515b49328830ec5a9b2fd8b6' + ':' + '3eab9097ffea4a1a8a934308fef60137').toString('base64')

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
