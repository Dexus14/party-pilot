import {Table} from "react-bootstrap";

export default function RoomUsers({ room, currentUsername }: { room: any, currentUsername: string }) {
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Avatar</th>
                </tr>
            </thead>
            <tbody>
                { room.users.map((user: any, key: number) => {
                    const avatar = 'https://api.multiavatar.com/' + user.username + '.svg'

                    return (
                        <tr key={key}>
                            <td>{key+1}</td>
                            <td
                                // style={{ color: user.currentlyActive ? 'black' : 'lightgray' }}
                            >
                                {user.username === currentUsername ? <>{user.username} (you)</> : <>{user.username}</>}
                            </td>
                            <td className={"text-center"}>
                                <img className={"avatar-sm"} src={avatar} alt="user avatar"/>
                            </td>
                        </tr>
                    )
                }) }
            </tbody>
        </Table>
    )
}
