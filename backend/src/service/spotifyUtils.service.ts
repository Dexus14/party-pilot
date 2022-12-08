import querystring from "querystring";
import {SPOTFIY_SCOPES, SPOTIFY_AUTH_API_URL} from "./spotifyApi.service";
import {randomString} from "./utils.service";

export function getSpotifyAuthLink() {
    return SPOTIFY_AUTH_API_URL + '?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: SPOTFIY_SCOPES,
            redirect_uri: process.env.SPOTIFY_AUTH_REDIRECT_URL,
            state: randomString(16) // FIXME: How to use this state properly?
        })
}
