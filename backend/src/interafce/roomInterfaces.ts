interface RoomUser {
    id: string
    username: string
    roomId: string
    currentlyActive: boolean
    songs: string[]
    isOwner: boolean
}

interface Room {
    id: string
    ownerSpotifyId: string
    users: RoomUser[]
    options: RoomOptions
    accessToken: string
    refreshToken: string
    lastRefresh: number
    createdAt: number
}

interface RoomPlaybackStateData {
    name: string
    is_playing: boolean
    progress_ms: number
    duration_ms: number

    artists: any[]
    album: any[]
}

interface RoomOptions {
    name: string
    songsPerUser: number
    equality: boolean
    skipVotes: number
}
