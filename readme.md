<img src="https://i.ibb.co/KN73jsM/cover.png" alt="cover" border="0">

# Party pilot
Party pilot is a simple web app that allows you to create Spotify queues from multiple devices that are played on only one.

## About
### How to use
Simply press the "create room" button and allow access to required permissions. You will be redirected to a room page where you can add songs to the playlist. At this point make sure your Spotify is playing on any device or else you will be informed that the app can't add any songs. You can also share the link or QR code with your friends, so they can add songs to the playlist as well. Use the "options" button to be able to add a limit to added songs per each user, change the room name or delete the room.
### Features
- Add songs to room owner's from multiple devices
- Control the playback of the room owner's device
- Limit songs per user
- Support for Polish and English language
- QR code and invite copy link button for easy sharing

## How to run dev version
### Requirements
- Node.js
- NPM or Yarn

### Steps
1. Clone the repository
2. Run `npm install` or `yarn install` in both backend and frontend directories
3. Fill in the required environment variables in the `.env` file (see `.env.example` for reference)
4. Run `npm build` or `yarn build` in backend directory. Alternatively use `tsc -watch` to automatically rebuild the project on file changes
5. Run `npm start` or `yarn start` in the backend directory or use `nodemon dist/index.js` to automatically restart the server on file changes
6. Open `localhost:3002` (or whichever port you set in .env file) in your browser
7. Enjoy!

## How to run production version
### Requirements
- Node.js
- NPM or Yarn
### Steps
1. Clone the repository
2. Run `npm install` or `yarn install` in both backend and frontend directories
3. Fill in the required environment variables in the `.env` file (see `.env.example` for reference)
4. Run `npm run build` or `yarn build` in the frontend and backend directory
5. Run `npm start` or `yarn start` in the backend directory
6. Enjoy!

## Testing
Simply run `npm run test` or `yarn test` in the backend directory.

## .env file description
### Backend
- `PORT` - port on which the backend and static pages will run
- `APP_DEV_URL` - url of the frontend (only required for dev)
- `SPOTIFY_CLIENT_ID` - Spotify client id
- `SPOTIFY_CLIENT_SECRET` - Spotify client secret
- `SPOTIFY_TOKEN_LIFETIME_MILLIS` - The lifetime of the Spotify token in milliseconds (don't change it unless you are certain Spotify token lifetime has changed)
- `TRACK_UPDATE_INTERVAL_MS` - The interval in milliseconds at which the current room track and queue should be automatically updated
- `APP_ENV` - The environment in which the app is running (can be either `dev` or `prod`)
- `JWT_SECRET` - The secret used to sign the JWT tokens

### Frontend
- `REACT_APP_WEBSOCKET_URL` - The url of the websocket server (only required for dev)
- `REACT_APP_ENV` - The environment in which the app is running (can be either `dev` or `prod`)
