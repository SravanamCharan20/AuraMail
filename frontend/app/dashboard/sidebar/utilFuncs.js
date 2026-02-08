// app/dashboard/sidebar/utilFuncs.js
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const connectGmail = () => {
  const popup = window.open(
    `${BASE_URL}/googleAuth/google`,
    'gmail-oauth',
    'width=500,height=600'
  );

  if (!popup) {
    alert('Please allow popups to connect Gmail');
  }
};

export const fetchMe = async () => {
  const res = await fetch(`${BASE_URL}/cookie/me`, {
    credentials: 'include',
  });

  if (!res.ok) return null;
  return res.json();
};

export const fetchAccounts = async () => {
  const res = await fetch(`${BASE_URL}/api/connected-accounts`, {
    credentials: 'include',
  });

  if (!res.ok) return [];
  return res.json();
};

export const disconnectEmailAccount = async (accountId) => {
  const res = await fetch(`${BASE_URL}/api/email/disconnect`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accountId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to disconnect');
  }

  return true;
};