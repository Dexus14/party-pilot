import {Placeholder, Spinner, Table} from "react-bootstrap";
import useLanguage from "../hooks/useLanguage";

function generatePlaceholder() {
    return [...Array(3)].map((_: any, key: number) => {
        return (
            <tr key={key}>
                <td>{key+1}</td>
                <td>
                    <Placeholder animation={'glow'}>
                        <Placeholder xs={Math.floor(2 + Math.random() * 5)} size={'sm'} />
                    </Placeholder>
                </td>
                <td className={"text-center"}>
                    <Spinner animation="grow" />
                </td>
            </tr>
        )
    })
}

export default function RoomUsers({ room, currentUsername }: { room: any, currentUsername: string }) {
    const { content } = useLanguage()

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>#</th>
                    <th>{ content.username }</th>
                    <th>{ content.avatar }</th>
                </tr>
            </thead>
            <tbody>
                { !room ? generatePlaceholder() : room.users.map((user: any, key: number) => {
                    const avatar = 'https://api.multiavatar.com/' + user.username + '.svg'

                    return (
                        <tr key={key}>
                            <td>{key+1}</td>
                            <td
                                style={{ fontWeight: user.currentlyActive ? 'bold' : 'normal' }}
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
