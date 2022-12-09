import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export function getUserBySpotifyId(spotifyId: string) {
    return prisma.user.findFirst({
        where: {
            spotifyId
        }
    })
}

export function createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
        data
    })
}

export function updateUser(data: Prisma.UserUpdateInput) {
    if(typeof data.spotifyId !== 'string') {
        throw new Error('updateUser: spotifyId is not a string')
    }
    return prisma.user.update({
        where: {
            spotifyId: data.spotifyId
        },
        data
    })
}
