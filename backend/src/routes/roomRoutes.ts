import express from "express";
import {room, roomAuth, roomCreate, roomJoinGet, roomJoinPost} from "../controller/room.controller";

const router = express.Router();

router.get('/auth/spotify', roomAuth)
router.get('/create', roomCreate)
router.get('/join/:roomId', roomJoinGet)
router.post('/join/:roomId', roomJoinPost)
router.get('/:roomId', room)

export default router
