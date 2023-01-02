import {useEffect, useState} from "react";

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

    // FIXME: Handle case when changing playback fails
    useEffect(() => {
        setIsPlaying(currentTrack?.is_playing)
    }, [currentTrack])

    return (
        <div className={"music-player"}>
            <button className={"player-button"} onClick={previousAction}><i className="bi bi-skip-start-fill"></i></button>
            { isPlaying ?
                <button className={"player-button"} onClick={()=> {
                    setIsPlaying(false)
                    pauseAction()
                }}><i className="bi bi-pause-fill"></i></button> :
                <button className={"player-button"} onClick={() => {
                    setIsPlaying(true)
                    resumeAction()
                }}><i className="bi bi-play-fill"></i></button>
            }
            <button className={"player-button"} onClick={nextAction}><i className="bi bi-skip-end-fill"></i></button>
        </div>
    )
}
