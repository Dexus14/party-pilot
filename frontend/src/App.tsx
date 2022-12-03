import React, {useEffect, useState} from 'react';
import './App.css';
import {useCookies} from "react-cookie";
import {io} from "socket.io-client";
import Unauthorized from "./components/Unauthorized/Unauthorized";
import RoomUsers from "./components/RoomUsers/RoomUsers";
import CurrentlyPlaying from "./components/CurrentlyPlaying/CurrentlyPlaying";


const socket = io("ws://192.168.8.108:8000", {
    withCredentials: true
})

function App() {
    const [cookies, setCookie, removeCookie] = useCookies(['roomUser'])
    const [isAuthorized, setIsAuthorized] = useState(true)
    // TODO: Remove his after tests
    const [room, setRoom] = useState<any | null>(null)
    const [currentTrack, setCurrentTrack] = useState<any | null>(null)

    useEffect(() => {
        socket.on('roomUpdate', (room) => setRoom(room))

        socket.on('connect_error', () => setIsAuthorized(false))

        socket.on('trackUpdate', (track) => setCurrentTrack(track))

        return () => {
            socket.off('roomUpdate')
            socket.off('someoneHi')
            socket.off('connect_error')
        }
    }, [])

    if(!isAuthorized) {
        return <Unauthorized />
    }

    return (
        <div className="App">
            <h1>hi</h1>

            <p>User: { cookies?.roomUser?.name ?? 'no' }</p>
            <p>In room: { cookies?.roomUser?.roomId ?? 'no' }</p>

            <button id={"btn-leave"} onClick={() => removeCookie('roomUser')}>I don't wanna be here anymore!</button>

            <button onClick={() => socket.emit("songPrevious")}> {"<<<<"} </button>
            {
                currentTrack?.is_playing ?
                    <button onClick={() => socket.emit("songPause")}>Pause</button> :
                    <button onClick={() => socket.emit("songResume")}>Play</button>
            }
            <button onClick={() => socket.emit("songNext")}> {">>>>"} </button>

            { room && <RoomUsers room={room} /> }
            { currentTrack && <CurrentlyPlaying track={currentTrack} /> }
        </div>
    );
}

export default App;
