import { getAuthorizedClientForAccount } from '../config/googleClient.js';
import EmailAccount from '../models/EmailAccount.js';
import { google } from 'googleapis';

export async function runGmailSyncForUser(userId) {
  const accounts = await EmailAccount.find({ userId });

  for (const account of accounts) {
    await syncAccount(account);
  }
}


async function syncAccount(account) {
    try {
      const authClient = await getAuthorizedClientForAccount(account.email, account.userId);
      const gmail = google.gmail({ version: 'v1', auth: authClient });
  
      const list = await gmail.users.messages.list({ userId: 'me', maxResults: 50 });
      const msgs = list.data.messages || [];
  
      for (const m of msgs) {
        await syncSingleMessage(gmail, m.id, account);
      }
    } catch (err) {
      console.error('Sync error for account:', account.email, err);
    }
  }