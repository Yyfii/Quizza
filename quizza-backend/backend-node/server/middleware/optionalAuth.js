// middlewares/optionalAuth.js
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || 
                  req.headers?.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id)
        .select('_id name email isAccountVerified');
      if (user) {
        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          isAccountVerified: user.isAccountVerified
        };
      }
    }
    next();
  } catch (err) {
    console.warn("Token inválido no optionalAuth:", err.message);
    // Mesmo que falhe, continua como público
    next();
  }
};

export default optionalAuth;
