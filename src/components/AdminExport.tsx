import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Submission, RaffleWin } from '@/types/config';
import { Download, FileText, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SubmissionsHook {
  submissions: Submission[];
  wins: RaffleWin[];
  getWinsByDate: (date: string) => RaffleWin[];
}

interface Props {
  submissions: SubmissionsHook;
}

const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadPDF = (title: string, filename: string, headers: string[], rows: string[][]) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

  autoTable(doc, {
    startY: 34,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(filename);
};

const AdminExport = ({ submissions: sub }: Props) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const filteredWins = sub.getWinsByDate(selectedDate);

  const getWinHeaders = () => {
    const dataKeys = filteredWins.length > 0 ? Object.keys(filteredWins[0].submissionData) : [];
    return ['#', 'Data do Sorteio', ...dataKeys];
  };

  const getWinRows = () =>
    filteredWins.map((w, i) => [
      String(i + 1),
      new Date(w.date).toLocaleString('pt-BR'),
      ...Object.values(w.submissionData),
    ]);

  const getSubHeaders = () => {
    const allKeys = new Set<string>();
    sub.submissions.forEach(s => Object.keys(s.data).forEach(k => allKeys.add(k)));
    return ['#', 'Data Cadastro', ...Array.from(allKeys)];
  };

  const getSubRows = () => {
    const allKeys = new Set<string>();
    sub.submissions.forEach(s => Object.keys(s.data).forEach(k => allKeys.add(k)));
    const keys = Array.from(allKeys);
    return sub.submissions.map((s, i) => [
      String(i + 1),
      new Date(s.createdAt).toLocaleString('pt-BR'),
      ...keys.map(k => s.data[k] || ''),
    ]);
  };

  const exportWinsCSV = () => {
    if (filteredWins.length === 0) { toast.error('Nenhum sorteado para esta data'); return; }
    downloadCSV(`sorteados_${selectedDate}.csv`, getWinHeaders(), getWinRows());
    toast.success('CSV exportado com sucesso!');
  };

  const exportWinsPDF = () => {
    if (filteredWins.length === 0) { toast.error('Nenhum sorteado para esta data'); return; }
    const dateFormatted = selectedDate.split('-').reverse().join('/');
    downloadPDF(`Sorteados — ${dateFormatted}`, `sorteados_${selectedDate}.pdf`, getWinHeaders(), getWinRows());
    toast.success('PDF exportado com sucesso!');
  };

  const exportAllCSV = () => {
    if (sub.submissions.length === 0) { toast.error('Nenhum cadastro para exportar'); return; }
    downloadCSV(`todos_cadastros_${new Date().toISOString().split('T')[0]}.csv`, getSubHeaders(), getSubRows());
    toast.success('CSV exportado com sucesso!');
  };

  const exportAllPDF = () => {
    if (sub.submissions.length === 0) { toast.error('Nenhum cadastro para exportar'); return; }
    downloadPDF('Todos os Cadastros', `todos_cadastros_${new Date().toISOString().split('T')[0]}.pdf`, getSubHeaders(), getSubRows());
    toast.success('PDF exportado com sucesso!');
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

          <div className="flex flex-wrap gap-2">
            <Button onClick={exportWinsCSV} disabled={filteredWins.length === 0}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button onClick={exportWinsPDF} disabled={filteredWins.length === 0} variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
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
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportAllCSV} disabled={sub.submissions.length === 0}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button onClick={exportAllPDF} disabled={sub.submissions.length === 0} variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExport;
