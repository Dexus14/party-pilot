import React, {useEffect, useState} from 'react';
import './App.css';
import {useCookies} from "react-cookie";
import {io} from "socket.io-client";
import Unauthorized from "./components/Unauthorized";
import RoomUsers from "./components/RoomUsers";
import CurrentlyPlaying from "./components/CurrentlyPlaying";
import SongSearch from "./components/SongSearch";
import SongQueue from "./components/SongQueue";
import MusicPlayer from "./components/MusicPlayer";
import {Col, Container, Form, Placeholder, Row} from "react-bootstrap";

import 'bootstrap/dist/css/bootstrap.min.css';


const socket = io("ws://192.168.8.108:8000", {
    withCredentials: true
})

function App() {
    const [cookies, setCookie, removeCookie] = useCookies(['roomUser'])
    const [isAuthorized, setIsAuthorized] = useState(true)
    const [isSearching, setIsSearching] = useState(false)
    const [room, setRoom] = useState<any | null>(null)
    const [queue, setQueue] = useState<any | null>(null)
    const [currentTrack, setCurrentTrack] = useState<any | null>(null)

    useEffect(() => {
        socket.on('roomUpdate', (room) => setRoom(room))

        socket.on('connect_error', () => setIsAuthorized(false))

        socket.on('trackUpdate', (track) => setCurrentTrack(track))

        socket.on('roomQueueUpdate', (queue) => setQueue(queue))

        socket.on('overSongLimit', () => console.log('overSongLimit'))

        socket.on('error', console.log)

        return () => {
            socket.off('roomUpdate')
            socket.off('someoneHi')
            socket.off('connect_error')
        }
    }, [])

    if(!isAuthorized || !room) {
        return <Unauthorized />
    }

    if(isSearching) {
        return (<SongSearch socket={socket} searchingStateUpdate={setIsSearching} />)
    }

    return (
        <Container id={"app"}>
            <Row className={"mt-3"}>
                <Col
                    xs={{span: 12}}
                    md={{span:10, offset: 1}}
                    lg={{span:8, offset: 2}}
                    xl={{span:6, offset: 3}}
                >
                    <h1 className={"room-name"}>
                        {room?.options?.name ?? <Placeholder />}
                    </h1>
                </Col>
            </Row>

            <Row className={"mt-3"}>
                <Col
                    xs={{span: 12}}
                    md={{span:10, offset: 1}}
                    lg={{span:8, offset: 2}}
                    xl={{span:6, offset: 3}}
                >
                    <Form.Floating className="mb-3">
                        <Form.Control
                            id="search-song-input"
                            type="text"
                            placeholder="Search song"
                            onFocus={() => setIsSearching(true)}
                        />
                        <label htmlFor="search-song-input">Search song</label>
                    </Form.Floating>
                </Col>
            </Row>

            <Row>
                <Col
                    xs={{span: 12}}
                    md={{span:10, offset: 1}}
                    lg={{span:8, offset: 2}}
                    xl={{span:6, offset: 3}}
                >
                    <p className={"room-code"}>
                        Room code: {room?.id ?? <Placeholder />}
                    </p>
                </Col>
            </Row>

            <Row className={"mt-4"}>
                <Col
                    xs={{span: 12}}
                    md={{span:10, offset: 1}}
                    lg={{span:8, offset: 2}}
                    xl={{span:6, offset: 3}}
                >
                    {room ? <RoomUsers room={room} currentUsername={cookies.roomUser.username} /> : <Placeholder />}
                </Col>
            </Row>

            <Row className={"mt-4"}>
                <Col
                    xs={{span: 12}}
                    md={{span:10, offset: 1}}
                    lg={{span:8, offset: 2}}
                    xl={{span:6, offset: 3}}
                >
                    {currentTrack ? <CurrentlyPlaying track={currentTrack} /> : <Placeholder />}
                </Col>
            </Row>

            <Row className={"mt-4"}>
                <Col
                    xs={{span: 12}}
                    md={{span:10, offset: 1}}
                    lg={{span:8, offset: 2}}
                    xl={{span:6, offset: 3}}
                >
                    { queue && <SongQueue queue={queue} />}
                </Col>
            </Row>

            <MusicPlayer
                currentTrack={currentTrack}
                resumeAction={() => socket.emit('songResume')}
                pauseAction={() => socket.emit('songPause')}
                nextAction={() => socket.emit('songNext')}
                previousAction={() => socket.emit('songPrevious')}
            />
        </Container>
    );
}

export default App;
