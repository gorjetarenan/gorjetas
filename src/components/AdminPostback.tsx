import { PageConfig } from '@/types/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Link2, Copy, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  config: PageConfig;
  onUpdate: (updates: Partial<PageConfig>) => void;
}

const AdminPostback = ({ config, onUpdate }: Props) => {
  const [copied, setCopied] = useState(false);
  const [validatedCount, setValidatedCount] = useState(0);

  const postbackUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-winner-email`;

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('validated_players')
        .select('*', { count: 'exact', head: true });
      setValidatedCount(count || 0);
    };
    fetchCount();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(postbackUrl);
    setCopied(true);
    toast.success('URL copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" /> Validação por Postback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="postback-toggle">Ativar validação de IDs por postback</Label>
          <Switch
            id="postback-toggle"
            checked={config.postbackValidationEnabled}
            onCheckedChange={(v) => onUpdate({ postbackValidationEnabled: v })}
          />
        </div>

        <div className="space-y-2">
          <Label>URL de Postback (cole na plataforma)</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={postbackUrl}
              className="text-xs font-mono"
            />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure esta URL como postback de registro na sua plataforma. Quando um usuário se cadastrar lá, o ID será automaticamente validado aqui.
          </p>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-sm text-foreground">
            IDs validados: <strong>{validatedCount}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {config.postbackValidationEnabled
              ? 'Apenas participantes com IDs validados poderão ser sorteados.'
              : 'A validação está desativada. Todos os participantes são elegíveis ao sorteio.'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Parâmetros aceitos:</p>
          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
            <li><code className="text-foreground">player_id</code> (obrigatório) — ID do jogador</li>
            <li><code className="text-foreground">currency</code> — Moeda</li>
            <li><code className="text-foreground">registration_date</code> — Data de registro</li>
            <li><code className="text-foreground">type</code> — Tipo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPostback;
