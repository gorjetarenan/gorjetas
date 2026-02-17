import { useState } from 'react';
import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, X, Wallet, Tag } from 'lucide-react';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const AdminTipValues = ({ config, onUpdate }: Props) => {
  const [newValue, setNewValue] = useState('');

  const addValue = () => {
    const v = newValue.trim();
    if (!v || config.tipValues.includes(v)) return;
    onUpdate({ tipValues: [...config.tipValues, v] });
    setNewValue('');
  };

  const removeValue = (val: string) => {
    onUpdate({ tipValues: config.tipValues.filter(v => v !== val) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Valores de Gorjeta
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="tip-values-toggle" className="text-sm text-muted-foreground">
              {config.tipValuesEnabled ? 'Ativado' : 'Desativado'}
            </Label>
            <Switch
              id="tip-values-toggle"
              checked={config.tipValuesEnabled}
              onCheckedChange={(checked) => onUpdate({ tipValuesEnabled: checked })}
            />
          </div>
        </CardHeader>
        <CardContent className={`space-y-5 ${!config.tipValuesEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <p className="text-sm text-muted-foreground">
            Defina os valores disponíveis para seleção ao sortear um ganhador. O valor escolhido será salvo junto ao sorteio.
          </p>

          {/* Weekly Budget */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              Valor Semanal Disponível (R$)
            </Label>
            <Input
              type="number"
              min={0}
              value={config.weeklyTipBudget}
              onChange={(e) => onUpdate({ weeklyTipBudget: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 500"
            />
            <p className="text-xs text-muted-foreground">
              Orçamento total disponível por semana para distribuição de gorjetas.
            </p>
          </div>

          {/* Default Tip Value */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Valor Padrão da Gorjeta (R$)
            </Label>
            <Input
              type="number"
              min={0}
              value={config.defaultTipValue}
              onChange={(e) => onUpdate({ defaultTipValue: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 10"
            />
            <p className="text-xs text-muted-foreground">
              Valor base usado para calcular a quantidade de gorjetas disponíveis na semana (Semanal ÷ Padrão).
            </p>
          </div>

          {/* Tip Values List */}
          <div className="space-y-2">
            <Label>Valores para Seleção</Label>
            <div className="flex gap-2">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Ex: R$ 25,00"
                onKeyDown={(e) => e.key === 'Enter' && addValue()}
              />
              <Button onClick={addValue} size="sm" disabled={!newValue.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {config.tipValues.map((val) => (
              <Badge key={val} variant="secondary" className="text-sm py-1.5 px-3 gap-1.5">
                {val}
                <button onClick={() => removeValue(val)} className="hover:text-destructive transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
            {config.tipValues.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Nenhum valor cadastrado</p>
            )}
          </div>

          {/* Preview */}
          {config.weeklyTipBudget > 0 && config.defaultTipValue > 0 && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Com <strong className="text-foreground">R$ {config.weeklyTipBudget.toFixed(2)}</strong> semanais e valor padrão de{' '}
                <strong className="text-foreground">R$ {config.defaultTipValue.toFixed(2)}</strong>, você tem aproximadamente{' '}
                <strong className="text-foreground">{Math.floor(config.weeklyTipBudget / config.defaultTipValue)}</strong> gorjetas disponíveis por semana.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTipValues;
