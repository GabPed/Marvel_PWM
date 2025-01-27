import express from 'express';
import {getUser, getUserByUsername, searchUsersByUsername, deleteUser, updateUser, getUserById} from '../controllers/users.js'

const router = express.Router();

router.get('/search/:username', searchUsersByUsername);
router.get('/:id',getUserById)
router.get('/username/:username',getUserByUsername)
router.get('/',getUser)
router.delete('/', deleteUser)
router.patch('/', updateUser)

export default router;