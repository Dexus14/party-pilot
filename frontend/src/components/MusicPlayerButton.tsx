import {useEffect, useState} from "react";

const BUTTON_DELAY = 700

export default function MusicPlayerButton({ icon, action }: { icon: string|JSX.Element, action: () => void }) {
    const [isHolding, setIsHolding] = useState(false);
    const [counter, setCounter] = useState<number|null>(null);

    useEffect(() => {
        if(!isHolding) {
            setCounter(null)
            return
        }

        if(counter === null) {
            const interval = window.setInterval(() => {
                setCounter(prev => {
                    if(prev !== null && prev > BUTTON_DELAY) {
                        setCounter(null)
                        setIsHolding(false)
                        action()
                    }
                    if(prev === null) return 100;
                    return prev + 100
                })
            }, 100)

            return () => {
                window.clearInterval(interval)
            }
        }
    }, [isHolding])

    return (
        <button
            className={"player-button " + (isHolding ? 'holding' : '')}
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onMouseLeave={() => setIsHolding(false)}
        >
            {icon}
        </button>
    )
}
