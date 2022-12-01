interface RoomUser {
    id: string
    name: string
    roomId: string
}

interface Room {
    id: string
    ownerSpotifyId: string
    users: RoomUser[]
}
