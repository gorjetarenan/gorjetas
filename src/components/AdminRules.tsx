import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const AdminRules = ({ config, onUpdate }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Regras de Ganhos
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
  );
};

export default AdminRules;
