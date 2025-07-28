const express = require('express');
const router = express.Router();
const memeController = require('../controllers/memeController');

// POST: Create a meme
router.post('/create', memeController.createMeme);

// GET: All memes
router.get('/get/all-memes', memeController.getMemes);

// GET: Single meme
router.get('/get/:memeId/meme', memeController.getMeme);

// POST: Like meme
router.post('/:postId/like', memeController.likeMeme);

// POST: Comment on meme
router.post('/:postId/comment', memeController.commentMeme);

// POST: Reply to comment
router.post('/:postId/comment/:commentId/reply', memeController.replyComment);

// GET: Comments
router.get('/:postId/comments', memeController.getComments);

// POST: Gift meme
router.post('/:postId/gift', memeController.giftMeme);

// POST: Share meme
router.post('/:postId/share', memeController.shareMeme);

module.exports = router;
