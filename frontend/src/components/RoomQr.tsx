import {
    Button,
    Col,
    Container,
    ListGroup,
    Row,
} from "react-bootstrap";
import QRCode from "react-qr-code";
import useLanguage from "../hooks/useLanguage";

export function RoomQr({ room, qrViewUpdate }: { room: any, qrViewUpdate: any }) {
    const { content } = useLanguage()

    const joinLink = window.location.origin + '/room/join/' + room.id

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
                            <h1 className={'mb-4'}>{ content.qrTitle }</h1>

                            <div className={'qr-wrapper align-self-center mb-4'}>
                                <QRCode
                                    style={{
                                        width: '100%',
                                    }}
                                    value={joinLink}
                                />
                            </div>



                            <div className={"d-flex justify-content-start mt-4"}>
                                <Button variant="primary" onClick={() => qrViewUpdate(false)}>{ content.close }</Button>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>
        </Container>
    )
}
