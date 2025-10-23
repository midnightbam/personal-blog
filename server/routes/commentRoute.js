import express from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController.js';

const router = express.Router();

// GET comments for a post
router.get('/:postId', getComments);

// CREATE comment
router.post('/:postId', createComment);

// DELETE comment
router.delete('/:commentId', deleteComment);

export default router;
