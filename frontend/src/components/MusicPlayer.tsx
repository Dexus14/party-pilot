import {useEffect, useState} from "react";

const BUTTON_DELAY = 2000

export default function MusicPlayer({
    currentTrack,
    nextAction,
    previousAction,
    pauseAction,
    resumeAction
}: {
    currentTrack: any,
    nextAction: any,
    previousAction: any,
    pauseAction: any,
    resumeAction: any }
) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [delay, setDelay] = useState(false);

    // FIXME: Handle case when changing playback fails
    useEffect(() => {
        setIsPlaying(currentTrack?.is_playing)
    }, [currentTrack])

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDelay(false)
        }, BUTTON_DELAY)

        return () => clearTimeout(timeout)
    }, [delay])

    return (
        <div className={"music-player"}>
            <button className={"player-button"} onClick={() => {
                if(delay) return
                setDelay(true)
                previousAction();
            }}><i className="bi bi-skip-start-fill"></i></button>
            { isPlaying ?
                <button className={"player-button"} onClick={()=> {
                    if(delay) return
                    setDelay(true)
                    setIsPlaying(false)
                    pauseAction()
                }}><i className="bi bi-pause-fill"></i></button> :
                <button className={"player-button"} onClick={() => {
                    if(delay) return
                    setDelay(true)
                    setIsPlaying(true)
                    resumeAction()
                }}><i className="bi bi-play-fill"></i></button>
            }
            <button className={"player-button"} onClick={() => {
                if(delay) return
                setDelay(true)
                nextAction()
            }}><i className="bi bi-skip-end-fill"></i></button>
        </div>
    )
}
