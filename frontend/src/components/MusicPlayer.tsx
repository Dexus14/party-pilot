import {useEffect, useState} from "react";
import MusicPlayerButton from "./MusicPlayerButton";

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
            <MusicPlayerButton icon={<i className="bi bi-skip-start-fill"></i>} action={previousAction} />
            { isPlaying ?
                <MusicPlayerButton icon={<i className="bi bi-pause-fill"></i>} action={() => {
                    setIsPlaying(false)
                    pauseAction()
                }} /> :
                <MusicPlayerButton icon={<i className="bi bi-play-fill"></i>} action={() => {
                    setIsPlaying(true)
                    resumeAction()
                }} />
            }
            <MusicPlayerButton icon={<i className="bi bi-skip-end-fill"></i>} action={nextAction} />
        </div>
    )
}
