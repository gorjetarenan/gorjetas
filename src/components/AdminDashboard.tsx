import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trophy, TrendingUp, Calendar, DollarSign, BarChart3, UserCheck, UserX } from 'lucide-react';
import { RaffleWin, Submission } from '@/types/config';

interface Props {
  submissions: Submission[];
  wins: RaffleWin[];
}

type Period = 'day' | 'week' | 'month';

const periodLabels: Record<Period, string> = {
  day: 'Hoje',
  week: 'Semana',
  month: 'Mês',
};

const AdminDashboard = ({ submissions, wins }: Props) => {
  const [period, setPeriod] = useState<Period>('week');

  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    if (period === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredWins = wins.filter(w => new Date(w.date) >= startDate);

    // Unique winners by accountId
    const uniqueWinners = new Set(filteredWins.map(w => w.submissionData?.accountId).filter(Boolean));

    // All-time unique participants (from wins - persists even after clearing submissions)
    const allTimeParticipants = new Set(wins.map(w => w.submissionData?.accountId).filter(Boolean));

    // Top winners
    const winnerCounts: Record<string, { name: string; count: number }> = {};
    filteredWins.forEach(w => {
      const id = w.submissionData?.accountId || 'unknown';
      const name = w.submissionData?.fullName || id;
      if (!winnerCounts[id]) winnerCounts[id] = { name, count: 0 };
      winnerCounts[id].count++;
    });
    const topWinners = Object.entries(winnerCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5);

    // Wins per day for chart-like display
    const winsPerDay: Record<string, number> = {};
    filteredWins.forEach(w => {
      const d = new Date(w.date).toLocaleDateString('pt-BR');
      winsPerDay[d] = (winsPerDay[d] || 0) + 1;
    });

    // Submission frequency by accountId (from current submissions)
    const accountCounts: Record<string, number> = {};
    submissions.forEach(s => {
      const accId = s.data?.accountId || s.id;
      accountCounts[accId] = (accountCounts[accId] || 0) + 1;
    });
    const singleSubmission = Object.values(accountCounts).filter(c => c === 1).length;
    const multipleSubmissions = Object.values(accountCounts).filter(c => c > 1).length;

    return {
      currentSubmissions: submissions.length,
      totalWins: filteredWins.length,
      uniqueWinners: uniqueWinners.size,
      avgWinsPerDay: filteredWins.length > 0
        ? (filteredWins.length / Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)
        : '0',
      topWinners,
      winsPerDay: Object.entries(winsPerDay).slice(-7),
      allTimeParticipants: allTimeParticipants.size,
      allTimeWins: wins.length,
      singleSubmission,
      multipleSubmissions,
    };
  }, [submissions, wins, period]);

  return (
    <div className="space-y-4">
      {/* Period Filter */}
      <div className="flex gap-2">
        {(['day', 'week', 'month'] as Period[]).map(p => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
            className={`text-xs ${period === p
              ? 'bg-[hsl(45,80%,50%)] text-[hsl(30,50%,10%)] hover:bg-[hsl(45,80%,45%)]'
              : 'border-[hsl(220,15%,25%)] bg-[hsl(220,18%,14%)] text-[hsl(220,10%,60%)] hover:bg-[hsl(220,15%,20%)] hover:text-white'
            }`}
          >
            {periodLabels[p]}
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[hsl(210,70%,20%)] p-2.5">
                <Users className="h-5 w-5 text-[hsl(210,70%,60%)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.currentSubmissions}</p>
                <p className="text-xs text-[hsl(220,10%,50%)]">Cadastros atuais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[hsl(45,60%,20%)] p-2.5">
                <Trophy className="h-5 w-5 text-[hsl(45,80%,55%)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalWins}</p>
                <p className="text-xs text-[hsl(220,10%,50%)]">Sorteados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[hsl(140,50%,18%)] p-2.5">
                <DollarSign className="h-5 w-5 text-[hsl(140,60%,55%)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.uniqueWinners}</p>
                <p className="text-xs text-[hsl(220,10%,50%)]">Ganhadores únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[hsl(280,50%,20%)] p-2.5">
                <TrendingUp className="h-5 w-5 text-[hsl(280,60%,65%)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.avgWinsPerDay}</p>
                <p className="text-xs text-[hsl(220,10%,50%)]">Média/dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submission frequency */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[hsl(170,50%,18%)] p-2.5">
                <UserCheck className="h-5 w-5 text-[hsl(170,60%,55%)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.singleSubmission}</p>
                <p className="text-xs text-[hsl(220,10%,50%)]">Cadastro único</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[hsl(0,50%,20%)] p-2.5">
                <UserX className="h-5 w-5 text-[hsl(0,60%,60%)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.multipleSubmissions}</p>
                <p className="text-xs text-[hsl(220,10%,50%)]">Cadastros duplicados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All-time stats */}
      <Card className="bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)]">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-[hsl(220,10%,60%)] flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Totais gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex justify-between">
            <div>
              <p className="text-lg font-bold text-white">{stats.allTimeParticipants}</p>
              <p className="text-xs text-[hsl(220,10%,45%)]">Participantes únicos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{stats.allTimeWins}</p>
              <p className="text-xs text-[hsl(220,10%,45%)]">Total sorteios</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {stats.allTimeParticipants > 0 ? ((stats.allTimeWins / stats.allTimeParticipants) * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-xs text-[hsl(220,10%,45%)]">Taxa de sorteio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Winners */}
      {stats.topWinners.length > 0 && (
        <Card className="bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)]">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-[hsl(220,10%,60%)] flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[hsl(45,80%,55%)]" /> Top ganhadores
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {stats.topWinners.map(([id, { name, count }], i) => (
                <div key={id} className="flex items-center justify-between rounded-lg bg-[hsl(220,18%,14%)] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[hsl(45,80%,55%)] w-5">{i + 1}º</span>
                    <span className="text-sm text-white truncate max-w-[180px]">{name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[hsl(140,60%,55%)]">{count}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wins per day */}
      {stats.winsPerDay.length > 0 && (
        <Card className="bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)]">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-[hsl(220,10%,60%)] flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Sorteios por dia
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1.5">
              {stats.winsPerDay.map(([date, count]) => {
                const maxCount = Math.max(...stats.winsPerDay.map(([, c]) => c));
                const pct = (count / maxCount) * 100;
                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="text-xs text-[hsl(220,10%,50%)] w-16 shrink-0">{date}</span>
                    <div className="flex-1 h-5 rounded bg-[hsl(220,15%,18%)] overflow-hidden">
                      <div
                        className="h-full rounded bg-gradient-to-r from-[hsl(45,80%,45%)] to-[hsl(45,90%,55%)] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-white w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
