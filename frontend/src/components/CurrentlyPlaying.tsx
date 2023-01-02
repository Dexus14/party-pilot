import {ListGroup, ProgressBar} from "react-bootstrap";
import {useEffect, useState} from "react";

function getSongTimeFromMillis(millis: number) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds;
}

export default function CurrentlyPlaying({ track }: { track: any }) {
    const [assumedProgress, setAssumedProgress] = useState(0);

    const artistsString = track.artists.map((artist: any) => artist.name).join(', ')
    const currentTime = getSongTimeFromMillis(assumedProgress)
    const duration = getSongTimeFromMillis(track.duration_ms)

    useEffect(() => {
        setAssumedProgress(track.progress_ms)

        if(track.is_playing) {
            const interval = setInterval(() => {
                setAssumedProgress((last) => last + 1000)
            }, 1000)

            return () => {
                clearInterval(interval)
            }
        }
    }, [track])

    return (
        <ListGroup>
            <ListGroup.Item className={"d-flex justify-content-between align-items-stretch p-lg-4 p-sm-3"}>
                <img className={"currently-playing-album-image"} src={ track.album.images[1].url } alt="album image"/>
                <div style={{minWidth: '40%', maxWidth: '50%'}} className={"d-flex flex-column align-items-end justify-content-between"}>
                    <div className={"d-flex flex-column align-items-end"}>
                        <h3 className={"m-0 text-end"}>{ track.name }</h3>
                        <p className={"m-0 text-end"}>{ artistsString }</p>
                        <p className={"m-0 text-end"} style={{fontSize: '0.65rem'}}>{ track.album.name }</p>
                    </div>

                    <div style={{width: '100%'}} className={"text-end"}>
                        <ProgressBar className={"mt-1"} max={track.duration_ms} now={assumedProgress} />
                        <p className={"m-0"} style={{fontSize: '0.75rem'}}>{currentTime} / {duration}</p>
                    </div>
                </div>
            </ListGroup.Item>
        </ListGroup>
    )
}
