import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function getUserBySpotifyId(spotifyId: string) {
    return prisma.user.findFirst({
        where: {
            spotifyId
        }
    })
}

export function createUser(data: any) {
    return prisma.user.create({
        data
    })
}

export function updateUser(data: any) {
    return prisma.user.update({
        where: {
            spotifyId: data.spotifyId
        },
        data
    })
}
