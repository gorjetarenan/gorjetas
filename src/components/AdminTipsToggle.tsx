import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Ban } from 'lucide-react';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const AdminTipsToggle = ({ config, onUpdate }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-primary" /> Desativar Gorjetas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="tips-disabled">Gorjetas desativadas</Label>
          <Switch
            id="tips-disabled"
            checked={config.tipsDisabled}
            onCheckedChange={(v) => onUpdate({ tipsDisabled: v })}
          />
        </div>

        {config.tipsDisabled && (
          <>
            <div className="space-y-2">
              <Label>Mensagem de encerramento</Label>
              <Input
                value={config.tipsDisabledMessage}
                onChange={(e) => onUpdate({ tipsDisabledMessage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Texto do botão CTA</Label>
              <Input
                value={config.tipsDisabledCtaText}
                onChange={(e) => onUpdate({ tipsDisabledCtaText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Link do botão CTA</Label>
              <Input
                value={config.tipsDisabledCtaLink}
                onChange={(e) => onUpdate({ tipsDisabledCtaLink: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTipsToggle;
