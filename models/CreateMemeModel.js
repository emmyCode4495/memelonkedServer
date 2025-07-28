const admin = require('firebase-admin');
const db = admin.firestore();


const createMemePost = async ({ userId, memeText, mediaItems, hasSound = false }) => {
  if (!Array.isArray(mediaItems) || mediaItems.length === 0 || mediaItems.length > 5) {
    throw new Error('You must provide between 1 and 5 media items.');
  }

  const postRef = await db.collection('memes').add({
    userId,
    memeText,
    mediaItems,  // array of { url, type }
    likes: [],
    gifts: [],
    shares: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (!postRef.id) {
    throw new Error('Failed to create meme post. Firestore returned no ID');
  }

  return postRef.id;
};

// Get all memes
const getAllMemePosts = async () => {
  const snapshot = await db.collection('memes').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || null
    };
  });
};

// Get a single meme
const getMemePostById = async (postId) => {
  const doc = await db.collection('memes').doc(postId).get();
  if (!doc.exists) return null;

  const data = doc.data();

  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate().toISOString() || null
  };
};

// Like a meme
const likeMemePost = async (postId, userId) => {
  const postRef = db.collection('memes').doc(postId);
  await postRef.update({
    likes: admin.firestore.FieldValue.arrayUnion(userId),
  });
};

// Comment on a meme
const addCommentToMeme = async (postId, userId, comment) => {
  const commentRef = await db.collection('memes').doc(postId).collection('comments').add({
    userId,
    comment,
    replies: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return commentRef.id;
};

// Reply to a meme comment
const replyToMemeComment = async (postId, commentId, userId, reply) => {
  const commentRef = db.collection('memes').doc(postId).collection('comments').doc(commentId);
  await commentRef.update({
    replies: admin.firestore.FieldValue.arrayUnion({ userId, reply }),
  });
};

// Get comments for a meme
const getCommentsForMeme = async (postId) => {
  const snapshot = await db.collection('memes').doc(postId).collection('comments').orderBy('createdAt', 'asc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Gift a meme post
const giftMemePost = async (postId, userId, giftType) => {
  const postRef = db.collection('memes').doc(postId);
  await postRef.update({
    gifts: admin.firestore.FieldValue.arrayUnion({ userId, giftType, sentAt: new Date().toISOString() }),
  });
};

// Share a meme
const shareMemePost = async (postId, userId) => {
  const postRef = db.collection('memes').doc(postId);
  await postRef.update({
    shares: admin.firestore.FieldValue.arrayUnion({ userId, sharedAt: new Date().toISOString() }),
  });
};

module.exports = {
  createMemePost,
  getAllMemePosts,
  getMemePostById,
  likeMemePost,
  addCommentToMeme,
  replyToMemeComment,
  getCommentsForMeme,
  giftMemePost,
  shareMemePost,
};
