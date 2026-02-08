import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import EmailAccount from '../models/EmailAccount.js';
import User from '../models/User.js';
import userAuth from '../middleware/auth.js';

dotenv.config();
const googleAuthRouter = express.Router();

// Step 1 - Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// step 2 - Define Scopes
const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
];

googleAuthRouter.get('/google',userAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (!userId) {
      return res.send('userId not found!!');
    }
    const state = JSON.stringify({ userId, timestamp: Date.now() });

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
      state,
    });

    res.redirect(authUrl);
  } catch (err) {
    console.error('❌ Error starting OAuth:', err);
    res.status(500).send('Failed to start OAuth');
  }
});

googleAuthRouter.get('/google/callback', async (req, res) => {
  try {
    // get state and code from redirect url
    const { state, code } = req.query;

    if (!code) return res.status(400).send('Missing OAuth code');

    // Parse user info from state
    let stateData = {};
    try {
      stateData = JSON.parse(state);
    } catch {
      console.warn('⚠️ Invalid state data');
    }

    const userIdFromState = stateData.userId || null;

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const profile = await oauth2.userinfo.get();
    const gmailAddress = profile.data.email;

    let appUser = await User.findById(userIdFromState);
    if (!appUser) {
      appUser = await User.create({
        name: gmailAddress.split('@')[0],
      });
    }

    const accountData = {
      userId: appUser._id,
      provider: 'gmail',
      email: gmailAddress,
      accessToken: tokens.access_token,
      ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      scopes: SCOPES,
    };

    const existing = await EmailAccount.findOne({
      userId: appUser._id,
      email: gmailAddress,
    });
    let account;

    if (existing) {
      account = await EmailAccount.findOneAndUpdate({ _id: existing._id }, accountData, {
        new: true,
      });
    } else {
      account = await EmailAccount.create(accountData);
    }

    console.log(`✅ Gmail connected: ${gmailAddress} → User: ${appUser.email}`);

    res.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { type: 'GMAIL_CONNECTED' },
                'http://localhost:3000'
              );
              window.close();
            } else {
              window.location.href = 'http://localhost:3000/dashboard';
            }
          </script>
        </body>
      </html>
      `);
  } catch (err) {
    console.error('❌ Error in OAuth callback:', err);
    res.status(500).send('OAuth callback failed');
  }
});

export default googleAuthRouter;
