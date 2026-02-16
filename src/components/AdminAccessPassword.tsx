import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { KeyRound } from 'lucide-react';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const AdminAccessPassword = ({ config, onUpdate }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" /> Palavra-Chave de Acesso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="access-password-toggle">Ativar palavra-chave</Label>
          <Switch
            id="access-password-toggle"
            checked={config.accessPasswordEnabled}
            onCheckedChange={(v) => onUpdate({ accessPasswordEnabled: v })}
          />
        </div>

        {config.accessPasswordEnabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Palavra-chave</Label>
              <Input
                type="text"
                value={config.accessPassword}
                onChange={(e) => onUpdate({ accessPassword: e.target.value })}
                placeholder="Digite a palavra-chave..."
              />
            </div>
            <div className="space-y-2">
              <Label>Título do popup</Label>
              <Input
                value={config.accessGateTitle}
                onChange={(e) => onUpdate({ accessGateTitle: e.target.value })}
                placeholder="Acesso Restrito"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={config.accessGateDescription}
                onChange={(e) => onUpdate({ accessGateDescription: e.target.value })}
                placeholder="Digite a palavra-chave para acessar a página"
              />
            </div>
            <div className="space-y-2">
              <Label>Placeholder do campo</Label>
              <Input
                value={config.accessGatePlaceholder}
                onChange={(e) => onUpdate({ accessGatePlaceholder: e.target.value })}
                placeholder="Palavra-chave"
              />
            </div>
            <div className="space-y-2">
              <Label>Texto do botão</Label>
              <Input
                value={config.accessGateButtonText}
                onChange={(e) => onUpdate({ accessGateButtonText: e.target.value })}
                placeholder="Entrar"
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem de erro</Label>
              <Input
                value={config.accessGateErrorText}
                onChange={(e) => onUpdate({ accessGateErrorText: e.target.value })}
                placeholder="Palavra-chave incorreta"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Os visitantes precisarão digitar esta palavra-chave para acessar a página.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAccessPassword;
