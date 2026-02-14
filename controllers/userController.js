import User from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      
      if (user.isApproved === false) {
         return res.status(401).json({ message: 'Account pending approval' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        sellerType: user.sellerType || 'customer',
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register a new user (API route fallback)
const registerUser = async (req, res) => {
  const { name, email, password, sellerType } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let userSellerType = 'customer';
    let isApproved = true;

    if (['clothes', 'furniture', 'kids'].includes(sellerType)) {
      userSellerType = sellerType;
      isApproved = false; 
    }

    const user = await User.create({
      name,
      email,
      password,
      sellerType: userSellerType,
      isApproved
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        sellerType: user.sellerType,
        isApproved: user.isApproved,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isAdmin || user.sellerType === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Approve or deactivate a reseller account
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the new approval status from the request body.
        const { isApproved } = req.body;
        if (typeof isApproved !== 'boolean') {
             return res.status(400).json({ message: 'A boolean `isApproved` status is required.' });
        }

        user.isApproved = isApproved;
        await user.save();

        const message = isApproved ? 'User approved successfully' : 'User account has been deactivated.';
        res.json({ message, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user balance from transactions
// @route   GET /api/users/balance
const getUserBalance = async (req, res) => {
    try {
        // Find transactions associated with the logged-in user's email
        // We use req.user.email which is populated by the 'protect' middleware
        if (!req.user || !req.user.email) {
             return res.status(401).json({ message: 'Not authorized' });
        }

        const transactions = await Transaction.find({ customerEmail: req.user.email });
        
        // Sum up the giftCardEarned field
        const balance = transactions.reduce((acc, txn) => acc + (txn.giftCardEarned || 0), 0);
        
        res.json({ balance });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { authUser, registerUser, getUsers, deleteUser, approveUser, getUserBalance };