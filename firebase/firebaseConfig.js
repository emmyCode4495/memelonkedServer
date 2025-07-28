require('dotenv').config();
// firebase.js
const admin = require('firebase-admin');


// Decode the base64 string into JSON
const serviceAccount = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

module.exports = { admin, db, FieldValue };
