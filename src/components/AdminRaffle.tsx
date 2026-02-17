import { useState, useEffect, useRef, useCallback } from 'react';
import { PageConfig, Submission, RaffleWin } from '@/types/config';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Users, Trophy, Trash2, Pencil, X, Check, Search, DollarSign, Crown, ShieldCheck } from 'lucide-react';

interface SubmissionsHook {
  submissions: Submission[];
  wins: RaffleWin[];
  clearSubmissions: () => void | Promise<void>;
  updateSubmission: (id: string, data: Record<string, string>) => void | Promise<void>;
  removeSubmission: (id: string) => void | Promise<void>;
  updateWinTipValue: (winId: string, tipValue: string) => Promise<void>;
  drawRandom: (count: number, config: PageConfig) => Promise<{ winners: Submission[]; wins: RaffleWin[] }>;
  drawSelected: (ids: string[], config: PageConfig) => Promise<RaffleWin[]>;
  canWin: (submissionData: Record<string, string>, config: PageConfig) => boolean;
  getWinsForAccount: (accountId: string, period: 'daily' | 'weekly' | 'monthly') => number;
}

interface Props {
  config: PageConfig;
  submissions: SubmissionsHook;
}

const CASINO_EMOJIS = ['🎰', '💰', '🃏', '🎲', '💎', '7️⃣', '🍒', '⭐', '🔔', '👑'];

