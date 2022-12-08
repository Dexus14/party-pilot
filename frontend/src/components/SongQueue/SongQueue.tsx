

export default function SongQueue({ queue }: { queue: any[] }) {
    return (
        <div>
            <h1>Queue</h1>
            <ol>
                { queue.map((track, index) => {
                    const artists = track.artists.map((artist: any, trackIndex: number, trackArray: any[]) => {
                        const result = <a href={artist.href}>{artist.name}</a>
                        if(trackIndex < trackArray.length - 1) {
                            return <span>{result}, </span>
                        }

                        return <span>{result}</span>
                    })

                    const addedBy = track.users.join(', ')
                    return (
                        <li key={index}>
                            {track.name} - {artists} (added by {addedBy ? addedBy : 'unknown'})
                        </li>
                    )
                }) }
            </ol>
        </div>
    )
}
