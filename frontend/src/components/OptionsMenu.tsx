import React, {useState} from "react";
import {Socket} from "socket.io-client";
import {Button, Col, Container, FloatingLabel, Form, ListGroup, Row} from "react-bootstrap";


export default function OptionsMenu({ socket, room, optionsStateUpdate }: { socket: Socket, room: any, optionsStateUpdate: any }) {
    const [roomName, setRoomName] = useState(room.options.name)
    const [songsPerUser, setSongsPerUser] = useState(room.options.songsPerUser)

    async function saveOptions() {
        const options ={
            name: roomName,
            songsPerUser
        }

        await socket.emit('updateRoomOptions', options)
        optionsStateUpdate(false)
    }

    return (
        <Container id={"options"}>
            <Row className={"mt-3"}>
                <Col
                    xs={{span: 12}}
                    md={{span:10, offset: 1}}
                    lg={{span:8, offset: 2}}
                    xl={{span:6, offset: 3}}
                >
                    <ListGroup>
                        <ListGroup.Item className={"d-flex flex-column p-lg-4 p-sm-3"}>
                            <h1>Options</h1>

                            <FloatingLabel
                                controlId="roomName"
                                label="Room name"
                                className="mb-3"
                            >
                                <Form.Control type="text" placeholder="Room name" defaultValue={roomName} onChange={(e) => setRoomName(e.target.value)} />
                            </FloatingLabel>

                            <FloatingLabel
                                controlId="songsPerUser"
                                label="Max songs per user"
                                className="mb-3"
                            >
                                <Form.Control type="number" placeholder="Songs per user" defaultValue={songsPerUser} onChange={(e) => setSongsPerUser(e.target.value)} />
                            </FloatingLabel>

                            <div className={"d-flex justify-content-start mt-4"}>
                                <Button className={"me-2"} variant={'primary'} onClick={saveOptions}>Save</Button>
                                <Button variant={'danger'} onClick={() => optionsStateUpdate(false)}>Close</Button>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    )
}
