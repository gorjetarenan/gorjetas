import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useBanned } from '@/hooks/useBanned';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import AccessGate from '@/components/AccessGate';

const Index = () => {
  const { config, loading } = useConfig();
  const { addSubmission } = useSubmissions();
  const { isBanned } = useBanned();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  const backgroundStyle = (): React.CSSProperties => {
    if (config.backgroundType === 'solid') {
      return { backgroundColor: config.backgroundColor };
    } else if (config.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${config.gradientDirection}deg, ${config.gradientFrom}, ${config.gradientTo})`,
      };
    } else {
      return {
        backgroundImage: `url(${config.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enabledFields = config.fields.filter(f => f.enabled);
    const missing = enabledFields.filter(f => f.required && !formData[f.id]?.trim());

    if (missing.length > 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (config.raffleRulesEnabled && !acceptedRules) {
      toast.error('Você precisa aceitar as regras do sorteio');
      return;
    }

    if (isBanned(formData)) {
      toast.error('Seu cadastro foi bloqueado. Entre em contato com o administrador.');
      return;
    }

    try {
      await addSubmission(formData);
      setSubmitted(true);
      toast.success('Cadastro realizado com sucesso!');
    } catch (err: any) {
      if (err?.message === 'ID_ALREADY_EXISTS') {
        toast.error('Este ID já está cadastrado!');
      } else {
        toast.error('Erro ao realizar cadastro. Tente novamente.');
      }
    }
  };

  const enabledFields = config.fields.filter(f => f.enabled);

  const needsPassword = config.accessPasswordEnabled && config.accessPassword && !accessGranted;

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center" style={backgroundStyle()}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center" style={backgroundStyle()}>
        <AccessGate
          correctPassword={config.accessPassword}
          title={config.accessGateTitle}
          description={config.accessGateDescription}
          placeholder={config.accessGatePlaceholder}
          buttonText={config.accessGateButtonText}
          errorText={config.accessGateErrorText}
          onSuccess={() => setAccessGranted(true)}
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-4" style={backgroundStyle()}>
        <div className="glass-card w-full max-w-md p-6 text-center sm:p-8">
          <div className="mb-4 text-5xl animate-float sm:text-6xl">✅</div>
          <h2 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">Cadastro Realizado!</h2>
          <p className="mb-6 text-sm text-muted-foreground sm:text-base">Seus dados foram registrados com sucesso. Boa sorte!</p>
          <Button
            onClick={() => { setSubmitted(false); setFormData({}); setAcceptedRules(false); }}
            variant="outline"
            className="w-full"
          >
            Novo Cadastro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8 sm:py-12" style={backgroundStyle()}>
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground drop-shadow-lg sm:mb-3 sm:text-5xl md:text-6xl">
          {config.heroTitle}
        </h1>
        <p className="text-base text-foreground/70 sm:text-lg md:text-xl">{config.heroSubtitle}</p>
      </div>

      <div className="glass-card w-full max-w-md p-5 sm:p-8">
        <h2 className="mb-4 text-center text-lg font-semibold text-foreground sm:mb-6 sm:text-xl">
          {config.formTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {enabledFields.map(field => (
            <div key={field.id} className="space-y-1.5 sm:space-y-2">
              <Label htmlFor={field.id} className="text-sm text-foreground/90">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                className="h-11 border-border/40 bg-secondary text-foreground placeholder:text-muted-foreground/60 sm:h-10"
              />
            </div>
          ))}

          {config.raffleRulesEnabled && (
            <div className="rounded-lg border border-border/30 bg-secondary/50 p-3 sm:p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                📜 Regras do Sorteio
              </p>
              <ScrollArea className="max-h-[300px] pr-2">
                <div className="whitespace-pre-line text-xs text-foreground/70 leading-relaxed">
                  {config.raffleRules}
                </div>
              </ScrollArea>
              <div className="flex items-start gap-2 pt-1 border-t border-border/20">
                <Checkbox
                  id="accept-rules"
                  checked={acceptedRules}
                  onCheckedChange={(v) => setAcceptedRules(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="accept-rules" className="text-sm text-foreground/80 leading-tight">
                  Li e aceito as regras do sorteio
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl py-3.5 text-base font-semibold transition-all hover:brightness-110 active:scale-[0.99] sm:py-4 sm:text-lg"
            style={{ backgroundColor: config.submitButtonColor, color: config.submitButtonTextColor }}
          >
            Enviar
          </button>
        </form>

        {config.ctaButtonLink && (
          <a
            href={config.ctaButtonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full rounded-xl py-3.5 text-center font-bold transition-all hover:brightness-110 active:scale-[0.98] sm:mt-4 sm:py-4"
            style={{ backgroundColor: config.ctaButtonColor, color: config.ctaButtonTextColor }}
          >
            {config.ctaButtonText}
          </a>
        )}
      </div>

      {/* Rules Dialog (kept for backward compat) */}
      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-w-lg max-h-[85dvh]">
          <DialogHeader>
            <DialogTitle className="text-lg">📜 Regras do Sorteio</DialogTitle>
            <DialogDescription>
              Leia atentamente antes de participar
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60dvh] pr-4">
            <div className="whitespace-pre-line text-sm text-foreground/90 leading-relaxed">
              {config.raffleRules}
            </div>
          </ScrollArea>
          <Button
            className="w-full mt-2"
            onClick={() => {
              setAcceptedRules(true);
              setRulesOpen(false);
            }}
          >
            Li e Aceito as Regras
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
