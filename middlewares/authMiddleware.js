const Partner = require('../models/partnerModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);

        const user = await User.findByPk(decoded?.id);
        if (user) {
          req.user = user;
          next();
        } else {
          const partner = await Partner.findByPk(decoded?.id);
          if (partner) {
            req.user = partner;
            next();
          } else {
            throw new Error('User or partner not found');
          }
        }
      }
    } catch (error) {
      console.error('Authentication Error:', error);
      throw new Error('Not authorized, please login again');
    }
  } else {
    throw new Error('There is no token attached');
  }
});

const isPartner = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const partnerUser = await Partner.findOne({ where: { email } }); 
  if (partnerUser && partnerUser.role === 'Partner') {
    next();
  } else {
    throw new Error('You are not Partner');
  }
});

const isUser = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const user = await User.findOne({ where: { email } }); 
  if (user && sellerUser.role === 'user') {
    next();
  } else {
    throw new Error('You are not User');
  }
});

module.exports = { authMiddleware, isPartner ,isUser};
