import express from 'express';
import { getAllPosts, getPostById } from '../controllers/postController.js';

const router = express.Router();

// GET all posts
router.get('/', getAllPosts);

// GET single post by ID
router.get('/:id', getPostById);

export default router;
