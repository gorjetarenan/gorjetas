import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfig } from '@/hooks/useConfig';
import { useSubmissions } from '@/hooks/useSubmissions';
import AdminAppearance from '@/components/AdminAppearance';
import AdminFields from '@/components/AdminFields';
import AdminTexts from '@/components/AdminTexts';
import AdminRaffle from '@/components/AdminRaffle';
import AdminRules from '@/components/AdminRules';
import AdminExport from '@/components/AdminExport';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { config, updateConfig, resetConfig } = useConfig();
  const submissionsHook = useSubmissions();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          </div>
          <Button variant="outline" size="sm" onClick={resetConfig}>
            <RotateCcw className="mr-2 h-4 w-4" /> Resetar
          </Button>
        </div>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 gap-1 md:grid-cols-6">
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="fields">Campos</TabsTrigger>
            <TabsTrigger value="texts">Textos</TabsTrigger>
            <TabsTrigger value="raffle">Sorteio</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            <AdminAppearance config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="fields">
            <AdminFields config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="texts">
            <AdminTexts config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="raffle">
            <AdminRaffle config={config} submissions={submissionsHook} />
          </TabsContent>
          <TabsContent value="rules">
            <AdminRules config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="export">
            <AdminExport submissions={submissionsHook} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
