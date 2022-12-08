export interface ServerToClientEvents {
    roomUpdate: (room: any) => void;
    noRoom: () => void;
    trackUpdate: (trackData: any) => void; // TODO: Add types here
    roomQueueUpdate: (queue: any) => void; // TODO: Add types here
}

export interface ClientToServerEvents {
    sayHi: () => void;
    songPrevious: () => void;
    songNext: () => void;
    songPause: () => void;
    songResume: () => void;
    songAddToQueue: (songId: string) => void;
}

export interface InterServerEvents {
    ping: (room: any) => void;
}

export interface SocketData {
    roomId: string;
    userRoomId: string;
}
