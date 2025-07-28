const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const db = admin.firestore();

class Reel {
  constructor({ uid, videoUrl, caption, thumbnailUrl }) {
    this.id = uuidv4();
    this.uid = uid;
    this.videoUrl = videoUrl;
    this.thumbnailUrl = thumbnailUrl || '';
    this.caption = caption || '';
    this.likes = 0;
    this.comments = [];
    this.gifts = 0;
    this.shares = 0;
    this.createdAt = new Date().toISOString();
  }

  toFirestore() {
    return { ...this };
  }
}

module.exports = Reel;