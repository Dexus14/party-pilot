import React, {useEffect, useState} from "react";
import axios from "axios";
import {Socket} from "socket.io-client";
import {Col, Container, Form, ListGroup, Placeholder, Row} from "react-bootstrap";
import useLanguage from "../hooks/useLanguage";

function getSongTimeFromMillis(millis: number) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds;
}

export default function SongSearch({ socket, searchingStateUpdate }: { socket: Socket, searchingStateUpdate: any }) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [placeholderList, setPlaceholderList] = useState<any[]>([]);
    const { content } = useLanguage()

    useEffect(() => {
        const abortController = new AbortController();

        if(search.length < 3) {
            return
        }

        setIsSearching(true)
        const timeout = setTimeout(() => {
            axios.get('/api/spotify/search_song', {
                params: {
                    q: search
                },
                signal: abortController.signal,
                withCredentials: true
            }).then((res) => {
                setResults(res.data)
                setIsSearching(false)
            }).catch((err) => {
                console.log(err)
            })
        }, 500)

        return () => {
            abortController.abort();
            clearTimeout(timeout)
        }
    }, [search])

    useEffect(() => {
        const placeholderList = [...Array(8)].map((_, i) => {
            return (
                <ListGroup.Item key={i}>
                    <Placeholder as={Row} animation="glow">
                        <Placeholder xs={Math.floor(Math.random() * 8)} />
                    </Placeholder>
                </ListGroup.Item>
            )
        })

        setPlaceholderList(placeholderList)
    }, [isSearching])

    return (
        <Container>
            <Row className={"mt-3"}>
                <Col xs={{span: 12}}>
                    <Form.Floating className="mb-3">
                        <Form.Control
                            id="search-song-input"
                            type="text"
                            placeholder={ content.searchSong }
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            onBlur={() => setTimeout(() => searchingStateUpdate(false), 200)}
                        />
                        <label htmlFor="search-song-input">{ content.searchSong }</label>
                    </Form.Floating>
                </Col>
            </Row>
            <Row>
                <Col xs={{span: 12}}>
                    <ListGroup>
                        {isSearching ?
                            placeholderList
                            : results.map((result) => {
                            return (
                                <ListGroup.Item
                                    className={"searched-song"}
                                    key={result.uri}
                                    onClick={() => socket.emit('songAddToQueue', result.uri)}
                                >
                                    <div className="d-flex align-items-center">
                                        <img className={"search-album-image"} src={result.albumImage} alt="album image"/>
                                        <div className={"d-flex flex-column ms-3"}>
                                            <h3 className={"m-0 text-start"}>{ result.name }</h3>
                                            <p className={"m-0"}>{ result.artists }</p>
                                            <p style={{fontSize: '0.65rem'}} className={"m-0"}>{ result.album }</p>
                                            <p className={"m-0"}>{getSongTimeFromMillis(result.duration)}</p>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            )
                        })
                        }
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    )
}
