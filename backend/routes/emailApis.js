import express from 'express';
import userAuth from '../middleware/auth.js';
import EmailAccount from '../models/EmailAccount.js';

const emailRouter = express.Router();

emailRouter.get('/connected-accounts',userAuth, async (req, res) => {
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

export default emailRouter;
