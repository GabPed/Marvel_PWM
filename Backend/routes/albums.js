import express from 'express';
import {buyStickerPacks, getAlbum, getAlbumByState, getAlbumByUsername, getListedCards, listCard, sellCard, unlistCard} from '../controllers/albums.js'

const router = express.Router();

router.get('/',getAlbum)
router.get('/listedCards',getListedCards)
router.get('/state/:state',getAlbumByState)
router.get('/username/:username',getAlbumByUsername)
router.patch('/buyStickerPacks', buyStickerPacks)
router.patch('/listCard', listCard)
router.patch('/sellCard', sellCard)
router.patch('/unlistCard', unlistCard)

export default router;