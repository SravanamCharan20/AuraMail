'use client';
import React, { useEffect, useState } from 'react';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  // OAuth popup message listener
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'http://localhost:7777') return;

      if (event.data?.type === 'GMAIL_CONNECTED') {
        setLoading(true);
        init();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const init = async () => {
    try {
      const meRes = await fetch('http://localhost:7777/cookie/me', {
        credentials: 'include',
      });

      if (!meRes.ok) {
        setUser(null);
        return;
      }

      const meData = await meRes.json();
      setUser(meData.user);

      const accRes = await fetch(
        'http://localhost:7777/api/connected-accounts',
        { credentials: 'include' }
      );

      const accData = await accRes.json();
      setAccounts(accData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const connectGmail = () => {
    const popup = window.open(
      'http://localhost:7777/googleAuth/google',
      'gmail-oauth',
      'width=500,height=600'
    );

    if (!popup) {
      alert('Please allow popups to connect Gmail');
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <aside className="w-72 h-screen bg-[#020617] p-6 text-gray-400 flex items-center justify-center">
        Loading…
      </aside>
    );
  }

  /* ---------------- NOT LOGGED IN ---------------- */
  if (!user) {
    return (
      <aside className="w-72 h-screen bg-[#020617] p-6 text-gray-400 flex items-center justify-center">
        Please login
      </aside>
    );
  }

  return (
    <aside className="w-72 h-screen flex flex-col bg-gradient-to-b from-[#0b1220] to-[#020617] border-r border-white/10">
      
      {/* ---------- HEADER ---------- */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          AuraMail
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Smart inbox
        </p>
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        
        {/* Connect Button */}
        <button
          onClick={connectGmail}
          className="
            w-full mb-6 py-2.5 rounded-lg
            bg-blue-600 hover:bg-blue-500
            text-white text-sm font-medium
            transition
            shadow-md shadow-blue-600/30
            active:scale-[0.98]
          "
        >
          + Connect Gmail
        </button>

        {/* Connected Accounts */}
        <h2 className="text-xs uppercase text-gray-400 mb-3 tracking-wider">
          Connected Accounts
        </h2>

        {accounts.length === 0 ? (
          <div className="text-sm text-gray-500 text-center mt-8">
            No Gmail accounts connected
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                className="
                  flex items-center gap-3 p-3 rounded-xl
                  bg-white/5 hover:bg-white/10
                  border border-white/10
                  transition
                  cursor-pointer
                "
              >
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm">
                  G
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {acc.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    Gmail connected
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- FOOTER ---------- */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-gray-500">
          Logged in as
        </p>
        <p className="text-sm text-gray-300 font-medium truncate">
          {user.name}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;