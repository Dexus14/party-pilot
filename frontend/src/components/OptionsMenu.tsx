import React, {useEffect, useState} from "react";
import {Socket} from "socket.io-client";
import {Button, Col, Container, FloatingLabel, Form, ListGroup, Row} from "react-bootstrap";
import useLanguage from "../hooks/useLanguage";


export default function OptionsMenu({ socket, room, optionsStateUpdate, destroyRoom }: { socket: Socket, room: any, optionsStateUpdate: any, destroyRoom: any }) {
    const [roomName, setRoomName] = useState(room.options.name)
    const [songsPerUser, setSongsPerUser] = useState(room.options.songsPerUser)
    const [destroySurePrompt, setDestroySurePrompt] = useState(false)

    const { language, changeLanguage, content } = useLanguage()

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDestroySurePrompt(false)
        }, 3000)

        return () => clearTimeout(timeout)
    }, [destroySurePrompt])

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
                            <h1>{ content.options }</h1>

                            <FloatingLabel
                                controlId="roomName"
                                label={ content.roomNameLabel }
                                className="mb-3"
                            >
                                <Form.Control type="text" placeholder={ content.roomNameLabel } defaultValue={roomName} onChange={(e) => setRoomName(e.target.value)} />
                            </FloatingLabel>

                            <FloatingLabel
                                controlId="songsPerUser"
                                label={ content.songsPerUserLabel }
                                className="mb-3"
                            >
                                <Form.Control type="number" placeholder={ content.songsPerUserLabel } defaultValue={songsPerUser} onChange={(e) => setSongsPerUser(e.target.value)} />
                            </FloatingLabel>

                            {
                                !destroySurePrompt ?
                                    <Button className={'mb-3'} variant="danger" onClick={() => setDestroySurePrompt(true)}>{ content.destroyRoom }</Button> :
                                    <Button className={'mb-3'} variant="danger" onClick={() => {
                                        destroyRoom()
                                        optionsStateUpdate(false)
                                    }}>{ content.destroyRoomConfirmation }</Button>
                            }

                            <Button variant={'primary'} onClick={ () => changeLanguage(language === 'pl' ? 'en' : 'pl') }>PL/EN</Button>

                            <div className={"d-flex justify-content-start mt-4"}>
                                <Button className={"me-2"} variant={'primary'} onClick={saveOptions}>{ content.save }</Button>
                                <Button variant={'danger'} onClick={() => optionsStateUpdate(false)}>{ content.close }</Button>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    )
}
