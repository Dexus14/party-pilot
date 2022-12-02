export interface ServerToClientEvents {
    // noArg: () => void;
    // basicEmit: (a: number, b: string, c: Buffer) => void;
    // withAck: (d: string, callback: (e: number) => void) => void;
    roomUpdate: (room: any) => void;
    noRoom: () => void;
    someoneHi: (username: string) => void;
}

export interface ClientToServerEvents {
    // roomJoin: (message: string, roomId: string) => void;
    sayHi: () => void;
    songPrevious: () => void;
    songNext: () => void;
}

export interface InterServerEvents {
    ping: (room: any) => void;
}

export interface SocketData {
    roomId: string;
    userRoomId: string;
}
