export default function CurrentlyPlaying({ track }: { track: any }) {
    const artistsString = track.artists.map((artist: any) => artist.name).join(', ')
    return (
        <div>
            <h2>Currently playing</h2>
            <img src={ track.album.images[1].url } alt="album image"/>
            <p>{ track.name } - { artistsString } ({ track.album.name })</p>
            <progress value={ track.progress_ms } max={ track.duration_ms } />
        </div>
    )
}
