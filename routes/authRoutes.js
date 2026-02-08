import express from 'express';
import passport from '../config/passport.js';
import { signup, logout, forgotPassword, resetPassword } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Session-based signup
router.post('/signup', signup);

// Session-based login handled by passport at /auth/login via frontend POST
router.post('/login', passport.authenticate('local'), (req, res) => {
  // Ensure session is saved before responding
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ message: 'Session error' });
    }
    console.log('✓ Session created and saved:', req.session.id);
    console.log('✓ User serialized in session:', req.session.passport?.user);
    
    const user = req.user;
    
    // Also generate a JWT token as fallback for API authentication
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'dev_fallback_secret_change_me',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        isAdmin: user.isAdmin, 
        sellerType: user.sellerType,
        token: token
      } 
    });
  });
});

// Return the current logged-in user for session-based auth (used when admin logged-in via session cookies)
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      sellerType: req.user.sellerType
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

router.post('/logout', logout);

router.post('/forgot', forgotPassword);

router.post('/reset/:token', resetPassword);

export default router;
