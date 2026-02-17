import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Submission, RaffleWin, PageConfig } from '@/types/config';
import { toast } from 'sonner';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [wins, setWins] = useState<RaffleWin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) {
      setSubmissions(data.map(row => ({
        id: row.id,
        data: (row.data as Record<string, string>) || {},
        createdAt: row.created_at,
      })));
    }
  }, []);

  const fetchWins = useCallback(async () => {
    const { data, error } = await supabase
      .from('raffle_wins')
      .select('*')
      .order('date', { ascending: true });
    if (!error && data) {
      setWins(data.map(row => ({
        id: row.id,
        submissionId: row.submission_id,
        submissionData: (row.submission_data as Record<string, string>) || {},
        date: row.date,
        tipValue: (row as any).tip_value || null,
      })));
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchSubmissions(), fetchWins()]).finally(() => setLoading(false));

    const channel = supabase
      .channel('submissions-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        (payload) => {
          const row = payload.new as { id: string; data: Record<string, string>; created_at: string };
          setSubmissions(prev => {
            if (prev.some(s => s.id === row.id)) return prev;
            return [...prev, { id: row.id, data: row.data || {}, createdAt: row.created_at }];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'submissions' },
        (payload) => {
          const old = payload.old as { id: string };
          setSubmissions(prev => prev.filter(s => s.id !== old.id));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'submissions' },
        (payload) => {
          const row = payload.new as { id: string; data: Record<string, string>; created_at: string };
          setSubmissions(prev => prev.map(s => s.id === row.id ? { ...s, data: row.data || {} } : s));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSubmissions, fetchWins]);

  const addSubmission = useCallback(async (data: Record<string, string>) => {
    // Check for duplicate accountId
    if (data.accountId) {
      const existing = submissions.find(s => s.data.accountId === data.accountId);
      if (existing) {
        throw new Error('ID_ALREADY_EXISTS');
      }
    }

    const { error } = await supabase
      .from('submissions')
      .insert({ data });
    if (error) throw error;
    // The realtime subscription will add the new submission to state
    const submission: Submission = {
      id: crypto.randomUUID(),
      data,
      createdAt: new Date().toISOString(),
    };
    return submission;
  }, [submissions]);

  const clearSubmissions = useCallback(async () => {
    // Only delete submissions, keep raffle_wins for 30-day tracking
    await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setSubmissions([]);
  }, []);

  const getWinsForAccount = useCallback((accountId: string, period: 'daily' | 'weekly' | 'monthly') => {
    if (!accountId) return 0;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let startDate: Date;
    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    // Use the more recent of startDate and thirtyDaysAgo boundary
    return wins.filter(w => {
      const winDate = new Date(w.date);
      const matchesAccount = w.submissionData?.accountId === accountId;
      const withinPeriod = winDate >= startDate;
      const within30Days = winDate >= thirtyDaysAgo;
      return matchesAccount && withinPeriod && within30Days;
    }).length;
  }, [wins]);

  const canWin = useCallback((submissionData: Record<string, string>, config: PageConfig) => {
    const accountId = submissionData?.accountId || '';
    if (!accountId) return true; // No accountId, no tracking
    const daily = getWinsForAccount(accountId, 'daily');
    const weekly = getWinsForAccount(accountId, 'weekly');
    const monthly = getWinsForAccount(accountId, 'monthly');
    return daily < config.maxDailyWins && weekly < config.maxWeeklyWins && monthly < config.maxMonthlyWins;
  }, [getWinsForAccount]);

  const addWin = useCallback(async (submissionId: string, submissionData: Record<string, string>) => {
    const { data: row, error } = await supabase
      .from('raffle_wins')
      .insert({ submission_id: submissionId, submission_data: submissionData })
      .select()
      .single();
    if (error) throw error;
    const win: RaffleWin = {
      id: row.id,
      submissionId: row.submission_id,
      submissionData: (row.submission_data as Record<string, string>) || {},
      date: row.date,
      tipValue: (row as any).tip_value || null,
    };
    setWins(prev => [...prev, win]);
    return win;
  }, []);

  const sendWinnerEmail = useCallback(async (winnerData: Record<string, string>, config: PageConfig, tipValue?: string) => {
    if (!config.emailNotificationEnabled) return;
    const email = winnerData.email;
    if (!email) return;

    const replaceVars = (text: string) => {
      return text
        .replace(/\{\{fullName\}\}/g, winnerData.fullName || '')
        .replace(/\{\{email\}\}/g, winnerData.email || '')
        .replace(/\{\{accountId\}\}/g, winnerData.accountId || '')
        .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('pt-BR'))
        .replace(/\{\{tipValue\}\}/g, tipValue || '');
    };

    try {
      const { data, error } = await supabase.functions.invoke('send-winner-email', {
        body: {
          to: email,
          subject: replaceVars(config.emailSubject),
          body: replaceVars(config.emailBody),
          fromName: config.emailFromName,
        },
      });
      if (error) throw error;
      toast.success(`Email enviado para ${email}`);
    } catch (err) {
      console.error('Error sending winner email:', err);
      toast.error(`Falha ao enviar email para ${email}`);
    }
  }, []);

  const getWinsByDate = useCallback((date: string) => {
    return wins.filter(w => {
      const winDate = new Date(w.date);
      const winDateStr = `${winDate.getUTCFullYear()}-${String(winDate.getUTCMonth() + 1).padStart(2, '0')}-${String(winDate.getUTCDate()).padStart(2, '0')}`;
      return winDateStr === date;
    });
  }, [wins]);

  const drawRandom = useCallback(async (count: number, config: PageConfig) => {
    let eligible = submissions.filter(s => canWin(s.data, config));

    // Filter by validated players if enabled
    if (config.postbackValidationEnabled) {
      const { data: validatedPlayers } = await supabase
        .from('validated_players')
        .select('player_id');
      const validIds = new Set((validatedPlayers || []).map(p => p.player_id));
      eligible = eligible.filter(s => validIds.has(s.data.accountId || ''));
    }

    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, Math.min(count, shuffled.length));
    const newWins: RaffleWin[] = [];
    for (const w of winners) {
      const win = await addWin(w.id, w.data);
      newWins.push(win);
      sendWinnerEmail(w.data, config);
    }
    return { winners, wins: newWins };
  }, [submissions, canWin, addWin, sendWinnerEmail]);

  const drawSelected = useCallback(async (submissionIds: string[], config: PageConfig) => {
    let validIds: Set<string> | null = null;
    if (config.postbackValidationEnabled) {
      const { data: validatedPlayers } = await supabase
        .from('validated_players')
        .select('player_id');
      validIds = new Set((validatedPlayers || []).map(p => p.player_id));
    }

    const results: RaffleWin[] = [];
    for (const id of submissionIds) {
      const sub = submissions.find(s => s.id === id);
      if (!sub || !canWin(sub.data, config)) continue;
      if (validIds && !validIds.has(sub.data.accountId || '')) continue;
      const win = await addWin(sub.id, sub.data);
      results.push(win);
      sendWinnerEmail(sub.data, config);
    }
    return results;
  }, [submissions, canWin, addWin, sendWinnerEmail]);

  const updateSubmission = useCallback(async (id: string, data: Record<string, string>) => {
    await supabase.from('submissions').update({ data }).eq('id', id);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, data } : s));
  }, []);

  const removeSubmission = useCallback(async (id: string) => {
    await supabase.from('submissions').delete().eq('id', id);
    setSubmissions(prev => prev.filter(s => s.id !== id));
    setWins(prev => prev.filter(w => w.submissionId !== id));
  }, []);

  return {
    submissions,
    wins,
    loading,
    addSubmission,
    clearSubmissions,
    updateSubmission,
    removeSubmission,
    canWin,
    drawRandom,
    drawSelected,
    getWinsByDate,
    getWinsForAccount,
  };
}
