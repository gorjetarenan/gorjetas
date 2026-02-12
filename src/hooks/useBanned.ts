import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BannedEntry } from '@/components/AdminBanned';

export function useBanned() {
  const [banned, setBanned] = useState<BannedEntry[]>([]);

  const fetchBanned = useCallback(async () => {
    const { data, error } = await supabase
      .from('banned_entries')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) {
      setBanned(data.map(row => ({
        id: row.id,
        type: row.type as 'email' | 'accountId',
        value: row.value,
        reason: row.reason,
        createdAt: row.created_at,
      })));
    }
  }, []);

  useEffect(() => {
    fetchBanned();
  }, [fetchBanned]);

  const addBan = useCallback(async (entry: Omit<BannedEntry, 'id' | 'createdAt'>) => {
    const existing = banned.find(b => b.type === entry.type && b.value === entry.value);
    if (existing) return;

    const { data, error } = await supabase
      .from('banned_entries')
      .insert({ type: entry.type, value: entry.value, reason: entry.reason || '' })
      .select()
      .single();

    if (!error && data) {
      setBanned(prev => [...prev, {
        id: data.id,
        type: data.type as 'email' | 'accountId',
        value: data.value,
        reason: data.reason,
        createdAt: data.created_at,
      }]);
    }
  }, [banned]);

  const removeBan = useCallback(async (id: string) => {
    await supabase.from('banned_entries').delete().eq('id', id);
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
