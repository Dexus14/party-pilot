import {Accordion} from "react-bootstrap";

function getArtits(track: any) {
    return track.artists.map((artist: any, trackIndex: number, trackArray: any[]) => {
        const result = <a href={artist.href}>{artist.name}</a>
        if(trackIndex < trackArray.length - 1) {
            return <span>{result}, </span>
        }

        return <span>{result}</span>
    })
}

function getAddedByAvatars(track: any) {
    const avatars = track.users.map((user: any) => {
        const avatar = 'https://api.multiavatar.com/' + user + '.svg'
        return (
            <img className={window.innerWidth < 576 ? "avatar-xs" : "avatar-sm"} src={avatar} alt={user.username} />
        )
    })

    if (avatars.length > 0) {
        return avatars.map((avatar: any) => {
            return <>{avatar}</>
        })
    }

    return <><i style={{ fontSize: window.innerWidth < 576 ? '30px' : '40px' }} className={"bi bi-question-circle"}></i></>
}

export default function SongQueue({ queue }: { queue: any[] }) {
    return (
        <Accordion>
            { queue.map((track, key) => {
                const artists = getArtits(track)
                const addedByAvatars = getAddedByAvatars(track)
                return (
                    <Accordion.Item eventKey={key.toString()}>
                        <Accordion.Header>
                            <div className={"d-flex justify-content-between align-items-center"} style={{width: '90%'}}>
                                <p className={"m-0"}>{track.name} - {artists}</p>
                                <p className={"m-0 ms-3"}>{addedByAvatars}</p>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body>
                            <p>Artists: {getArtits(track)}</p>
                        </Accordion.Body>
                    </Accordion.Item>
                    )
                })
            }
        </Accordion>
    )
}
