import React from "react";
import {Col, Container, Row} from "react-bootstrap";

export default function Unauthorized() {
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
                            Sorry, but it seems this room either does not exist or you are not authorized to join it.
                        </h1>

                        <i style={{
                            fontSize: '15vw'
                        }} className="bi bi-emoji-frown"></i>

                        <a href={process.env.REACT_APP_SERVER_URL}>
                            <button className={'btn btn-lg btn-primary'}>Go to homepage</button>
                        </a>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
