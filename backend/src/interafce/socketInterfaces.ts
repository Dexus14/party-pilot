export interface ServerToClientEvents {
    roomUpdate: (room: any) => void;
    noRoom: () => void;
    trackUpdate: (trackData: any) => void; // TODO: Add types here
    roomQueueUpdate: (queue: any) => void; // TODO: Add types here
    overSongLimit: () => void;
    roomDestroyed: () => void;
    error: (message: string) => void;
}

export interface ClientToServerEvents {
    songPrevious: () => void;
    songNext: () => void;
    songPause: () => void;
    songResume: () => void;
    songAddToQueue: (songId: string) => void;
    updateRoomOptions: (options: RoomOptions) => void;
    roomDestroy: () => void;
    activeUpdate: (active: boolean) => void;
}

export interface InterServerEvents {
    ping: (room: any) => void;
}

export interface SocketData {
    roomId: string;
    userRoomId: string;
}
