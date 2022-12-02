interface RoomUser {
    id: string
    username: string
    roomId: string
    currentlyActive: boolean
}

interface Room {
    id: string
    ownerSpotifyId: string
    users: RoomUser[]
}
