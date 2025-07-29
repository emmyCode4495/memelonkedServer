const {db} = require('../firebase/firebaseConfig');
const UserModel = require('../models/UserModel');

exports.createUser = async (req, res) => {
  const { username, email, bio, walletAddress } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newUser = {
    username,
    email,
    bio: bio || '',
    walletAddress: walletAddress || '',
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await db.collection('users').add(newUser); // Firestore auto-generates ID
    const uid = docRef.id;

    // Optionally, update the doc to include the uid inside the doc
    await docRef.update({ uid });

    res.status(201).json({ message: 'success', uid, user: { ...newUser, uid } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Controller: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();

    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Controller: Get user by uid (Firestore doc ID)
exports.getUserById = async (req, res) => {
  const { uid } = req.params;

  try {
    const doc = await db.collection('users').doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = { uid: doc.id, ...doc.data() };
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Controller
exports.getUserByWallet = async (req, res) => {
  const { wallet } = req.query;

  if (!wallet) return res.status(400).json({ error: 'Wallet address is required' });

  try {
    const snapshot = await db
      .collection('users')
      .where('walletAddress', '==', wallet)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = snapshot.docs[0].data();
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getUser = async (req, res) => {
  const { uid } = req.params;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
