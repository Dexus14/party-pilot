export function randomString(length: number) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function encodeFormData(data: any) {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
}

export function getRoomJoinErorrMessage(error: string) {
    switch (error) {
        case 'missingParameters':
            return 'Missing parameters - please fill out both fields'
        case 'roomDoesNotExist':
            return 'This room does not exist'
        default:
            return 'Unknown error'
    }
}

export function getMainSuccessMessage(success: string) {
    switch (success) {
        case 'roomDestroyed':
            return 'Room destroyed successfully'
        default:
            return 'Unknown success'
    }
}

export function getMainErrorMessage(error: string) {
    switch (error) {
        case 'errorDestroying':
            return 'An unknown error occured while trying to destroy room'
        default:
            return 'Unknown error'
    }
}
