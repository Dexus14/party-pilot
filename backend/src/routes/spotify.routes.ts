import express from "express";
import {getSpotifySearchSong} from "../controller/spotify.controller";

const router = express.Router();

router.get('/search_song', getSpotifySearchSong)
export default router
