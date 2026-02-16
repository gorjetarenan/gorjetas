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
          <div className="space-y-2">
            <Label>Palavra-chave</Label>
            <Input
              type="text"
              value={config.accessPassword}
              onChange={(e) => onUpdate({ accessPassword: e.target.value })}
              placeholder="Digite a palavra-chave..."
            />
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
