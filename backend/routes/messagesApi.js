import express from 'express';
import userAuth from '../middleware/auth.js';

const messageApiRouter = express.Router();

messageApiRouter.get('/debug/run-sync',userAuth, async (req, res) => {
  try {
    await runGmailSyncForUser(req.user.id);
    res.json({ message: 'Sync completed successfully' });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

messageApiRouter.get('/:accountId', async (req, res) => {
  const { emailAccountId } = req.params;
  console.log(emailAccountId);
});

export default messageApiRouter;
