import {useEffect, useState} from "react";
import axios from "axios";
import {Socket} from "socket.io-client";

export default function SongSearch({ socket }: { socket: Socket }) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        if (search.length > 2) { // TODO: Add delay between requests
            axios.get('http://192.168.8.108:3002/api/spotify/search_song', {
                params: {
                    q: search
                },
                signal: abortController.signal
            }).then((res) => {
                console.log(res.data)
                setResults(res.data)
            }).catch((err) => {})
        }

        return () => {
            abortController.abort();
        }
    }, [search]);

    return (
        <div className="SongSearch">
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <ul>
                {results.map((result) => (
                    <li
                        key={result.uri}
                        onClick={() => socket.emit('songAddToQueue', result.uri)}
                        className={selected?.uri === result.uri ? 'selected' : ''}
                    >
                        <img src={result.albumImage} alt="album image"/>
                        {result.name} - {result.artists} ({result.album}) - {result.duration}
                    </li>
                ))}
            </ul>
        </div>
    );
}
