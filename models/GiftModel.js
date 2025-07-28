// const { db, FieldValue } = require('../firebase/firebaseConfig');

// class Gift {
//   static async create(giftData) {
//     try {
//       const giftRef = db.collection('gifts').doc();
      
//       const gift = {
//         ...giftData,
//         id: giftRef.id,
//         status: 'pending',
//         createdAt: FieldValue.serverTimestamp(),
//         updatedAt: FieldValue.serverTimestamp(),
//         txSignature: null
//       };

//       await giftRef.set(gift);
//       return { 
//         success: true,
//         giftId: giftRef.id,
//         ...gift 
//       };
//     } catch (error) {
//       console.error('Model create error:', error);
//       throw new Error('Failed to create gift record');
//     }
//   }

//   static async complete(giftId, txSignature) {
//     try {
//       const giftRef = db.collection('gifts').doc(giftId);
      
//       await giftRef.update({
//         status: 'completed',
//         txSignature,
//         updatedAt: FieldValue.serverTimestamp()
//       });

//       const doc = await giftRef.get();
//       if (!doc.exists) {
//         throw new Error('Gift not found');
//       }
      
//       return doc.data();
//     } catch (error) {
//       console.error('Model complete error:', error);
//       throw new Error('Failed to complete gift');
//     }
//   }
// }

// module.exports = Gift;

const { db, FieldValue } = require('../firebase/firebaseConfig');

class Gift {
  static async create(giftData) {
    try {
      const giftRef = db.collection('gifts').doc();
      
      const gift = {
        ...giftData,
        id: giftRef.id,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        txSignature: null
      };

      await giftRef.set(gift);
      
      // Return the gift data with timestamps converted for frontend
      const createdGift = await giftRef.get();
      return { 
        success: true,
        giftId: giftRef.id,
        gift: createdGift.data()
      };
    } catch (error) {
      console.error('Model create error:', error);
      throw new Error('Failed to create gift record');
    }
  }

  static async complete(giftId, txSignature) {
    try {
      const giftRef = db.collection('gifts').doc(giftId);
      
      // Check if gift exists first
      const doc = await giftRef.get();
      if (!doc.exists) {
        throw new Error('Gift not found');
      }

      await giftRef.update({
        status: 'completed',
        txSignature,
        updatedAt: FieldValue.serverTimestamp()
      });

      // Get updated document
      const updatedDoc = await giftRef.get();
      return {
        success: true,
        gift: updatedDoc.data()
      };
    } catch (error) {
      console.error('Model complete error:', error);
      throw error;
    }
  }

  static async cancel(giftId) {
    try {
      const giftRef = db.collection('gifts').doc(giftId);
      
      // Check if gift exists first
      const doc = await giftRef.get();
      if (!doc.exists) {
        throw new Error('Gift not found');
      }

      await giftRef.update({
        status: 'cancelled',
        updatedAt: FieldValue.serverTimestamp()
      });

      return { success: true, message: 'Gift cancelled successfully' };
    } catch (error) {
      console.error('Model cancel error:', error);
      throw error;
    }
  }

  static async getByPostId(postId) {
    try {
      const giftsSnapshot = await db.collection('gifts')
        .where('postId', '==', postId)
        .where('status', '==', 'completed')
        .orderBy('createdAt', 'desc')
        .get();

      const gifts = [];
      giftsSnapshot.forEach(doc => {
        gifts.push({ id: doc.id, ...doc.data() });
      });

      return gifts;
    } catch (error) {
      console.error('Model getByPostId error:', error);
      throw new Error('Failed to fetch gifts');
    }
  }
}

module.exports = Gift;