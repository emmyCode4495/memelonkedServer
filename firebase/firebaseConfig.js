// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Ensure you have your service account key JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

module.exports = { admin, db, FieldValue };
