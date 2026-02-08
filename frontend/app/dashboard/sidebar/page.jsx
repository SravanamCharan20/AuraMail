'use client';
import React, { useEffect, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';

import { connectGmail, fetchMe, fetchAccounts, disconnectEmailAccount } from './utilFuncs';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== BASE_URL) return;

      if (event.data?.type === 'GMAIL_CONNECTED') {
        setLoading(true);
        init();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [BASE_URL]);

  const init = async () => {
    try {
      const meData = await fetchMe();
      if (!meData) {
        setUser(null);
        return;
      }

      setUser(meData.user);
      const accountsData = await fetchAccounts();
      setAccounts(accountsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedAccount) return;

    try {
      await disconnectEmailAccount(selectedAccount._id);
      setShowConfirm(false);
      setSelectedAccount(null);
      init();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to disconnect account');
    }
  };

  if (loading) {
    return (
      <aside className="w-72 h-screen bg-[#020617] p-6 text-gray-400 flex items-center justify-center">
        Loading…
      </aside>
    );
  }
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
        <h1 className="text-xl font-semibold text-white tracking-tight">AuraMail</h1>
        <p className="text-xs text-gray-400 mt-1">Smart inbox</p>
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="flex-1 px-6 py-5 overflow-y-auto">
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

        <h2 className="text-xs uppercase text-gray-400 mb-3 tracking-wider">Connected Accounts</h2>

        {accounts.length === 0 ? (
          <div className="text-sm text-gray-500 text-center mt-8">No Gmail accounts connected</div>
        ) : (
          <div className="space-y-2">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                className="
                  group flex items-center gap-3 p-3 rounded-xl
                  bg-white/5 hover:bg-white/10
                  border border-white/10
                  transition
                "
              >
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  G
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{acc.email}</p>
                  <p className="text-xs text-gray-400">Gmail connected</p>
                </div>

                {/* Disconnect */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAccount(acc);
                    setShowConfirm(true);
                  }}
                  className="
                    opacity-0 group-hover:opacity-100
                    p-2 rounded-md
                    hover:bg-red-500/10
                    transition cursor-pointer
                  "
                  title="Disconnect Gmail"
                >
                  <TrashIcon className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- FOOTER ---------- */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-gray-500">Logged in as</p>
        <p className="text-sm text-gray-300 font-medium truncate">{user.name}</p>
      </div>

      {/* ---------- CONFIRM MODAL ---------- */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[360px] rounded-xl bg-[#020617] border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white">Disconnect Gmail?</h3>

            <p className="text-sm text-gray-400 mt-2">
              This will remove access to
              <span className="text-gray-200 font-medium"> {selectedAccount?.email}</span>. You can
              reconnect anytime.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedAccount(null);
                }}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleDisconnect}
                className="
                  px-4 py-2 text-sm font-medium
                  bg-red-600 hover:bg-red-500
                  text-white rounded-lg
                  transition cursor-pointer
                "
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
