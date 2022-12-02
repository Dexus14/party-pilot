export default function RoomUsers({ room }: { room: any }) {
    console.log(room)
    return (
        <div className={"room-users"}>
            <ol>
                { room.users.map((user: any) => {
                    return (
                    <li style={{ color: user.currentlyActive ? 'green' : 'red' }}>
                        {user.username}
                    </li>
                    )
                }) }
            </ol>
        </div>
    )
}
