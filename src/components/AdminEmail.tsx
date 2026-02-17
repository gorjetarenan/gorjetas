import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Variable } from 'lucide-react';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const getAvailableVariables = (config: PageConfig) => {
  const fieldVars = config.fields
    .filter(f => f.enabled)
    .map(f => ({ name: `{{${f.id}}}`, description: f.label }));
  const vars = [...fieldVars, { name: '{{date}}', description: 'Data do sorteio' }];
  if (config.tipValuesEnabled) {
    vars.push({ name: '{{tipValue}}', description: 'Valor da gorjeta' });
  }
  return vars;
};

const AdminEmail = ({ config, onUpdate }: Props) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Notificação por Email
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="email-toggle" className="text-sm text-muted-foreground">
              {config.emailNotificationEnabled ? 'Ativado' : 'Desativado'}
            </Label>
            <Switch
              id="email-toggle"
              checked={config.emailNotificationEnabled}
              onCheckedChange={(checked) => onUpdate({ emailNotificationEnabled: checked })}
            />
          </div>
        </CardHeader>
        <CardContent className={`space-y-5 ${!config.emailNotificationEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-2">
            <Label>Nome do Remetente</Label>
            <Input
              value={config.emailFromName}
              onChange={(e) => onUpdate({ emailFromName: e.target.value })}
              placeholder="Nome que aparecerá no email"
            />
          </div>

          <div className="space-y-2">
            <Label>Assunto do Email</Label>
            <Input
              value={config.emailSubject}
              onChange={(e) => onUpdate({ emailSubject: e.target.value })}
              placeholder="Assunto do email de notificação"
            />
          </div>

          <div className="space-y-2">
            <Label>Corpo do Email</Label>
            <Textarea
              value={config.emailBody}
              onChange={(e) => onUpdate({ emailBody: e.target.value })}
              placeholder="Conteúdo do email..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Variable className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Variáveis Disponíveis</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getAvailableVariables(config).map((v) => (
                <Badge key={v.name} variant="secondary" className="font-mono text-xs cursor-default">
                  {v.name} <span className="ml-1 font-sans text-muted-foreground">— {v.description}</span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmail;
