import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Submission, RaffleWin } from '@/types/config';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface SubmissionsHook {
  submissions: Submission[];
  wins: RaffleWin[];
  getWinsByDate: (date: string) => RaffleWin[];
}

interface Props {
  submissions: SubmissionsHook;
}

const AdminExport = ({ submissions: sub }: Props) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const filteredWins = sub.getWinsByDate(selectedDate);

  const exportCSV = () => {
    if (filteredWins.length === 0) {
      toast.error('Nenhum dado para exportar nesta data');
      return;
    }

    const headers = ['ID', 'Data', ...Object.keys(filteredWins[0]?.submissionData || {})];
    const rows = filteredWins.map(w => [
      w.submissionId,
      new Date(w.date).toLocaleString('pt-BR'),
      ...Object.values(w.submissionData),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sorteados_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Arquivo exportado com sucesso!');
  };

  const exportAllSubmissions = () => {
    if (sub.submissions.length === 0) {
      toast.error('Nenhum cadastro para exportar');
      return;
    }

    const allKeys = new Set<string>();
    sub.submissions.forEach(s => Object.keys(s.data).forEach(k => allKeys.add(k)));
    const keys = Array.from(allKeys);

    const headers = ['ID', 'Data Cadastro', ...keys];
    const rows = sub.submissions.map(s => [
      s.id,
      new Date(s.createdAt).toLocaleString('pt-BR'),
      ...keys.map(k => s.data[k] || ''),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos_cadastros_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Arquivo exportado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" /> Exportar Sorteados por Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Selecione a Data</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{filteredWins.length}</strong> sorteado(s) encontrado(s) para esta data
          </p>

          {filteredWins.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border/50 p-3">
              {filteredWins.map(w => (
                <div key={w.id} className="text-sm text-foreground">
                  {Object.values(w.submissionData).join(' — ')}
                </div>
              ))}
            </div>
          )}

          <Button onClick={exportCSV} disabled={filteredWins.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV (Sorteados)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Exportar Todos os Cadastros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Total de cadastros: <strong className="text-foreground">{sub.submissions.length}</strong>
          </p>
          <Button onClick={exportAllSubmissions} disabled={sub.submissions.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Exportar Todos os Cadastros
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExport;
