import React from 'react';
import './App.css';
import {useCookies} from "react-cookie";

function App() {
    const [cookies, setCookie, removeCookie] = useCookies(['roomUser'])

    console.log(cookies.roomUser)
    if(!cookies.roomUser) {
        return (
            <div>
                u hav room :(((
                <button><a href="http://localhost:3002">leave</a></button>
            </div>
        )
    }

    function leaveRoom() {
        removeCookie('roomUser')
    }

    function sayHi() {
        console.log('not implemented')
    }

    return (
    <div className="App">
        <h1>hi</h1>

        <p>User: { cookies?.roomUser?.name ?? 'no' }</p>
        <p>In room: { cookies?.roomUser?.roomId ?? 'no' }</p>

        <button id={"btn-leave"} onClick={leaveRoom}>I don't wanna be here anymore!</button>
        <button id={"btn-hi"} onClick={sayHi}>Say hi!</button>
    </div>
    );
}

export default App;
