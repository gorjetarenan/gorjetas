import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Paintbrush } from 'lucide-react';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const AdminAppearance = ({ config, onUpdate }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-primary" /> Aparência da Página
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Tipo de Fundo</Label>
          <Select
            value={config.backgroundType}
            onValueChange={(v) => onUpdate({ backgroundType: v as PageConfig['backgroundType'] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Cor Sólida</SelectItem>
              <SelectItem value="gradient">Gradiente</SelectItem>
              <SelectItem value="image">Imagem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.backgroundType === 'solid' && (
          <div className="space-y-2">
            <Label>Cor de Fundo</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.backgroundColor}
                onChange={e => onUpdate({ backgroundColor: e.target.value })}
                className="h-10 w-16 cursor-pointer rounded border-0 bg-transparent"
              />
              <Input
                value={config.backgroundColor}
                onChange={e => onUpdate({ backgroundColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {config.backgroundType === 'gradient' && (
          <>
            <div className="space-y-2">
              <Label>Cor Inicial</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.gradientFrom}
                  onChange={e => onUpdate({ gradientFrom: e.target.value })}
                  className="h-10 w-16 cursor-pointer rounded border-0 bg-transparent"
                />
                <Input value={config.gradientFrom} onChange={e => onUpdate({ gradientFrom: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor Final</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.gradientTo}
                  onChange={e => onUpdate({ gradientTo: e.target.value })}
                  className="h-10 w-16 cursor-pointer rounded border-0 bg-transparent"
                />
                <Input value={config.gradientTo} onChange={e => onUpdate({ gradientTo: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Direção (graus)</Label>
              <Input
                type="number"
                min="0"
                max="360"
                value={config.gradientDirection}
                onChange={e => onUpdate({ gradientDirection: e.target.value })}
              />
            </div>
            <div
              className="mt-4 h-20 rounded-lg"
              style={{
                background: `linear-gradient(${config.gradientDirection}deg, ${config.gradientFrom}, ${config.gradientTo})`,
              }}
            >
              <p className="flex h-full items-center justify-center text-sm text-foreground/50">Preview</p>
            </div>
          </>
        )}

        {config.backgroundType === 'image' && (
          <div className="space-y-2">
            <Label>URL da Imagem</Label>
            <Input
              placeholder="https://exemplo.com/imagem.jpg"
              value={config.backgroundImage}
              onChange={e => onUpdate({ backgroundImage: e.target.value })}
            />
            {config.backgroundImage && (
              <div
                className="mt-2 h-32 rounded-lg bg-cover bg-center border border-border/30"
                style={{ backgroundImage: `url(${config.backgroundImage})` }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAppearance;
