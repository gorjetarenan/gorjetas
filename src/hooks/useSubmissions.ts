import { useState, useEffect, useCallback } from 'react';
import { Submission, RaffleWin, PageConfig } from '@/types/config';

const SUBMISSIONS_KEY = 'gorjetas-submissions';
const WINS_KEY = 'gorjetas-wins';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const stored = localStorage.getItem(SUBMISSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [wins, setWins] = useState<RaffleWin[]>(() => {
    try {
      const stored = localStorage.getItem(WINS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(WINS_KEY, JSON.stringify(wins));
  }, [wins]);

  const addSubmission = useCallback((data: Record<string, string>) => {
    const submission: Submission = {
      id: generateId(),
      data,
      createdAt: new Date().toISOString(),
    };
    setSubmissions(prev => [...prev, submission]);
    return submission;
  }, []);

  const clearSubmissions = useCallback(() => {
    setSubmissions([]);
    setWins([]);
  }, []);

  const getWinsForSubmission = useCallback((submissionId: string, period: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    let startDate: Date;

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return wins.filter(w =>
      w.submissionId === submissionId &&
      new Date(w.date) >= startDate
    ).length;
  }, [wins]);

  const canWin = useCallback((submissionId: string, config: PageConfig) => {
    const daily = getWinsForSubmission(submissionId, 'daily');
    const weekly = getWinsForSubmission(submissionId, 'weekly');
    const monthly = getWinsForSubmission(submissionId, 'monthly');
    return daily < config.maxDailyWins && weekly < config.maxWeeklyWins && monthly < config.maxMonthlyWins;
  }, [getWinsForSubmission]);

  const addWin = useCallback((submissionId: string, submissionData: Record<string, string>) => {
    const win: RaffleWin = {
      id: generateId(),
      submissionId,
      submissionData,
      date: new Date().toISOString(),
    };
    setWins(prev => [...prev, win]);
    return win;
  }, []);

  const getWinsByDate = useCallback((date: string) => {
    const target = new Date(date);
    return wins.filter(w => {
      const winDate = new Date(w.date);
      return winDate.getFullYear() === target.getFullYear() &&
        winDate.getMonth() === target.getMonth() &&
        winDate.getDate() === target.getDate();
    });
  }, [wins]);

  const drawRandom = useCallback((count: number, config: PageConfig) => {
    const eligible = submissions.filter(s => canWin(s.id, config));
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, Math.min(count, shuffled.length));
    const newWins = winners.map(w => addWin(w.id, w.data));
    return { winners, wins: newWins };
  }, [submissions, canWin, addWin]);

  const drawSelected = useCallback((submissionIds: string[], config: PageConfig) => {
    const results = submissionIds
      .filter(id => canWin(id, config))
      .map(id => {
        const sub = submissions.find(s => s.id === id);
        if (sub) return addWin(sub.id, sub.data);
        return null;
      })
      .filter(Boolean) as RaffleWin[];
    return results;
  }, [submissions, canWin, addWin]);

  return {
    submissions,
    wins,
    addSubmission,
    clearSubmissions,
    canWin,
    drawRandom,
    drawSelected,
    getWinsByDate,
    getWinsForSubmission,
  };
}
