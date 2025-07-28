const admin = require('firebase-admin');
const db = admin.firestore();

const createNewsPost = async ({ userId, caption, mediaItems }) => {
  if (!Array.isArray(mediaItems) || mediaItems.length === 0 || mediaItems.length > 5) {
    throw new Error('You must provide between 1 and 5 media items.');
  }

  const postRef = await db.collection('news_feed').add({
    userId,
    caption,
    mediaItems,  // array of { url, type }
    likes: [],
    gifts: [],
    shares: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (!postRef.id) {
    throw new Error('Failed to create post. Firestore returned no ID');
  }

  return postRef.id;
};


const getAllNewsPosts = async () => {
  const snapshot = await db.collection('news_feed').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || null
    };
  });
};


const getNewsPostById = async (postId) => {
  const doc = await db.collection('news_feed').doc(postId).get();
  if (!doc.exists) return null;

  const data = doc.data();

  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate().toISOString() || null
  };
};


const likeNewsPost = async (postId, userId) => {
  const postRef = db.collection('news_feed').doc(postId);
  await postRef.update({
    likes: admin.firestore.FieldValue.arrayUnion(userId),
  });
};

const addCommentToPost = async (postId, userId, comment) => {
  const commentRef = await db.collection('news_feed').doc(postId).collection('comments').add({
    userId,
    comment,
    replies: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return commentRef.id;
};

const replyToComment = async (postId, commentId, userId, reply) => {
  const commentRef = db.collection('news_feed').doc(postId).collection('comments').doc(commentId);
  await commentRef.update({
    replies: admin.firestore.FieldValue.arrayUnion({ userId, reply }),
  });
};

const getCommentsForPost = async (postId) => {
  const snapshot = await db.collection('news_feed').doc(postId).collection('comments').orderBy('createdAt', 'asc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const giftNewsPost = async (postId, userId, giftType) => {
  const postRef = db.collection('news_feed').doc(postId);
  await postRef.update({
    gifts: admin.firestore.FieldValue.arrayUnion({ userId, giftType, sentAt: new Date().toISOString() }),
  });
};

const shareNewsPost = async (postId, userId) => {
  const postRef = db.collection('news_feed').doc(postId);
  await postRef.update({
    shares: admin.firestore.FieldValue.arrayUnion({ userId, sharedAt: new Date().toISOString() }),
  });
};


module.exports = {
  createNewsPost,
  getAllNewsPosts,
  getNewsPostById,
  likeNewsPost,
  addCommentToPost,
  replyToComment,
  getCommentsForPost,
   giftNewsPost,
  shareNewsPost,
};
