import React, {useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {io} from "socket.io-client";
import Unauthorized from "./components/Unauthorized";
import RoomUsers from "./components/RoomUsers";
import CurrentlyPlaying from "./components/CurrentlyPlaying";
import SongSearch from "./components/SongSearch";
import SongQueue from "./components/SongQueue";
import MusicPlayer from "./components/MusicPlayer";
import {Button, Col, Container, Form, Placeholder, Row, Spinner} from "react-bootstrap";

import ErrorToasts from "./components/ErrorToasts";
import OptionsMenu from "./components/OptionsMenu";
import {RoomId} from "./components/RoomId";


const socket = io(process.env.REACT_APP_WEBSOCKET_URL ?? '', {
    withCredentials: true
})

function App() {
    const [cookies, setCookie, removeCookie] = useCookies(['roomUser'])
    const [isAuthorized, setIsAuthorized] = useState(true)
    const [isSearching, setIsSearching] = useState(false)
    const [inOptions, setInOptions] = useState(false)
    const [room, setRoom] = useState<any | null>(null)
    const [queue, setQueue] = useState<any | null>(null)
    const [currentTrack, setCurrentTrack] = useState<any | null>(null)
    const [errors, setErrors] = useState<string[]>([])
    const [selectedTheme, setSelectedTheme] = useState(localStorage.getItem('TYPE_OF_THEME') || 'dark')

    function removeError(index: number) {
        setErrors(errors => errors.filter((_, i) => i !== index))
    }

    useEffect(() => {
        socket.on('roomUpdate', (room) => setRoom(room))

        socket.on('connect_error', () => setIsAuthorized(false))

        socket.on('trackUpdate', (track) => setCurrentTrack(track))

        socket.on('roomQueueUpdate', (queue) => setQueue(queue))

        socket.on('overSongLimit', () => setErrors(last => [...last, 'You have reached the song limit for this room.']))

        socket.on('error', (error) => setErrors(last => [...last, error]))

        return () => {
            socket.off('roomUpdate')
            socket.off('connect_error')
            socket.off('trackUpdate')
            socket.off('roomQueueUpdate')
            socket.off('overSongLimit')
            socket.off('error')
        }
    }, [])

    if(!isAuthorized) {
        return <Unauthorized />
    }

    if(isSearching) {
        return (<SongSearch socket={socket} searchingStateUpdate={setIsSearching} />)
    }

    if(inOptions) {
        return (<OptionsMenu socket={socket} room={room} optionsStateUpdate={setInOptions} />)
    }

    return (
        <Container id={"app"}>
            <ErrorToasts errors={errors} removeError={removeError} />

            <Row className={"mt-3"}>
                <Col
                    xs={{span: 12}}
                    md={{span:10, offset: 1}}
                    lg={{span:8, offset: 2}}
                    xl={{span:6, offset: 3}}
                >
                    <h1 className={"room-name"}>
                        {room?.options?.name ?? <Placeholder animation={'glow'}><Placeholder xs={6} size={'sm'} /></Placeholder>}
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
                    <RoomId room={room} />

                    <div className={'d-flex justify-content-center align-items-center'}>
                        <Button className={'me-5'} variant={"primary"} onClick={() => setInOptions(true)}>
                            Options
                        </Button>
                        <Form.Check
                            type="switch"
                            id="theme-switch"
                            label="Dark theme"
                            checked={selectedTheme === 'dark'}
                            onChange={(e) => {
                                setSelectedTheme(e.target.checked ? 'dark' : 'light')
                                localStorage.setItem('TYPE_OF_THEME', e.target.checked ? 'dark' : 'light')
                                window.location.reload()
                            }
                            }
                        />
                    </div>
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

            { !currentTrack ? (
                <Row className={"mt-5"}>
                    <Col
                        xs={{span: 12}}
                        md={{span:10, offset: 1}}
                        lg={{span:8, offset: 2}}
                        xl={{span:6, offset: 3}}
                    >
                        <div className="d-flex justify-content-center align-items-center pt-5">
                            <h4 className={'mb-0 me-4'}>Waiting for the owner to launch Spotify</h4>
                            <Spinner animation={'border'} role={'status'} />
                        </div>
                    </Col>
                </Row>
                ) : null
            }

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
