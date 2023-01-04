import {
    canUserAddSong,
    createOrGetRoom,
    createRoomUser,
    destroyRoom, destroyRoomByOwnerId, filterUserSongsWithQueue, getQueueWithRoomUsers,
    getRoom, getRoomOwner,
    getRoomUser, refreshRoomOwnerTokenIfNeeded,
    removeRoomUser,
    roomAndUserExists, roomUserAddSong, setRoomUserActive, updateRoomOptions, updateRoomTokens
} from "../rooms.service"
import {
    MOCK_SPOTIFY_AUTH_DATA,
    MOCK_SPOTIFY_OWNER_ID,
    MOCK_SPOTIFY_OWNER_NAME,
    MOCK_SPOTIFY_QUEUE,
    MOCK_SPOTIFY_SONG_ARTIST_1,
    MOCK_SPOTIFY_SONG_ARTIST_2,
    MOCK_SPOTIFY_SONG_NAME, MOCK_SPOTIFY_SONG_NAME_2,
    MOCK_SPOTIFY_SONG_URI,
    MOCK_SPOTIFY_SONG_URI_2
} from "../__mocks__/spotifyApi.service";
import {MOCK_RANDOM_STRING} from "../__mocks__/utils.service";

jest.useFakeTimers()

jest.mock('../spotifyApi.service')
jest.mock('../utils.service')

jest.mock('../../index', () => ({
    SPOTIFY_AUTH_REDIRECT_URL: 'url',
    SPOTIFY_DESTROY_REDIRECT_URL: 'url2'
}))

const MOCK_ROOM_USERNAME = 'example_username'
const MOCK_ROOM_OWNER_ID = 'example_owner_id'
const MOCK_ROOM_OWNER_USERNAME = 'owner'

const MOCK_ALTERNATIVE_ACCESS_TOKEN = 'alternative_access_token'
const MOCK_ALTERNATIVE_REFRESH_TOKEN = 'alternative_refresh_token'

const EXPECTED_ROOM_USER = {
    id: MOCK_RANDOM_STRING,
    username: MOCK_ROOM_USERNAME,
    roomId: MOCK_RANDOM_STRING,
    currentlyActive: false,
    songs: [],
    isOwner: false,
}

const EXPECTED_ROOM_OWNER = {
    id: MOCK_ROOM_OWNER_ID,
    username: MOCK_ROOM_OWNER_USERNAME,
    roomId: MOCK_RANDOM_STRING,
    currentlyActive: false,
    songs: [],
    isOwner: true,
}

const EXPECTED_ROOM = {
    id: MOCK_RANDOM_STRING,
    ownerSpotifyId: MOCK_SPOTIFY_OWNER_ID,
    users: [],
    options: {
        name: MOCK_SPOTIFY_OWNER_NAME + "'s room",
        songsPerUser: 0,
        equality: false,
        skipVotes: 0
    },
    accessToken: MOCK_SPOTIFY_AUTH_DATA.access_token,
    refreshToken: MOCK_SPOTIFY_AUTH_DATA.refresh_token,
    lastRefresh: Date.now(),
    createdAt: Date.now()
}

const EXPECTED_SPOTIFY_QUEUE = [
    {
        name: MOCK_SPOTIFY_SONG_NAME,
        artists: [
            MOCK_SPOTIFY_SONG_ARTIST_1,
            MOCK_SPOTIFY_SONG_ARTIST_2,
        ],
        users: []
    },
    {
        name: MOCK_SPOTIFY_SONG_NAME_2,
        artists: [
            MOCK_SPOTIFY_SONG_ARTIST_2,
        ],
        users: [
            MOCK_ROOM_USERNAME,
            MOCK_ROOM_OWNER_USERNAME
        ]
    }
]

const MOCK_NEW_ROOM_OPTIONS: RoomOptions = {
    name: 'new name',
    songsPerUser: 2,
    equality: true,
    skipVotes: 1
}

