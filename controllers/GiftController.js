


const Gift = require('../models/GiftModel');
const { db } = require('../firebase/firebaseConfig');

const validateGiftData = (data) => {
  const errors = [];
  
  if (!data.senderId || typeof data.senderId !== 'string') {
    errors.push('senderId is required and must be a string');
  }
  
  if (!data.senderWallet || typeof data.senderWallet !== 'string') {
    errors.push('senderWallet is required and must be a string');
  }
  
  if (!data.recipientId || typeof data.recipientId !== 'string') {
    errors.push('recipientId is required and must be a string');
  }
  
  if (!data.recipientWallet || typeof data.recipientWallet !== 'string') {
    errors.push('recipientWallet is required and must be a string');
  }
  
  if (!data.postId || typeof data.postId !== 'string') {
    errors.push('postId is required and must be a string');
  }
  
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('amount is required and must be a positive number');
  }
  
  if (!data.token || typeof data.token !== 'string') {
    errors.push('token is required and must be a string');
  }
  
  if (data.senderBalanceAtTime !== null && (typeof data.senderBalanceAtTime !== 'number' || data.senderBalanceAtTime < 0)) {
    errors.push('senderBalanceAtTime must be a non-negative number or null');
  }

  return errors;
};


const giftController = {
  // Create a new gift
  async createGift(req, res) {
    try {
      console.log('=== CREATE GIFT REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('Request headers:', req.headers);

      const giftData = req.body;

      // Validate required fields
      const validationErrors = validateGiftData(giftData);
      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Additional business logic validation
      if (giftData.senderId === giftData.recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot send gift to yourself'
        });
      }

      // Create the gift
      const result = await Gift.create(giftData);
      
      console.log('Gift created successfully:', result.giftId);
      res.status(201).json({
        success: true,
        message: 'Gift created successfully',
        giftId: result.giftId,
        gift: result.gift
      });

    } catch (error) {
      console.error('Create gift error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Complete a gift transaction
  async completeGift(req, res) {
    try {
      console.log('=== COMPLETE GIFT REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      const { giftId, transactionSignature } = req.body;

      if (!giftId) {
        return res.status(400).json({
          success: false,
          message: 'giftId is required'
        });
      }

      if (!transactionSignature) {
        return res.status(400).json({
          success: false,
          message: 'transactionSignature is required'
        });
      }

      const result = await Gift.complete(giftId, transactionSignature);
      
      console.log('Gift completed successfully:', giftId);
      res.status(200).json({
        success: true,
        message: 'Gift completed successfully',
        gift: result.gift
      });

    } catch (error) {
      console.error('Complete gift error:', error);
      
      if (error.message === 'Gift not found') {
        return res.status(404).json({
          success: false,
          message: 'Gift not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Cancel a gift
  async cancelGift(req, res) {
    try {
      console.log('=== CANCEL GIFT REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      const { giftId } = req.body;

      if (!giftId) {
        return res.status(400).json({
          success: false,
          message: 'giftId is required'
        });
      }

      await Gift.cancel(giftId);
      
      console.log('Gift cancelled successfully:', giftId);
      res.status(200).json({
        success: true,
        message: 'Gift cancelled successfully'
      });

    } catch (error) {
      console.error('Cancel gift error:', error);
      
      if (error.message === 'Gift not found') {
        return res.status(404).json({
          success: false,
          message: 'Gift not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Get gifts for a post
  async getGiftsByPost(req, res) {
    try {
      const { postId } = req.params;

      if (!postId) {
        return res.status(400).json({
          success: false,
          message: 'postId is required'
        });
      }

      const gifts = await Gift.getByPostId(postId);
      
      res.status(200).json({
        success: true,
        gifts: gifts
      });

    } catch (error) {
      console.error('Get gifts error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = giftController;
