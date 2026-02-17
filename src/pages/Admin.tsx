import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfig } from '@/hooks/useConfig';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useBanned } from '@/hooks/useBanned';
import AdminAppearance from '@/components/AdminAppearance';
import AdminFields from '@/components/AdminFields';
import AdminTexts from '@/components/AdminTexts';
import AdminRaffle from '@/components/AdminRaffle';
import AdminRules from '@/components/AdminRules';
import AdminExport from '@/components/AdminExport';
import AdminEmail from '@/components/AdminEmail';
import AdminBanned from '@/components/AdminBanned';
import AdminAccessPassword from '@/components/AdminAccessPassword';
import AdminPostback from '@/components/AdminPostback';
import AdminTipsToggle from '@/components/AdminTipsToggle';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type AdminView = 'raffle' | 'settings';

const Admin = () => {
  const { config, updateConfig, resetConfig } = useConfig();
  const { signOut } = useAuth();
  const submissionsHook = useSubmissions();
  const { banned, addBan, removeBan } = useBanned();
  const [view, setView] = useState<AdminView>('raffle');

  if (view === 'raffle') {
    return (
      <div className="min-h-screen bg-background p-3 pb-8 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center justify-between md:mb-6">
            <h1 className="text-lg font-bold text-foreground md:text-2xl">Sorteio</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setView('settings')} className="text-xs md:text-sm">
                <Settings className="mr-1 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" /> Configurações
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-xs md:text-sm text-destructive">
                <LogOut className="mr-1 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" /> Sair
              </Button>
            </div>
          </div>

          <Tabs defaultValue="raffle" className="w-full">
            <ScrollArea className="w-full mb-4 md:mb-6">
              <TabsList className="inline-flex w-max gap-1 p-1">
                <TabsTrigger value="raffle" className="text-xs md:text-sm px-3">Sorteio</TabsTrigger>
                <TabsTrigger value="dashboard" className="text-xs md:text-sm px-3">Dashboard</TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <TabsContent value="raffle" forceMount className="data-[state=inactive]:hidden">
              <AdminRaffle config={config} submissions={submissionsHook} />
            </TabsContent>
            <TabsContent value="dashboard" forceMount className="data-[state=inactive]:hidden">
              <AdminDashboard submissions={submissionsHook.submissions} wins={submissionsHook.wins} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 pb-8 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setView('raffle')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground md:text-2xl">Configurações</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetConfig} className="text-xs md:text-sm">
              <RotateCcw className="mr-1 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" /> Resetar
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs md:text-sm text-destructive">
              <LogOut className="mr-1 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" /> Sair
            </Button>
          </div>
        </div>

        <Tabs defaultValue="appearance" className="w-full">
          <ScrollArea className="w-full mb-4 md:mb-6">
            <TabsList className="inline-flex w-max gap-1 p-1">
              <TabsTrigger value="appearance" className="text-xs md:text-sm px-3">Aparência</TabsTrigger>
              <TabsTrigger value="fields" className="text-xs md:text-sm px-3">Campos</TabsTrigger>
              <TabsTrigger value="texts" className="text-xs md:text-sm px-3">Textos</TabsTrigger>
              <TabsTrigger value="rules" className="text-xs md:text-sm px-3">Regras</TabsTrigger>
              <TabsTrigger value="banned" className="text-xs md:text-sm px-3">Banidos</TabsTrigger>
              <TabsTrigger value="email" className="text-xs md:text-sm px-3">Email</TabsTrigger>
              <TabsTrigger value="access" className="text-xs md:text-sm px-3">Acesso</TabsTrigger>
              <TabsTrigger value="postback" className="text-xs md:text-sm px-3">Postback</TabsTrigger>
              <TabsTrigger value="tips-toggle" className="text-xs md:text-sm px-3">Gorjetas</TabsTrigger>
              <TabsTrigger value="export" className="text-xs md:text-sm px-3">Exportar</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="appearance" forceMount className="data-[state=inactive]:hidden">
            <AdminAppearance config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="fields" forceMount className="data-[state=inactive]:hidden">
            <AdminFields config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="texts" forceMount className="data-[state=inactive]:hidden">
            <AdminTexts config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="rules" forceMount className="data-[state=inactive]:hidden">
            <AdminRules config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="banned" forceMount className="data-[state=inactive]:hidden">
            <AdminBanned banned={banned} onAdd={addBan} onRemove={removeBan} />
          </TabsContent>
          <TabsContent value="email" forceMount className="data-[state=inactive]:hidden">
            <AdminEmail config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="access" forceMount className="data-[state=inactive]:hidden">
            <AdminAccessPassword config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="postback" forceMount className="data-[state=inactive]:hidden">
            <AdminPostback config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="tips-toggle" forceMount className="data-[state=inactive]:hidden">
            <AdminTipsToggle config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="export" forceMount className="data-[state=inactive]:hidden">
            <AdminExport submissions={submissionsHook} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
