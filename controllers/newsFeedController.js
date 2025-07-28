const model = require('../models/newsFeedModels');
const admin = require('firebase-admin'); // Make sure this is at the top
const {db} = require('../firebase/firebaseConfig');


exports.createPost = async (req, res) => {
  try {
    const { userId, caption, mediaItems } = req.body;

    if (!Array.isArray(mediaItems) || mediaItems.length === 0 || mediaItems.length > 5) {
      return res.status(400).json({ error: 'mediaItems must be an array of 1 to 5 media objects.' });
    }

    // Create post
    const postId = await model.createNewsPost({ userId, caption, mediaItems });

    // Fetch full created post
    const createdPost = await model.getNewsPostById(postId);

    res.status(201).json({ post: createdPost });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getAllPosts = async (req, res) => {
  try {
    const posts = await model.getAllNewsPosts();

    const postsWithUsers = await Promise.all(
      posts.map(async post => {
        try {
          if (!post.userId || typeof post.userId !== 'string' || post.userId.trim() === '') {
            throw new Error('Missing or invalid userId');
          }

          const userRef = db.collection('users').doc(post.userId);
          const userDoc = await userRef.get();

          if (!userDoc.exists) {
            throw new Error(`User not found for userId: ${post.userId}`);
          }

          const userData = userDoc.data();

          return {
            ...post,
            owner: {
              uid: userDoc.id,
              username: userData.username,
              email: userData.email,
              bio: userData.bio || '',
              walletAddress: userData.walletAddress || '',
              createdAt: userData.createdAt || '',
            }
          };
        } catch (err) {
          console.error(`Error fetching user for post ${post.id}:`, err.message);
          return {
            ...post,
            owner: null,
          };
        }
      })
    );

    res.status(200).json({ posts: postsWithUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getPostById = async (req, res) => {
  try {
    const post = await model.getNewsPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.status(200).json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.likePost = async (req, res) => {
  try {
    const { userId } = req.body;
    const { postId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Like the post
    await model.likeNewsPost(postId, userId);

    // Fetch updated post
    const postRef = admin.firestore().collection('news_feed').doc(postId);
    const doc = await postRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Post not found after liking' });
    }

    const postData = doc.data();
    postData.id = doc.id;

    // Format timestamp
    if (postData.createdAt?.toDate) {
      postData.createdAt = postData.createdAt.toDate().toISOString();
    }

    // Optionally fetch user details (if you store users in a `users` collection)
    let userDetails = null;
    try {
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (userDoc.exists) {
        userDetails = { id: userDoc.id, ...userDoc.data() };
      }
    } catch (err) {
      console.warn('Failed to fetch user details for like:', err.message);
    }

    res.status(200).json({
      message: 'Post liked',
      likedBy: userDetails || { userId },
      updatedPost: postData,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addComment = async (req, res) => {
  try {
    const { userId, comment } = req.body;

    if (!userId || !comment) {
      return res.status(400).json({ error: 'userId and comment are required' });
    }

    const commentId = await model.addCommentToPost(
      req.params.postId,
      userId,
      comment
    );

    // Fetch the newly created comment to return full detail
    const commentDoc = await admin
      .firestore()
      .collection('news_feed')
      .doc(req.params.postId)
      .collection('comments')
      .doc(commentId)
      .get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found after creation' });
    }

    const commentData = commentDoc.data();

    // Convert timestamp to ISO format
    if (commentData.createdAt?.toDate) {
      commentData.createdAt = commentData.createdAt.toDate().toISOString();
    }

    res.status(201).json({
      comment: {
        id: commentDoc.id,
        ...commentData,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.replyToComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId, reply } = req.body;

    if (!userId || !reply) {
      return res.status(400).json({ error: 'userId and reply are required' });
    }

    // Add reply
    await model.replyToComment(postId, commentId, userId, reply);

    // Get the updated comment
    const commentRef = admin
      .firestore()
      .collection('news_feed')
      .doc(postId)
      .collection('comments')
      .doc(commentId);

    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found after reply' });
    }

    const commentData = commentDoc.data();
    commentData.id = commentDoc.id;

    // Format timestamp
    if (commentData.createdAt?.toDate) {
      commentData.createdAt = commentData.createdAt.toDate().toISOString();
    }

    res.status(200).json({
      message: 'Reply added',
      updatedComment: commentData,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRepliesForComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const commentRef = admin
      .firestore()
      .collection('news_feed')
      .doc(postId)
      .collection('comments')
      .doc(commentId);

    const commentSnap = await commentRef.get();

    if (!commentSnap.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentSnap.data();

    const replies = (commentData.replies || []).map(reply => ({
      ...reply,
      createdAt: reply.createdAt?.toDate
        ? reply.createdAt.toDate().toISOString()
        : reply.createdAt,
    }));

    res.status(200).json({ replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getCommentsForPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const snapshot = await admin
      .firestore()
      .collection('news_feed')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .get();

    const comments = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        comment: data.comment,
        replies: data.replies || [],
        createdAt: data.createdAt?.toDate().toISOString() || null,
      };
    });

    res.status(200).json({ count: comments.length, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.giftPost = async (req, res) => {
  try {
    const { userId, giftType } = req.body;
    const { postId } = req.params;
    await model.giftNewsPost(postId, userId, giftType);
    const post = await model.getNewsPostById(postId);
    if (post.createdAt?.toDate) {
      post.createdAt = post.createdAt.toDate().toISOString();
    }
    res.status(200).json({ message: 'Post gifted', giftedBy: userId, giftType, post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const { userId } = req.body;
    const { postId } = req.params;
    await model.shareNewsPost(postId, userId);
    const post = await model.getNewsPostById(postId);
    if (post.createdAt?.toDate) {
      post.createdAt = post.createdAt.toDate().toISOString();
    }
    res.status(200).json({ message: 'Post shared', sharedBy: userId, post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
