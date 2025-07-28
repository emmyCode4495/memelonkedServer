const express = require('express');
const router = express.Router();
const controller = require('../controllers/newsFeedController');

router.post('/create', controller.createPost);
router.get('/all', controller.getAllPosts);
router.get('/:id', controller.getPostById);
router.post('/:postId/like', controller.likePost);
router.post('/:postId/comment', controller.addComment);
router.post('/:postId/comment/:commentId/reply', controller.replyToComment);
router.get('/:postId/comment/:commentId/replies', controller.getRepliesForComment);
router.get('/:postId/comments', controller.getCommentsForPost);
router.post('/:postId/gift', controller.giftPost);
router.post('/:postId/share', controller.sharePost);

module.exports = router;