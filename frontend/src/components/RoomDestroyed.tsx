import React from "react";
import {Col, Container, Row} from "react-bootstrap";
import useLanguage from "../hooks/useLanguage";

export default function RoomDestroyed() {
    const { content } = useLanguage()

    return (
        <Container id={"app"}>
            <Row className={"mt-3"}>
                <Col
                    xs={{span: 12}}
                    md={{span:10, offset: 1}}
                    lg={{span:8, offset: 2}}
                    xl={{span:6, offset: 3}}
                >
                    <div className={'d-flex flex-column align-items-center justify-content-center mt-5'}>
                        <h1 className={"room-name"}>
                            { content.roomDestroyed }
                        </h1>

                        <i style={{
                            fontSize: '15vw'
                        }} className="bi bi-heartbreak"></i>

                        <a href={window.location.origin}>
                            <button className={'btn btn-lg btn-primary'}>{ content.goToHomepage }</button>
                        </a>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