const AdminRaffle = ({ config, submissions: sub }: Props) => {
  const [randomCount, setRandomCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastResults, setLastResults] = useState<RaffleWin[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningNames, setSpinningNames] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [tipSelections, setTipSelections] = useState<Record<string, string>>({});
  const [awaitingTipSelection, setAwaitingTipSelection] = useState(false);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const startCasinoAnimation = (pendingWins: RaffleWin[]) => {
    if (pendingWins.length === 0) return;
    setIsSpinning(true);
    setShowResults(false);
    setLastResults(pendingWins);
    setDialogOpen(true);

    let tick = 0;
    const totalTicks = 30;
    const allNames = sub.submissions.map(s => Object.values(s.data).join(' — '));

    spinIntervalRef.current = setInterval(() => {
      tick++;
      const randomNames = Array.from({ length: Math.min(pendingWins.length, 5) }, () =>
        allNames[Math.floor(Math.random() * allNames.length)]
      );
      setSpinningNames(randomNames);
      if (tick >= totalTicks) {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
        setIsSpinning(false);
        setShowResults(true);
        setSpinningNames([]);
      }
    }, 80 + tick * 3);
  };

  const handleRandomDraw = async () => {
    if (sub.submissions.length === 0) {
      toast.error('Nenhum cadastro disponível para sorteio');
      return;
    }
    const result = await sub.drawRandom(randomCount, config);
    if (result.winners.length === 0) {
      toast.error('Nenhum participante elegível encontrado');
    } else {
      startCasinoAnimation(result.wins);
    }
  };

  const handleManualDraw = async () => {
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos um participante');
      return;
    }
    const results = await sub.drawSelected(selectedIds, config);
    setSelectedIds([]);
    if (results.length === 0) {
      toast.error('Nenhum participante selecionado é elegível');
    } else {
      startCasinoAnimation(results);
    }
  };

  const handleClearSubmissions = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    sub.clearSubmissions();
    setLastResults([]);
    setConfirmClear(false);
    toast.success('Todos os cadastros foram zerados!');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const enabledFields = config.fields.filter(f => f.enabled);

  const sortedSubmissions = [...sub.submissions].reverse();

  const filteredSubmissions = searchQuery.trim()
    ? sortedSubmissions.filter(s => {
        const q = searchQuery.toLowerCase();
        return s.id.toLowerCase().includes(q) || Object.values(s.data).some(v => String(v).toLowerCase().includes(q));
      })
    : sortedSubmissions;

  const todayWins = sub.wins.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  // Daily quota derived from weekly budget / 7
  const dailyQuota = config.tipValuesEnabled && config.defaultTipValue > 0 && config.weeklyTipBudget > 0
    ? Math.floor(Math.floor((config.weeklyTipBudget || 0) / config.defaultTipValue) / 7)
    : 0;
  const showDailyQuota = dailyQuota > 0;

  // Weekly tip budget tracking
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weeklyWins = sub.wins.filter(w => new Date(w.date) >= startOfWeek);
  const weeklyTipsUsed = weeklyWins.length;
  const maxWeeklyTips = config.tipValuesEnabled && config.defaultTipValue > 0
    ? Math.floor((config.weeklyTipBudget || 0) / config.defaultTipValue)
    : 0;
  const showWeeklyBudget = config.tipValuesEnabled && config.defaultTipValue > 0 && config.weeklyTipBudget > 0;

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <div className="rounded-2xl bg-[hsl(220,20%,12%,0.85)] backdrop-blur-sm border border-[hsl(220,15%,20%)] overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Lista de inscritos</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(220,15%,18%)] border border-[hsl(220,15%,25%)] px-3 py-1 text-sm font-semibold text-white">
                <Users className="h-3.5 w-3.5" />
                {sub.submissions.length}
              </span>
              {confirmClear ? (
                <div className="flex gap-1.5">
                  <Button variant="destructive" size="sm" onClick={handleClearSubmissions} className="text-xs h-7 px-2">
                    Confirmar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmClear(false)} className="text-xs h-7 px-2 border-[hsl(220,15%,25%)] bg-transparent text-white hover:bg-[hsl(220,15%,20%)]">
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSubmissions}
                  disabled={sub.submissions.length === 0}
                  className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Zerar
                </Button>
              )}
            </div>
          </div>

          {/* Weekly budget indicator */}
          {showWeeklyBudget && (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-sm text-[hsl(45,80%,55%)]">
                  <DollarSign className="h-3.5 w-3.5" />
                  Gorjetas da semana
                </span>
                <span className="inline-flex items-center rounded-full bg-[hsl(45,80%,20%)] border border-[hsl(45,70%,30%)] px-2.5 py-0.5 text-xs font-bold text-[hsl(45,80%,55%)]">
                  {weeklyTipsUsed}/{maxWeeklyTips}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[hsl(220,15%,18%)] mb-3">
                <div
                  className={`h-full rounded-full transition-all ${weeklyTipsUsed >= maxWeeklyTips ? 'bg-[hsl(0,60%,50%)]' : 'bg-[hsl(45,80%,50%)]'}`}
                  style={{ width: `${Math.min(100, (weeklyTipsUsed / (maxWeeklyTips || 1)) * 100)}%` }}
                />
              </div>
            </>
          )}

          {/* Daily stats row */}
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-sm text-[hsl(140,60%,55%)]">
              <DollarSign className="h-3.5 w-3.5" />
              Gorjetas enviadas hoje
            </span>
            <span className="inline-flex items-center rounded-full bg-[hsl(140,60%,20%)] border border-[hsl(140,50%,30%)] px-2.5 py-0.5 text-xs font-bold text-[hsl(140,60%,55%)]">
              {todayWins}/{showDailyQuota ? dailyQuota : (config.maxDailyWins || '∞')}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[hsl(220,15%,18%)] mb-4">
            <div
              className="h-full rounded-full bg-[hsl(140,60%,45%)] transition-all"
              style={{ width: `${Math.min(100, (todayWins / (showDailyQuota ? dailyQuota : (config.maxDailyWins || 100))) * 100)}%` }}
            />
          </div>


          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(220,10%,45%)]" />
            <Input
              placeholder="Buscar por nome ou credencial..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-[hsl(220,15%,16%)] border-[hsl(220,15%,22%)] text-white placeholder:text-[hsl(220,10%,40%)] focus-visible:ring-[hsl(45,80%,50%)] rounded-xl h-11"
            />
          </div>
        </div>

        {/* Participants Grid */}
        <div className="px-5 pb-3 max-h-[280px] overflow-y-auto scrollbar-thin">
          {sub.submissions.length === 0 ? (
            <p className="text-center text-sm text-[hsl(220,10%,45%)] py-10">Nenhum cadastro registrado ainda.</p>
          ) : filteredSubmissions.length === 0 ? (
            <p className="text-center text-sm text-[hsl(220,10%,45%)] py-10">Nenhum resultado encontrado.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredSubmissions.map(s => {
                const firstField = enabledFields[0];
                const accountField = enabledFields.find(f => f.id === 'accountId') || enabledFields[1];
                const name = firstField ? (s.data[firstField.id] || '—') : '—';
                const secondary = accountField ? (s.data[accountField.id] || '—') : '—';
                const isSelected = selectedIds.includes(s.id);
                const eligible = sub.canWin(s.data, config);

                return (
                  <div
                    key={s.id}
                    onClick={() => {}}
                    className={`
                      relative flex items-center gap-2 rounded-xl border p-3 transition-all
                      ${isSelected
                        ? 'border-[hsl(45,80%,50%)] bg-[hsl(45,80%,50%,0.08)]'
                        : 'border-[hsl(220,15%,20%)] bg-[hsl(220,18%,14%)] hover:border-[hsl(220,15%,28%)]'}
                    `}
                  >
                    {/* Edit / Delete overlay */}
                    {editingId === s.id ? (
                      <div className="flex-1 space-y-1">
                        {enabledFields.map(field => (
                          <Input
                            key={field.id}
                            value={editData[field.id] || ''}
                            onChange={e => setEditData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="h-7 text-xs bg-[hsl(220,15%,18%)] border-[hsl(220,15%,25%)] text-white"
                            placeholder={field.label}
                          />
                        ))}
                        <div className="flex gap-1 pt-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { sub.updateSubmission(s.id, editData); setEditingId(null); toast.success('Atualizado'); }}>
                            <Check className="h-3 w-3 text-[hsl(140,60%,55%)]" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingId(null)}>
                            <X className="h-3 w-3 text-[hsl(220,10%,60%)]" />
                          </Button>
                        </div>
                      </div>
                    ) : confirmDeleteId === s.id ? (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-xs text-destructive">Excluir?</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { sub.removeSubmission(s.id); setConfirmDeleteId(null); toast.success('Removido'); }}>
                            <Check className="h-3 w-3 text-destructive" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setConfirmDeleteId(null)}>
                            <X className="h-3 w-3 text-[hsl(220,10%,60%)]" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{name}</p>
                          <p className="text-xs text-[hsl(220,10%,50%)] truncate">{secondary}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); if (eligible) toggleSelect(s.id); }}
                            disabled={!eligible}
                            className={`p-1 rounded transition-colors ${isSelected ? 'text-[hsl(140,60%,55%)]' : 'text-[hsl(140,50%,40%)] hover:text-[hsl(140,60%,55%)]'} ${!eligible ? 'opacity-40 cursor-not-allowed' : ''}`}
                            title={eligible ? (isSelected ? 'Remover da seleção' : 'Selecionar para sorteio') : 'Limite atingido'}
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setEditingId(s.id); setEditData({ ...s.data }); }}
                            className="p-1 rounded text-[hsl(220,10%,40%)] hover:text-white transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmDeleteId(s.id); }}
                            className="p-1 rounded text-[hsl(220,10%,40%)] hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Draw Button */}
        <div className="px-5 pb-5 pt-3">
          {selectedIds.length > 0 ? (
            <Button
              onClick={handleManualDraw}
              disabled={isSpinning}
              className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-[hsl(35,90%,50%)] to-[hsl(45,95%,55%)] hover:from-[hsl(35,90%,45%)] hover:to-[hsl(45,95%,50%)] text-[hsl(30,50%,10%)] shadow-lg shadow-[hsl(40,80%,40%,0.3)] border-0"
            >
              <Trophy className="mr-2 h-5 w-5" />
              {isSpinning ? 'SORTEANDO...' : `SORTEAR SELECIONADOS (${selectedIds.length})`}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs text-[hsl(220,10%,55%)]">Qtd:</label>
                <Input
                  type="number"
                  min={1}
                  max={sub.submissions.length || 1}
                  value={randomCount}
                  onChange={e => setRandomCount(parseInt(e.target.value) || 1)}
                  className="w-20 h-9 bg-[hsl(220,15%,16%)] border-[hsl(220,15%,22%)] text-white text-center text-sm rounded-lg"
                />
              </div>
              <Button
                onClick={handleRandomDraw}
                disabled={isSpinning || sub.submissions.length === 0}
                className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-[hsl(35,90%,50%)] to-[hsl(45,95%,55%)] hover:from-[hsl(35,90%,45%)] hover:to-[hsl(45,95%,50%)] text-[hsl(30,50%,10%)] shadow-lg shadow-[hsl(40,80%,40%,0.3)] border-0"
              >
                <Crown className="mr-2 h-5 w-5" />
                {isSpinning ? 'SORTEANDO...' : 'SORTEAR ALEATÓRIO'}
              </Button>
            </div>
          )}

          {/* Footer */}
          <p className="flex items-center justify-center gap-1.5 text-xs text-[hsl(220,10%,40%)] mt-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            Sorteio justo e transparente
          </p>
        </div>
      </div>

      {/* Raffle Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isSpinning) setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-md border-[hsl(45,80%,50%,0.3)] bg-[hsl(220,20%,12%)]" onPointerDownOutside={e => { if (isSpinning) e.preventDefault(); }}>
          {isSpinning && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="flex gap-3 text-4xl animate-bounce">
                {CASINO_EMOJIS.slice(0, 5).map((emoji, i) => (
                  <span key={i} className="inline-block" style={{ animation: `spin 0.3s linear infinite`, animationDelay: `${i * 0.1}s` }}>
                    {emoji}
                  </span>
                ))}
              </div>
              <div className="relative w-full overflow-hidden rounded-xl border-2 border-[hsl(45,80%,50%,0.3)] bg-[hsl(220,18%,14%)] p-4">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(45,80%,50%,0.03)] via-[hsl(45,80%,50%,0.08)] to-[hsl(45,80%,50%,0.03)] animate-pulse" />
                <div className="relative space-y-2">
                  {spinningNames.map((name, i) => (
                    <div key={i} className="rounded-lg bg-[hsl(220,15%,18%)] px-4 py-2 text-center font-mono text-sm text-[hsl(45,80%,60%)] transition-all">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm font-medium text-[hsl(45,80%,55%)] animate-pulse">🎰 Sorteando...</p>
            </div>
          )}

          {showResults && lastResults.length > 0 && (
            <div className="py-4">
              <div className="mb-6 text-center">
                <div className="mb-2 text-5xl">🎉🏆🎉</div>
                <h3 className="text-2xl font-bold text-[hsl(45,80%,55%)]">
                  {lastResults.length === 1 ? 'Ganhador!' : 'Ganhadores!'}
                </h3>
                <p className="text-sm text-[hsl(220,10%,50%)] mt-1">Parabéns aos sorteados!</p>
              </div>
              <div className="space-y-3">
                {lastResults.map((w, i) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-4 rounded-xl border border-[hsl(45,80%,50%,0.2)] bg-[hsl(45,80%,50%,0.05)] p-4 animate-fade-in"
                    style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'backwards' }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(35,90%,50%)] to-[hsl(45,95%,55%)] text-lg font-bold text-[hsl(30,50%,10%)] shadow-lg">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-base font-semibold text-white">
                        {Object.values(w.submissionData).join(' — ')}
                      </span>
                      {config.tipValuesEnabled && config.tipValues.length > 0 && (
                        <div className="mt-2">
                          <Select
                            value={tipSelections[w.id] || ''}
                            onValueChange={(val) => setTipSelections(prev => ({ ...prev, [w.id]: val }))}
                          >
                            <SelectTrigger className="h-9 bg-[hsl(220,15%,18%)] border-[hsl(220,15%,25%)] text-white w-full">
                              <SelectValue placeholder="Selecione o valor da gorjeta" />
                            </SelectTrigger>
                            <SelectContent>
                              {config.tipValues.map(val => (
                                <SelectItem key={val} value={val}>{val}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <span className="text-2xl">{CASINO_EMOJIS[i % CASINO_EMOJIS.length]}</span>
                  </div>
                ))}
              </div>
              {config.tipValuesEnabled && config.tipValues.length > 0 && (
                <Button
                  onClick={async () => {
                    for (const w of lastResults) {
                      const tipValue = tipSelections[w.id];
                      if (tipValue) {
                        await sub.updateWinTipValue(w.id, tipValue);
                      }
                    }
                    setTipSelections({});
                    setDialogOpen(false);
                    toast.success('Valores de gorjeta salvos!');
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-[hsl(140,60%,40%)] to-[hsl(140,50%,50%)] hover:from-[hsl(140,60%,35%)] hover:to-[hsl(140,50%,45%)] text-white"
                >
                  <Check className="mr-2 h-4 w-4" /> Salvar Valores
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRaffle;
