import {Toast, ToastContainer} from "react-bootstrap";

export default function ErrorToasts({ errors, removeError }: { errors: string[], removeError: any }) {
    return (
        <ToastContainer>
            {
                errors.map((error, index) => {
                    return (
                        <Toast key={index} bg={'danger'} autohide={true} onClose={() => removeError(index)}>
                            <Toast.Header><strong>Error</strong></Toast.Header>
                            <Toast.Body>{error}</Toast.Body>
                        </Toast>
                    )
                })
            }
        </ToastContainer>
    )
}
