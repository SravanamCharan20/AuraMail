import express from 'express';
import userAuth from '../middleware/auth.js';
import EmailAccount from '../models/EmailAccount.js';

const emailRouter = express.Router();

emailRouter.get('/connected-accounts', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const connectedAccounts = await EmailAccount.find({
      userId: userId,
      provider: 'gmail',
    }).select('email provider createdAt');

    if (connectedAccounts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(connectedAccounts);
  } catch (err) {
    res.send('Error : ' + err.message);
  }
});

emailRouter.delete('/disconnect', userAuth, async (req, res) => {
  try {
    const { accountId } = req.body;
    const userId = req.user._id;

    if (!accountId) {
      return res.status(400).json({ message: 'accountId required' });
    }

    const deleted = await EmailAccount.findOneAndDelete({
      _id: accountId,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Account not found' });
    }

    return res.json({
      success: true,
      message: 'Email account disconnected',
    });
  } catch (err) {
    console.error('❌ Disconnect error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default emailRouter;
