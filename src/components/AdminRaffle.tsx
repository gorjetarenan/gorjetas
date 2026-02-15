import { useState, useEffect, useRef } from 'react';
import { PageConfig, Submission, RaffleWin } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shuffle, Users, Trophy, Trash2, Dices, Pencil, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface SubmissionsHook {
  submissions: Submission[];
  wins: RaffleWin[];
  clearSubmissions: () => void | Promise<void>;
  updateSubmission: (id: string, data: Record<string, string>) => void | Promise<void>;
  removeSubmission: (id: string) => void | Promise<void>;
  drawRandom: (count: number, config: PageConfig) => Promise<{ winners: Submission[]; wins: RaffleWin[] }>;
  drawSelected: (ids: string[], config: PageConfig) => Promise<RaffleWin[]>;
  canWin: (id: string, config: PageConfig) => boolean;
  getWinsForSubmission: (id: string, period: 'daily' | 'weekly' | 'monthly') => number;
}

interface Props {
  config: PageConfig;
  submissions: SubmissionsHook;
}

const CASINO_EMOJIS = ['🎰', '💰', '🃏', '🎲', '💎', '7️⃣', '🍒', '⭐', '🔔', '👑'];

const AdminRaffle = ({ config, submissions: sub }: Props) => {
  const [randomCount, setRandomCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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

  return (
    <div className="space-y-6">
      {/* Cadastrados Container */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Cadastrados ({sub.submissions.length})
          </CardTitle>
          <div className="flex gap-2">
            {confirmClear ? (
              <>
                <Button variant="destructive" size="sm" onClick={handleClearSubmissions}>
                  Confirmar Exclusão
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmClear(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSubmissions}
                disabled={sub.submissions.length === 0}
              >
                <Trash2 className="mr-1 h-4 w-4 text-destructive" /> Zerar Cadastros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sub.submissions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhum cadastro registrado ainda.</p>
          ) : (
             <>
             <div className="rounded-lg border border-border/50">
               <table className="w-full text-sm">
                 <thead className="bg-secondary">
                   <tr>
                     <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                     {sub.submissions[0] && Object.keys(sub.submissions[0].data).map(key => (
                       <th key={key} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground capitalize">{key}</th>
                     ))}
                     <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Data</th>
                     <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Ações</th>
                   </tr>
                 </thead>
                 <tbody>
                   {(() => {
                     const totalPages = Math.ceil(sub.submissions.length / itemsPerPage);
                     const safePage = Math.min(currentPage, totalPages || 1);
                     const start = (safePage - 1) * itemsPerPage;
                     const paged = sub.submissions.slice(start, start + itemsPerPage);
                     return paged.map((s, i) => (
                       <tr key={s.id} className="border-t border-border/30 transition-colors hover:bg-muted/30">
                         <td className="px-3 py-2 text-muted-foreground">{start + i + 1}</td>
                         {editingId === s.id ? (
                           Object.entries(s.data).map(([key]) => (
                             <td key={key} className="px-3 py-2">
                               <Input
                                 value={editData[key] || ''}
                                 onChange={e => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
                                 className="h-7 text-xs"
                               />
                             </td>
                           ))
                         ) : (
                           Object.values(s.data).map((val, vi) => (
                             <td key={vi} className="px-3 py-2 text-foreground">{val}</td>
                           ))
                         )}
                         <td className="px-3 py-2 text-muted-foreground text-xs">
                           {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                         </td>
                         <td className="px-3 py-2 text-right">
                           {editingId === s.id ? (
                             <div className="flex justify-end gap-1">
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { sub.updateSubmission(s.id, editData); setEditingId(null); toast.success('Cadastro atualizado'); }}>
                                 <Check className="h-3.5 w-3.5 text-green-500" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                                 <X className="h-3.5 w-3.5 text-muted-foreground" />
                               </Button>
                             </div>
                           ) : confirmDeleteId === s.id ? (
                             <div className="flex justify-end gap-1">
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { sub.removeSubmission(s.id); setConfirmDeleteId(null); toast.success('Cadastro removido'); }}>
                                 <Check className="h-3.5 w-3.5 text-destructive" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmDeleteId(null)}>
                                 <X className="h-3.5 w-3.5 text-muted-foreground" />
                               </Button>
                             </div>
                           ) : (
                             <div className="flex justify-end gap-1">
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(s.id); setEditData({ ...s.data }); }}>
                                 <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmDeleteId(s.id)}>
                                 <Trash2 className="h-3.5 w-3.5 text-destructive" />
                               </Button>
                             </div>
                           )}
                         </td>
                       </tr>
                     ));
                   })()}
                 </tbody>
               </table>
             </div>

             {/* Pagination */}
             {sub.submissions.length > itemsPerPage && (() => {
               const totalPages = Math.ceil(sub.submissions.length / itemsPerPage);
               return (
                 <div className="flex items-center justify-between pt-3">
                   <p className="text-xs text-muted-foreground">
                     Página {Math.min(currentPage, totalPages)} de {totalPages}
                   </p>
                   <div className="flex items-center gap-1">
                     <Button
                       variant="outline"
                       size="icon"
                       className="h-8 w-8"
                       disabled={currentPage <= 1}
                       onClick={() => setCurrentPage(p => p - 1)}
                     >
                       <ChevronLeft className="h-4 w-4" />
                     </Button>
                     <Button
                       variant="outline"
                       size="icon"
                       className="h-8 w-8"
                       disabled={currentPage >= totalPages}
                       onClick={() => setCurrentPage(p => p + 1)}
                     >
                       <ChevronRight className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               );
             })()}
             </>
           )}
         </CardContent>
       </Card>

      {/* Sorteio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" /> Sorteio de Gorjetas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Sorteios realizados: <strong className="text-foreground">{sub.wins.length}</strong>
          </p>

          <Tabs defaultValue="random">
            <TabsList className="mb-4">
              <TabsTrigger value="random">
                <Shuffle className="mr-1 h-4 w-4" /> Aleatório
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Users className="mr-1 h-4 w-4" /> Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="random" className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="space-y-2">
                  <Label>Quantidade de Ganhadores</Label>
                  <Input
                    type="number"
                    min={1}
                    max={sub.submissions.length || 1}
                    value={randomCount}
                    onChange={e => setRandomCount(parseInt(e.target.value) || 1)}
                    className="w-32"
                  />
                </div>
                <Button onClick={handleRandomDraw} disabled={isSpinning}>
                  <Dices className="mr-2 h-4 w-4" /> {isSpinning ? 'Sorteando...' : 'Sortear'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              {sub.submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum cadastro disponível.</p>
              ) : (
                <>
                  <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border/50 p-3">
                    {sub.submissions.map(s => {
                      const eligible = sub.canWin(s.id, config);
                      return (
                        <label
                          key={s.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50 ${!eligible ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <Checkbox
                            checked={selectedIds.includes(s.id)}
                            onCheckedChange={() => toggleSelect(s.id)}
                            disabled={!eligible}
                          />
                          <span className="flex-1 text-sm text-foreground">
                            {Object.values(s.data).join(' — ')}
                          </span>
                          {!eligible && (
                            <span className="text-xs text-destructive">Limite atingido</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  <Button onClick={handleManualDraw} disabled={selectedIds.length === 0 || isSpinning}>
                    <Trophy className="mr-2 h-4 w-4" /> Confirmar ({selectedIds.length})
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Raffle Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isSpinning) setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-md border-accent/30" onPointerDownOutside={e => { if (isSpinning) e.preventDefault(); }}>
          {isSpinning && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="flex gap-3 text-4xl animate-bounce">
                {CASINO_EMOJIS.slice(0, 5).map((emoji, i) => (
                  <span
                    key={i}
                    className="inline-block"
                    style={{
                      animation: `spin 0.3s linear infinite`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>

              <div className="relative w-full overflow-hidden rounded-xl border-2 border-accent/40 bg-secondary/80 p-4">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 animate-pulse" />
                <div className="relative space-y-2">
                  {spinningNames.map((name, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-muted/60 px-4 py-2 text-center font-mono text-sm text-accent transition-all"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm font-medium text-accent animate-pulse">🎰 Sorteando...</p>
            </div>
          )}

          {showResults && lastResults.length > 0 && (
            <div className="py-4">
              <div className="mb-6 text-center">
                <div className="mb-2 text-5xl">🎉🏆🎉</div>
                <h3 className="text-2xl font-bold text-accent">
                  {lastResults.length === 1 ? 'Ganhador!' : 'Ganhadores!'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Parabéns aos sorteados!</p>
              </div>

              <div className="space-y-3">
                {lastResults.map((w, i) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-4 rounded-xl border border-accent/20 bg-accent/5 p-4 animate-fade-in"
                    style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'backwards' }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground shadow-lg">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-base font-semibold text-foreground">
                        {Object.values(w.submissionData).join(' — ')}
                      </span>
                    </div>
                    <span className="text-2xl">{CASINO_EMOJIS[i % CASINO_EMOJIS.length]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRaffle;
