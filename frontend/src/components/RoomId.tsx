import {Overlay, Placeholder, Tooltip} from "react-bootstrap";
import React, {useEffect, useRef, useState} from "react";

export function RoomId({ room }: { room: any }) {
    const [copyingState, setCopyingState] = useState<string|null>(null)
    const target = useRef(null)

    async function copyRoomId() {
        setCopyingState('copying')
        if(!navigator.clipboard) {
            return setCopyingState('failed')
        }
        const joinLink = process.env.REACT_APP_SERVER_URL + '/room/join/' + room?.id
        await navigator.clipboard.writeText(joinLink)
        setCopyingState('success')
    }
    useEffect(() => {
        if (copyingState) {
            setTimeout(() => setCopyingState(null), 3000)
        }
    }, [copyingState])

    function renderButton() {
        switch(copyingState) {
            case 'copying':
                return (
                    <button ref={target} className={'btn btn-outline-secondary btn-sm ms-2'}>
                        <i className="bi bi-clipboard-pulse"></i>
                    </button>
                )
            case 'success':
                return (
                    <button ref={target} className={'btn btn-outline-secondary btn-sm ms-2'}>
                        <i className="bi bi-clipboard-plus"></i>
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
                Room code: {room?.id ?? <Placeholder animation={'glow'}><Placeholder xs={1} size={'xs'} /></Placeholder>}
            </p>

            {renderButton()}

            <Overlay target={target.current} show={copyingState !== null} placement="right">
                {(props) => (
                    <Tooltip id="overlay" {...props}>
                        {copyingState === 'success' ? 'Join link saved to clipboard!' : 'Sorry, copying is unavailable right now.'}
                    </Tooltip>
                )}
            </Overlay>
        </div>
    )
}
