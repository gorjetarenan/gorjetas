import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ban, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export interface BannedEntry {
  id: string;
  type: 'email' | 'accountId';
  value: string;
  reason: string;
  createdAt: string;
}

interface Props {
  banned: BannedEntry[];
  onAdd: (entry: Omit<BannedEntry, 'id' | 'createdAt'>) => void;
  onRemove: (id: string) => void;
}

const AdminBanned = ({ banned, onAdd, onRemove }: Props) => {
  const [type, setType] = useState<'email' | 'accountId'>('email');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');

  const handleAdd = () => {
    if (!value.trim()) {
      toast.error('Informe o valor para banir');
      return;
    }
    onAdd({ type, value: value.trim().toLowerCase(), reason: reason.trim() });
    setValue('');
    setReason('');
    toast.success('Usuário banido com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-destructive" /> Usuários Banidos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new ban */}
        <div className="rounded-lg border border-border/50 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Adicionar Banimento</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select value={type} onValueChange={v => setType(v as 'email' | 'accountId')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="accountId">ID da Conta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valor ({type === 'email' ? 'Email' : 'ID'})</Label>
              <Input
                placeholder={type === 'email' ? 'email@exemplo.com' : 'ID da conta'}
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Motivo (opcional)</Label>
            <Input
              placeholder="Ex: Comportamento inadequado"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" /> Banir
          </Button>
        </div>

        {/* Banned list */}
        {banned.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">Nenhum usuário banido.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{banned.length}</strong> banimento(s) ativo(s)
            </p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border/50">
              {banned.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 border-b border-border/30 px-4 py-3 last:border-0"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                    {entry.type === 'email' ? '📧' : '🆔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.type === 'email' ? 'Email' : 'ID da Conta'}
                      {entry.reason && ` • ${entry.reason}`}
                      {' • '}
                      {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onRemove(entry.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminBanned;
