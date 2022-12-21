import express from "express";
import {destroyRoomGet, roomAuthGet, roomCreateGet, roomJoinGet, roomJoinPost} from "../controller/room.controller";

const router = express.Router();

router.get('/auth/spotify', roomAuthGet)
router.get('/create', roomCreateGet)
router.get('/join/:roomId?', roomJoinGet)
router.post('/join/:roomId?', roomJoinPost)
router.get('/destroy', destroyRoomGet)

export default router
