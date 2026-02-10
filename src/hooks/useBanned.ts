import { useState, useEffect, useCallback } from 'react';
import { BannedEntry } from '@/components/AdminBanned';

const BANNED_KEY = 'gorjetas-banned';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function useBanned() {
  const [banned, setBanned] = useState<BannedEntry[]>(() => {
    try {
      const stored = localStorage.getItem(BANNED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(BANNED_KEY, JSON.stringify(banned));
  }, [banned]);

  const addBan = useCallback((entry: Omit<BannedEntry, 'id' | 'createdAt'>) => {
    const existing = banned.find(b => b.type === entry.type && b.value === entry.value);
    if (existing) return;
    setBanned(prev => [...prev, {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }]);
  }, [banned]);

  const removeBan = useCallback((id: string) => {
    setBanned(prev => prev.filter(b => b.id !== id));
  }, []);

  const isBanned = useCallback((data: Record<string, string>) => {
    const email = (data.email || '').toLowerCase();
    const accountId = (data.accountId || '').toLowerCase();

    return banned.some(b => {
      if (b.type === 'email' && email && b.value === email) return true;
      if (b.type === 'accountId' && accountId && b.value === accountId) return true;
      return false;
    });
  }, [banned]);

  return { banned, addBan, removeBan, isBanned };
}
