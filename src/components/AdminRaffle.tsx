import { useState } from 'react';
import { PageConfig, Submission, RaffleWin } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Shuffle, Users, Trophy } from 'lucide-react';

interface SubmissionsHook {
  submissions: Submission[];
  wins: RaffleWin[];
  drawRandom: (count: number, config: PageConfig) => { winners: Submission[]; wins: RaffleWin[] };
  drawSelected: (ids: string[], config: PageConfig) => RaffleWin[];
  canWin: (id: string, config: PageConfig) => boolean;
  getWinsForSubmission: (id: string, period: 'daily' | 'weekly' | 'monthly') => number;
}

interface Props {
  config: PageConfig;
  submissions: SubmissionsHook;
}

const AdminRaffle = ({ config, submissions: sub }: Props) => {
  const [randomCount, setRandomCount] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastResults, setLastResults] = useState<RaffleWin[]>([]);

  const handleRandomDraw = () => {
    if (sub.submissions.length === 0) {
      toast.error('Nenhum cadastro disponível para sorteio');
      return;
    }
    const result = sub.drawRandom(randomCount, config);
    setLastResults(result.wins);
    if (result.winners.length === 0) {
      toast.error('Nenhum participante elegível encontrado');
    } else {
      toast.success(`${result.winners.length} ganhador(es) sorteado(s)!`);
    }
  };

  const handleManualDraw = () => {
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos um participante');
      return;
    }
    const results = sub.drawSelected(selectedIds, config);
    setLastResults(results);
    setSelectedIds([]);
    if (results.length === 0) {
      toast.error('Nenhum participante selecionado é elegível');
    } else {
      toast.success(`${results.length} ganhador(es) confirmado(s)!`);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" /> Sorteio de Gorjetas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Total de cadastros: <strong className="text-foreground">{sub.submissions.length}</strong> | Sorteios realizados: <strong className="text-foreground">{sub.wins.length}</strong>
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
                <Button onClick={handleRandomDraw}>
                  <Shuffle className="mr-2 h-4 w-4" /> Sortear
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
                  <Button onClick={handleManualDraw} disabled={selectedIds.length === 0}>
                    <Trophy className="mr-2 h-4 w-4" /> Confirmar ({selectedIds.length})
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {lastResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎉 Último Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastResults.map((w, i) => (
                <div key={w.id} className="flex items-center gap-3 rounded-lg bg-accent/10 p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">
                    {Object.values(w.submissionData).join(' — ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminRaffle;
