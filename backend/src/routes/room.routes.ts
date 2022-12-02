import express from "express";
import {getRoomAuth, getRoomCreate, roomJoinGet, roomJoinPost} from "../controller/room.controller";

const router = express.Router();

router.get('/auth/spotify', getRoomAuth)
router.get('/create', getRoomCreate)
router.get('/join/:roomId?', roomJoinGet)
router.post('/join/:roomId', roomJoinPost)

export default router
