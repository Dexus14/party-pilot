import {Artist, QueueItem} from "../../interafce/spotifyInterfaces";

export const MOCK_SPOTIFY_OWNER_ID = 'example_owner_id'
export const MOCK_SPOTIFY_OWNER_NAME = 'example_owner_name'
export const MOCK_SPOTIFY_SONG_URI = 'CBA123456:654321ABC'
export const MOCK_SPOTIFY_SONG_URI_2 = 'WCBOPL123:876WYYYS'
export const MOCK_SPOTIFY_SONG_ARTIST_1: Artist = { name: 'artist1', href: 'artist1_href' }
export const MOCK_SPOTIFY_SONG_ARTIST_2: Artist = { name: 'blur', href: 'artist2_href' }
export const MOCK_SPOTIFY_SONG_NAME = 'song_name'
export const MOCK_SPOTIFY_SONG_NAME_2 = 'song 2'

export const MOCK_SPOTIFY_AUTH_DATA = {
    access_token: 'token',
    refresh_token: 'refresh_token',
}
export const MOCK_SPOTIFY_QUEUE: QueueItem[] = [
    {
        uri: 'totally random uri not intended to be queried',
        name: MOCK_SPOTIFY_SONG_NAME,
        artists: [
            MOCK_SPOTIFY_SONG_ARTIST_1,
            MOCK_SPOTIFY_SONG_ARTIST_2,
        ]
    },
    {
        uri: MOCK_SPOTIFY_SONG_URI_2,
        name: MOCK_SPOTIFY_SONG_NAME_2,
        artists: [
            MOCK_SPOTIFY_SONG_ARTIST_2,
        ]
    }
]

export function getSpotifyUserData(accessToken: string) {
    if(accessToken !== MOCK_SPOTIFY_AUTH_DATA.access_token) {
        throw new Error('Invalid access token')
    }

    return {
        data: {
            id: MOCK_SPOTIFY_OWNER_ID,
            display_name: MOCK_SPOTIFY_OWNER_NAME
        }
    }
}

export function getQueue(accessToken: string) {
    if(accessToken !== MOCK_SPOTIFY_AUTH_DATA.access_token) {
        throw new Error('Invalid access token')
    }

    return {
        data: {
            queue: MOCK_SPOTIFY_QUEUE
        }
    }
}

export async function refreshTokenIfNeeded(room: Room) {
    if(room.accessToken !== MOCK_SPOTIFY_AUTH_DATA.access_token) {
        throw new Error('Invalid access token')
    }

    if(room.refreshToken !== MOCK_SPOTIFY_AUTH_DATA.refresh_token) {
        throw new Error('Invalid refresh token')
    }

    return 'new_access_token'
}
