export interface QueueItem {
    uri: string
    name: string
    artists: Artist[]
    users?: string[]
}

export interface Artist {
    name: string
    href: string
}
