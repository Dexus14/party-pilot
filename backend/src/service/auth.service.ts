import jwt from "jsonwebtoken";

interface AuthData {
    roomId: string;
    id: string;
}

export function verifyJwtRoomUser(cookie: string) {
    const secret = process.env.JWT_SECRET

    if(!secret) {
        throw new Error('Missing JWT secret')
    }

    const decoded = jwt.verify(cookie, secret)
    if(typeof decoded !== 'object' || !decoded.roomId || !decoded.id) {
        throw new Error('Invalid cookie')
    }
    return decoded as AuthData
}

export function encodeAuthData(data: AuthData|RoomUser) {
    const secret = process.env.JWT_SECRET

    if(!secret) {
        throw new Error('Missing JWT secret')
    }

    data = { roomId: data.roomId, id: data.id }

    return jwt.sign(data, secret)
}
