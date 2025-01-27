import express from 'express';
import { getCharacterInfo } from '../controllers/characters.js';

const router = express.Router();

router.get('/:id',getCharacterInfo);

export default router;