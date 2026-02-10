import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Shield, ScrollText } from 'lucide-react';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const AdminRules = ({ config, onUpdate }: Props) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Limites de Ganhos
          </CardTitle>
          <CardDescription>
            Configure os limites máximos de vezes que um participante pode ganhar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Máximo de Ganhos Diários (por pessoa)</Label>
            <Input
              type="number"
              min={1}
              value={config.maxDailyWins}
              onChange={e => onUpdate({ maxDailyWins: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Máximo de Ganhos Semanais (por pessoa)</Label>
            <Input
              type="number"
              min={1}
              value={config.maxWeeklyWins}
              onChange={e => onUpdate({ maxWeeklyWins: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Máximo de Ganhos Mensais (por pessoa)</Label>
            <Input
              type="number"
              min={1}
              value={config.maxMonthlyWins}
              onChange={e => onUpdate({ maxMonthlyWins: parseInt(e.target.value) || 1 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" /> Regras do Sorteio
          </CardTitle>
          <CardDescription>
            Defina as regras que os participantes devem aceitar antes de se cadastrar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Exigir aceitação das regras</Label>
            <Switch
              checked={config.raffleRulesEnabled}
              onCheckedChange={v => onUpdate({ raffleRulesEnabled: v })}
            />
          </div>
          <div className="space-y-2">
            <Label>Texto das Regras</Label>
            <Textarea
              rows={8}
              placeholder="Digite as regras do sorteio..."
              value={config.raffleRules}
              onChange={e => onUpdate({ raffleRules: e.target.value })}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Use quebras de linha para separar cada regra. Ex: "1. Regra um\n2. Regra dois"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRules;
