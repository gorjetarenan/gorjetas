import { useRef } from 'react';
import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Paintbrush, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const AdminAppearance = ({ config, onUpdate }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdate({ backgroundImage: dataUrl });
      toast.success('Imagem carregada com sucesso!');
    };
    reader.readAsDataURL(file);
  };
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
          <div className="space-y-4">
            <Label>Imagem de Fundo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {config.backgroundImage ? 'Trocar Imagem' : 'Enviar Imagem'}
              </Button>
              {config.backgroundImage && (
                <Button
                  variant="outline"
                  onClick={() => onUpdate({ backgroundImage: '' })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            {config.backgroundImage && (
              <div
                className="h-40 rounded-lg bg-cover bg-center border border-border/30"
                style={{ backgroundImage: `url(${config.backgroundImage})` }}
              />
            )}
          </div>
        )}

        {/* Button Colors */}
        <div className="border-t border-border/30 pt-6 space-y-4">
          <p className="text-sm font-semibold text-foreground">Cores dos Botões</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs">Botão Enviar — Fundo</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={config.submitButtonColor} onChange={e => onUpdate({ submitButtonColor: e.target.value })} className="h-10 w-16 cursor-pointer rounded border-0 bg-transparent" />
                <Input value={config.submitButtonColor} onChange={e => onUpdate({ submitButtonColor: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Botão Enviar — Texto</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={config.submitButtonTextColor} onChange={e => onUpdate({ submitButtonTextColor: e.target.value })} className="h-10 w-16 cursor-pointer rounded border-0 bg-transparent" />
                <Input value={config.submitButtonTextColor} onChange={e => onUpdate({ submitButtonTextColor: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Botão CTA — Fundo</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={config.ctaButtonColor} onChange={e => onUpdate({ ctaButtonColor: e.target.value })} className="h-10 w-16 cursor-pointer rounded border-0 bg-transparent" />
                <Input value={config.ctaButtonColor} onChange={e => onUpdate({ ctaButtonColor: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Botão CTA — Texto</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={config.ctaButtonTextColor} onChange={e => onUpdate({ ctaButtonTextColor: e.target.value })} className="h-10 w-16 cursor-pointer rounded border-0 bg-transparent" />
                <Input value={config.ctaButtonTextColor} onChange={e => onUpdate({ ctaButtonTextColor: e.target.value })} className="flex-1" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex gap-3 mt-2">
            <button className="flex-1 rounded-xl py-3 font-semibold text-sm" style={{ backgroundColor: config.submitButtonColor, color: config.submitButtonTextColor }}>
              Enviar (Preview)
            </button>
            <button className="flex-1 rounded-xl py-3 font-bold text-sm" style={{ backgroundColor: config.ctaButtonColor, color: config.ctaButtonTextColor }}>
              CTA (Preview)
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAppearance;
