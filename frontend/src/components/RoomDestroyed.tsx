import React from "react";
import {Col, Container, Row} from "react-bootstrap";

export default function RoomDestroyed() {
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
                            Sorry, but the owner of this room has closed it.
                        </h1>

                        <i style={{
                            fontSize: '15vw'
                        }} className="bi bi-heartbreak"></i>

                        <a href={window.location.origin}>
                            <button className={'btn btn-lg btn-primary'}>Go to homepage</button>
                        </a>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
