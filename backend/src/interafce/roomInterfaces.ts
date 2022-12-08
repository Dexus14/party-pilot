interface RoomUser {
    id: string
    username: string
    roomId: string
    currentlyActive: boolean
    songs: string[]
}

interface Room {
    id: string
    ownerSpotifyId: string
    users: RoomUser[]
}
