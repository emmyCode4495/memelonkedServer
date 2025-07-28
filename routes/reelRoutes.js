const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');

router.post('/create', reelController.createReel);
router.post('/:id/like', reelController.likeReel);
router.post('/:id/gift', reelController.giftReel);
router.post('/:id/comment', reelController.commentReel);
router.post('/:id/comments/:commentId/reply', reelController.replyToComment);
router.get('/:id/comments/:commentId/replies', reelController.getCommentReplies);
router.get('/:id/get-comments', reelController.getReelComments);
router.post('/:id/share', reelController.shareReel);
router.get('/get-all-reels', reelController.getAllReels);        
router.get('/:id/get-reels-by-id', reelController.getReelById);   

module.exports = router;