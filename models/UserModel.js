class UserModel {
  constructor(uid, username, email, bio = '', walletAddress = '') {
    this.uid = uid;
    this.username = username;
    this.email = email;
    this.bio = bio;
    this.walletAddress = walletAddress;
    this.createdAt = new Date().toISOString();
  }
}

module.exports = UserModel;
