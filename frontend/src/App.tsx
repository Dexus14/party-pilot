import React, {useEffect, useState} from 'react';
import './App.css';
import {useCookies} from "react-cookie";
import {io} from "socket.io-client";
import Unauthorized from "./components/Unauthorized/Unauthorized";
import RoomUsers from "./components/RoomUsers/RoomUsers";


const socket = io("http://localhost:8000", {
    withCredentials: true
})

function App() {
    const [cookies, setCookie, removeCookie] = useCookies(['roomUser'])
    const [isAuthorized, setIsAuthorized] = useState(true)
    // TODO: Remove his after tests
    const [his, setHis] = useState<string[]>(['noone'])
    const [room, setRoom] = useState<any | null>(null)

    useEffect(() => {
        socket.on('roomUpdate', (room, xd) => setRoom(room))

        socket.on('someoneHi', (username: string) => setHis((prev) => [...prev, username]))

        socket.on('connect_error', () => setIsAuthorized(false))

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
            <button type={"button"} id={"btn-hi"} onClick={() => socket.emit('sayHi')}>Say hi!</button>

            { room && <RoomUsers room={room} /> }

            <ol>
                {his.map((h, i) => <li key={i}>{h}</li>)}
            </ol>
        </div>
    );
}

export default App;
