import crypto from 'crypto';
import User from '../models/userModel.js';

// Sign up and log in the user via session
const signup = async (req, res) => {
  const { name, email, password, sellerType } = req.body;
  
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    // Sanitize seller type
    let userSellerType = 'customer';
    let isApproved = true;

    // Only allow specific reseller types to be requested
    if (['clothes', 'furniture', 'kids'].includes(sellerType)) {
      userSellerType = sellerType;
      isApproved = false; // Resellers require approval
    }

    const user = await User.create({ 
      name, 
      email, 
      password,
      sellerType: userSellerType,
      isApproved: isApproved
    });

    // If it's a reseller, do not log them in immediately.
    if (!isApproved) {
      return res.json({ 
        message: 'Signup successful. Your reseller account is pending approval by an admin.',
        user: null,
        pendingApproval: true
      });
    }

    // Log customer in immediately
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Signup error' });
      return res.json({ message: 'Signed up', user: { _id: user._id, name: user.name, email: user.email, sellerType: user.sellerType } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link was sent.' });
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    console.log(`Password reset token for ${email}: ${token}`);
    res.json({ message: 'Reset token generated', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export { signup, logout, forgotPassword, resetPassword };