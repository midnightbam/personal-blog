import express from 'express';
import { getUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

// GET user
router.get('/:userId', getUser);

// UPDATE user
router.put('/:userId', updateUser);

export default router;
