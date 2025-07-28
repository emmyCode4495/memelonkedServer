const Reel = require('../models/ReelModel');
const admin = require('firebase-admin');
const db = admin.firestore();
const { v4: uuidv4 } = require('uuid');

exports.createReel = async (req, res) => {
  const { userId, videoUrl, caption, pov } = req.body;

  if (!userId || !videoUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const reel = {
    userId,
    videoUrl,
    caption: caption || '',
    pov: pov || '', // 👈 Optional POV
    createdAt: new Date().toISOString(),
    likes: 0,
    gifts: 0,
    comments: [],
    shares: 0,
  };

  try {
    const docRef = await db.collection('reels').add(reel);
    res.status(201).json({ message: 'Reel created', reelId: docRef.id, reel });
  } catch (err) {
    console.error('Error creating reel:', err);
    res.status(500).json({ error: err.message });
  }
};


exports.likeReel = async (req, res) => {
  try {
    const { id } = req.params;
    const reelRef = db.collection('reels').doc(id);
    await reelRef.update({ likes: admin.firestore.FieldValue.increment(1) });
    res.status(200).json({ message: 'Reel liked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.giftReel = async (req, res) => {
  try {
    const { id } = req.params;
    const reelRef = db.collection('reels').doc(id);
    await reelRef.update({ gifts: admin.firestore.FieldValue.increment(1) });
    res.status(200).json({ message: 'Gift added to reel' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.commentReel = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, commentText } = req.body;

    const comment = {
      commentId: uuidv4(),
      uid,
      commentText,
      replies: [],
      createdAt: new Date().toISOString(),
    };

    const reelRef = db.collection('reels').doc(id);
    await reelRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(comment),
    });

    res.status(200).json({ message: 'Comment added', comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replyToComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { uid, replyText } = req.body;

    const reply = {
      uid,
      replyText,
      createdAt: new Date().toISOString(),
    };

    const reelRef = db.collection('reels').doc(id);
    const reelDoc = await reelRef.get();

    if (!reelDoc.exists) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    const reelData = reelDoc.data();
    const comments = reelData.comments || [];

    const updatedComments = comments.map(comment => {
      if (comment.commentId === commentId) {
        const updatedReplies = comment.replies || [];
        return {
          ...comment,
          replies: [...updatedReplies, reply],
        };
      }
      return comment;
    });

    await reelRef.update({ comments: updatedComments });

    res.status(200).json({ message: 'Reply added', reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getCommentReplies = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const reelRef = db.collection('reels').doc(id);
    const reelDoc = await reelRef.get();

    if (!reelDoc.exists) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    const reelData = reelDoc.data();
    const comments = reelData.comments || [];

    const comment = comments.find(c => c.commentId === commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const replies = comment.replies || [];

    res.status(200).json({ replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all comments for a specific reel
exports.getReelComments = async (req, res) => {
  try {
    const { id } = req.params;

    const reelDoc = await db.collection('reels').doc(id).get();
    if (!reelDoc.exists) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    const reelData = reelDoc.data();
    const comments = reelData.comments || [];

    res.status(200).json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.shareReel = async (req, res) => {
  try {
    const { id } = req.params;
    const reelRef = db.collection('reels').doc(id);
    await reelRef.update({ shares: admin.firestore.FieldValue.increment(1) });
    res.status(200).json({ message: 'Reel shared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all reels
exports.getAllReels = async (req, res) => {
  try {
    const snapshot = await db.collection('reels').orderBy('createdAt', 'desc').get();
    const reels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ reels });
  } catch (err) {
    console.error('Error fetching reels:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get reel by ID
exports.getReelById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await db.collection('reels').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Error fetching reel:', err);
    res.status(500).json({ error: err.message });
  }
};