describe('RoomsService', () => {
    test('room: create and get', async () => {
        const roomId = await createOrGetRoom(MOCK_SPOTIFY_AUTH_DATA, MOCK_SPOTIFY_OWNER_ID)

        expect(roomId).toBe(MOCK_RANDOM_STRING)

        const room = await getRoom(roomId)

        expect(room).toEqual(EXPECTED_ROOM)
    })

    test('room: change options', () => {
        updateRoomOptions(MOCK_RANDOM_STRING, MOCK_NEW_ROOM_OPTIONS)

        const room = getRoom(MOCK_RANDOM_STRING) as Room

        expect(room.options).toEqual(MOCK_NEW_ROOM_OPTIONS)
    })

    test('roomUser: add to room and get', async () => {
        const roomUser = createRoomUser(MOCK_RANDOM_STRING, MOCK_ROOM_USERNAME)

        expect(roomUser).toEqual(EXPECTED_ROOM_USER)

        const roomUserGet = getRoomUser(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)

        expect(roomUserGet).toEqual(roomUser)
    })

    test('roomUser: can add song yes', () => {
        const res = canUserAddSong(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)

        expect(res).toBe(true)
    })

    test('roomUser: owner add to room and get', async () => {
        const roomUser = createRoomUser(MOCK_RANDOM_STRING, MOCK_ROOM_OWNER_USERNAME, true, MOCK_ROOM_OWNER_ID)

        expect(roomUser).toEqual(EXPECTED_ROOM_OWNER)

        const roomUserGet = getRoomUser(MOCK_RANDOM_STRING, MOCK_ROOM_OWNER_ID)

        expect(roomUserGet).toEqual(roomUser)
    })

    test('roomUser: set active', () => {
        setRoomUserActive(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING, true)
        const roomUser = getRoomUser(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)

        expect(roomUser.currentlyActive).toBe(true)

        // Go back to previous state to not break other tests
        setRoomUserActive(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING, false)
        const newRoomUser = getRoomUser(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)

        expect(newRoomUser.currentlyActive).toBe(false)
    })

    test('roomUser, room: get owner', () => {
        const roomOwner = getRoomOwner(MOCK_RANDOM_STRING)

        expect(roomOwner).toEqual(EXPECTED_ROOM_OWNER)
    })

    test('roomUser, room: check existance both exist', async () => {
        const exists = roomAndUserExists(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)

        expect(exists).toEqual(true)
    })

    test('roomUser: add song', () => {
        // User adds 2 different songs
        roomUserAddSong(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING, MOCK_SPOTIFY_SONG_URI)
        roomUserAddSong(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING, MOCK_SPOTIFY_SONG_URI_2)
        // Owner adds 2 same songs
        roomUserAddSong(MOCK_RANDOM_STRING, MOCK_ROOM_OWNER_ID, MOCK_SPOTIFY_SONG_URI_2)
        roomUserAddSong(MOCK_RANDOM_STRING, MOCK_ROOM_OWNER_ID, MOCK_SPOTIFY_SONG_URI_2)

        const roomUser = getRoomUser(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)
        const roomOwner = getRoomUser(MOCK_RANDOM_STRING, MOCK_ROOM_OWNER_ID)

        expect(roomUser.songs).toEqual([MOCK_SPOTIFY_SONG_URI, MOCK_SPOTIFY_SONG_URI_2])
        expect(roomOwner.songs).toEqual([MOCK_SPOTIFY_SONG_URI_2, MOCK_SPOTIFY_SONG_URI_2])
    })

    test('roomUser: can add song no', () => {
        const res = canUserAddSong(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)

        expect(res).toBe(false)
    })

    test('roomUser: filter songs', () => {
        const room = getRoom(MOCK_RANDOM_STRING) as Room
        filterUserSongsWithQueue(room, MOCK_SPOTIFY_QUEUE)

        const roomUser = getRoomUser(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)
        const roomOwner = getRoomUser(MOCK_RANDOM_STRING, MOCK_ROOM_OWNER_ID)

        expect(roomUser.songs).toEqual([MOCK_SPOTIFY_SONG_URI_2])
        expect(roomOwner.songs).toEqual([MOCK_SPOTIFY_SONG_URI_2, MOCK_SPOTIFY_SONG_URI_2])
    })

    test('queue: generate with users', async () => {
        const preparedQueue = await getQueueWithRoomUsers(MOCK_RANDOM_STRING)

        expect(preparedQueue).toEqual(EXPECTED_SPOTIFY_QUEUE)
    })

    test('room: change tokens', () => {
        updateRoomTokens(MOCK_RANDOM_STRING, MOCK_ALTERNATIVE_ACCESS_TOKEN, MOCK_ALTERNATIVE_REFRESH_TOKEN)
        const newRoom = getRoom(MOCK_RANDOM_STRING) as Room

        expect(newRoom.accessToken).toEqual(MOCK_ALTERNATIVE_ACCESS_TOKEN)
        expect(newRoom.refreshToken).toEqual(MOCK_ALTERNATIVE_REFRESH_TOKEN)

        // Go back to previous state to not break other tests
        updateRoomTokens(MOCK_RANDOM_STRING, MOCK_SPOTIFY_AUTH_DATA.access_token, MOCK_SPOTIFY_AUTH_DATA.refresh_token)
    })

    // DESTROY ROOM USER
    test('roomUser: remove from room', async () => {
        removeRoomUser(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)

        const removeUserFunc = () => getRoomUser(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)

        expect(removeUserFunc).toThrowError('Room user does not exist')
    })

    test('roomUser: check existance user not exists', async () => {
        const exists = roomAndUserExists(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)

        expect(exists).toEqual(false)
    })

    test('roomUser: not exists errors', () => {
        const canUserAddSongFunc = () => canUserAddSong(MOCK_RANDOM_STRING, MOCK_ROOM_USERNAME)
        expect(canUserAddSongFunc).toThrowError('Room user does not exist')
    })

    // DESTROY ROOM
    test('room: get existing and destroy it', async () => {
        const roomId = await createOrGetRoom(MOCK_SPOTIFY_AUTH_DATA, MOCK_SPOTIFY_OWNER_ID)

        expect(roomId).toBe(MOCK_RANDOM_STRING)

        destroyRoom(roomId)

        const room = await getRoom(roomId)

        expect(room).toBeUndefined()
    })

    test('room: create and destroy by owner id', async () => {
        const roomId = await createOrGetRoom(MOCK_SPOTIFY_AUTH_DATA, MOCK_SPOTIFY_OWNER_ID)
        expect(roomId).toBe(MOCK_RANDOM_STRING)

        destroyRoomByOwnerId(MOCK_SPOTIFY_OWNER_ID)

        const room = await getRoom(roomId)
        expect(room).toBeUndefined()
    })

    test('roomUser, room: room not exists errors',  () => {
        const roomOwnerFunc = () => getRoomOwner(MOCK_RANDOM_STRING)
        expect(roomOwnerFunc).toThrowError('Room does not exist')

        const createUserFunc = () => createRoomUser(MOCK_RANDOM_STRING, MOCK_ROOM_USERNAME)
        expect(createUserFunc).toThrowError('Room does not exist')

        const exists = roomAndUserExists(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)
        expect(exists).toEqual(false)

        const getRoomUserFunc = () => getRoomUser(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)
        expect(getRoomUserFunc).toThrowError('Room does not exist')

        const setRoomUserActiveFunc = () => setRoomUserActive(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING, true)
        expect(setRoomUserActiveFunc).toThrowError('Room does not exist')

        const roomUserAddSongFunc = () => roomUserAddSong(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING, MOCK_SPOTIFY_SONG_URI)
        expect(roomUserAddSongFunc).toThrowError('Room does not exist')

        const canUserAddSongFunc = () => canUserAddSong(MOCK_RANDOM_STRING, MOCK_RANDOM_STRING)
        expect(canUserAddSongFunc).toThrowError('Room does not exist')

        const updateRoomOptionsFunc = () => updateRoomOptions(MOCK_RANDOM_STRING, MOCK_NEW_ROOM_OPTIONS)
        expect(updateRoomOptionsFunc).toThrowError('Room does not exist')

        const updateRoomTokensFunc = () => updateRoomTokens(MOCK_RANDOM_STRING, MOCK_ALTERNATIVE_ACCESS_TOKEN, MOCK_ALTERNATIVE_REFRESH_TOKEN)
        expect(updateRoomTokensFunc).toThrowError('Room does not exist')

        const refreshRoomTokensFunc = () => refreshRoomOwnerTokenIfNeeded(MOCK_RANDOM_STRING)
        expect(refreshRoomTokensFunc).toThrowError('Room does not exist')
    })
})
