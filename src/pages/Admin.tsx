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
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const Admin = () => {
  const { config, updateConfig, resetConfig } = useConfig();
  const { signOut } = useAuth();
  const submissionsHook = useSubmissions();
  const { banned, addBan, removeBan } = useBanned();

  return (
    <div className="min-h-screen bg-background p-3 pb-8 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-foreground md:text-2xl">Painel Administrativo</h1>
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
              <TabsTrigger value="raffle" className="text-xs md:text-sm px-3">Sorteio</TabsTrigger>
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
          <TabsContent value="banned">
            <AdminBanned banned={banned} onAdd={addBan} onRemove={removeBan} />
          </TabsContent>
          <TabsContent value="email">
            <AdminEmail config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="access">
            <AdminAccessPassword config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="postback">
            <AdminPostback config={config} onUpdate={updateConfig} />
          </TabsContent>
          <TabsContent value="tips-toggle">
            <AdminTipsToggle config={config} onUpdate={updateConfig} />
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
