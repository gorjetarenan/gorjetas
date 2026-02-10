import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Type } from 'lucide-react';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const AdminTexts = ({ config, onUpdate }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" /> Textos da Página
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Título Principal</Label>
          <Input value={config.heroTitle} onChange={e => onUpdate({ heroTitle: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Subtítulo</Label>
          <Input value={config.heroSubtitle} onChange={e => onUpdate({ heroSubtitle: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Título do Formulário</Label>
          <Input value={config.formTitle} onChange={e => onUpdate({ formTitle: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Texto do Botão CTA</Label>
          <Input value={config.ctaButtonText} onChange={e => onUpdate({ ctaButtonText: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Link do Botão CTA</Label>
          <Input
            value={config.ctaButtonLink}
            onChange={e => onUpdate({ ctaButtonLink: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTexts;
