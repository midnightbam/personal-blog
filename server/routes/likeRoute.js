import express from 'express';
import { getLikes, createLike, deleteLike } from '../controllers/likeController.js';

const router = express.Router();

// GET likes for a post
router.get('/:postId', getLikes);

// CREATE like
router.post('/:postId', createLike);

// DELETE like
router.delete('/:postId', deleteLike);

export default router;
