import {Overlay, Placeholder, Tooltip} from "react-bootstrap";
import React, {useEffect, useRef, useState} from "react";
import useLanguage from "../hooks/useLanguage";

export function RoomId({ room, qrViewUpdate }: { room: any, qrViewUpdate: any }) {
    const [copyingState, setCopyingState] = useState<string|null>(null)
    const target = useRef(null)

    const { content } = useLanguage()

    async function copyRoomId() {
        if(!navigator.clipboard) {
            return setCopyingState('failed')
        }
        const joinLink = window.location.origin + '/room/join/' + room.id
        await navigator.clipboard.writeText(joinLink)
        setCopyingState('success')
    }
    useEffect(() => {
        if (copyingState) {
            const timeout = setTimeout(() => setCopyingState(null), 3000)
            return () => {
                window.clearTimeout(timeout)
            }
        }
    }, [copyingState])

    function renderButton() {
        switch(copyingState) {
            case 'success':
                return (
                    <button ref={target} className={'btn btn-outline-success btn-sm ms-2'}>
                        <i className="bi bi-clipboard-check"></i>
                    </button>
                )
            case 'failed':
                return (
                    <button ref={target} className={'btn btn-outline-danger btn-sm ms-2'}>
                        <i className="bi bi-clipboard-x"></i>
                    </button>
                )
            default:
                return (
                    <button ref={target} className={'btn btn-outline-secondary btn-sm ms-2'} onClick={copyRoomId}>
                        <i className="bi bi-clipboard-plus"></i>
                    </button>
                )
        }
    }

    return (
        <div className={'d-flex justify-content-center align-items-center mb-3'}>
            <p style={{ cursor: 'pointer' }} onClick={copyRoomId} className={"room-code m-0"}>
                { content.roomCode }: {room?.id ?? <Placeholder animation={'glow'}><Placeholder xs={1} size={'xs'} /></Placeholder>}
            </p>

            {renderButton()}

            <button onClick={() => qrViewUpdate(true)} className={'btn btn-outline-secondary btn-sm ms-2'}>
                <i className="bi bi-qr-code"></i>
            </button>

            <Overlay target={target.current} show={copyingState !== null} placement="right">
                {(props) => (
                    <Tooltip id="overlay" {...props}>
                        {copyingState === 'success' ? content.roomCodeCopySuccess : content.roomCodeCopyFail }
                    </Tooltip>
                )}
            </Overlay>
        </div>
    )
}
