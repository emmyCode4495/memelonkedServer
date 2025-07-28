const {
  createMemePost,
  getAllMemePosts,
  getMemePostById,
  likeMemePost,
  addCommentToMeme,
  replyToMemeComment,
  getCommentsForMeme,
  giftMemePost,
  shareMemePost,
} = require('../models/CreateMemeModel');

exports.createMeme = async (req, res) => {
 try {
    const { userId, memeText, mediaItems } = req.body;

    if (!userId || !memeText || !Array.isArray(mediaItems) || mediaItems.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const postId = await createMemePost({ userId, memeText, mediaItems });
    const meme = await getMemePostById(postId);

    return res.status(201).json({
      message: 'Meme created successfully',
      meme
    });
  } catch (error) {
    console.error('Error creating meme:', error.message);
    return res.status(500).json({ error: 'Failed to create meme' });
  }
};

exports.getMemes = async (req, res) => {
  try {
    const memes = await getAllMemePosts();
    res.json(memes);
  } catch (error) {
    console.error('Get Memes Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
};

exports.getMeme = async (req, res) => {
 try {
    const { memeId } = req.params;

    const meme = await getMemePostById(memeId);

    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    res.status(200).json({ meme });
  } catch (error) {
    console.error('Get Meme Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch meme' });
  }
};

exports.likeMeme = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    await likeMemePost(postId, userId);
    res.json({ message: 'Meme liked' });
  } catch (error) {
    console.error('Like Meme Error:', error.message);
    res.status(500).json({ error: 'Failed to like meme' });
  }
};

exports.commentMeme = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, comment } = req.body;

    const commentId = await addCommentToMeme(postId, userId, comment);
    res.status(201).json({ message: 'Comment added', commentId });
  } catch (error) {
    console.error('Comment Meme Error:', error.message);
    res.status(500).json({ error: 'Failed to comment on meme' });
  }
};

exports.replyComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId, reply } = req.body;

    await replyToMemeComment(postId, commentId, userId, reply);
    res.json({ message: 'Reply added' });
  } catch (error) {
    console.error('Reply Comment Error:', error.message);
    res.status(500).json({ error: 'Failed to reply to comment' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await getCommentsForMeme(postId);
    res.json(comments);
  } catch (error) {
    console.error('Get Comments Error:', error.message);
    res.status(500).json({ error: 'Failed to get comments' });
  }
};

exports.giftMeme = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, giftType } = req.body;

    await giftMemePost(postId, userId, giftType);
    res.json({ message: 'Gift sent' });
  } catch (error) {
    console.error('Gift Meme Error:', error.message);
    res.status(500).json({ error: 'Failed to send gift' });
  }
};

exports.shareMeme = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    await shareMemePost(postId, userId);
    res.json({ message: 'Meme shared' });
  } catch (error) {
    console.error('Share Meme Error:', error.message);
    res.status(500).json({ error: 'Failed to share meme' });
  }
};
