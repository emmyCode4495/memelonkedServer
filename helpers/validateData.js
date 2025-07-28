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

