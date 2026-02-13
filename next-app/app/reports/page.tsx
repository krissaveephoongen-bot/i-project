'use client';

import Header from '@/app/components/Header';
import PageTransition from '@/app/components/PageTransition';
import { 
  Printer, 
  FileText,
  LayoutDashboard,
  Briefcase,
  DollarSign,
  Users,
  PieChart
} from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';

// Tab Components
import ExecutiveTab from './components/ExecutiveTab';
import ProjectsTab from './components/ProjectsTab';
import FinancialTab from './components/FinancialTab';
import ResourcesTab from './components/ResourcesTab';
import InsightsTab from './components/InsightsTab';

export default function ReportsPage() {
  const printPdf = () => {
    window.print();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="Reports Center"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Reports' }
          ]}
        />
        
        <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
          
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports Center</h1>
              <p className="text-slate-500 mt-1">Unified view of project performance, finance, and resources.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={printPdf} className="gap-2 hover:bg-slate-100">
                <Printer className="h-4 w-4" /> Print PDF
              </Button>
            </div>
          </div>

          <Tabs defaultValue="executive" className="space-y-6">
            <TabsList className="bg-slate-100 p-1 rounded-lg flex-wrap h-auto">
                <TabsTrigger value="executive" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <LayoutDashboard className="h-4 w-4" /> Executive
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Briefcase className="h-4 w-4" /> Projects
                </TabsTrigger>
                <TabsTrigger value="financial" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <DollarSign className="h-4 w-4" /> Financial
                </TabsTrigger>
                <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Users className="h-4 w-4" /> Resources
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <PieChart className="h-4 w-4" /> Insights
                </TabsTrigger>
            </TabsList>

            <TabsContent value="executive">
                <ExecutiveTab />
            </TabsContent>
            
            <TabsContent value="projects">
                <ProjectsTab />
            </TabsContent>

            <TabsContent value="financial">
                <FinancialTab />
            </TabsContent>

            <TabsContent value="resources">
                <ResourcesTab />
            </TabsContent>

            <TabsContent value="insights">
                <InsightsTab />
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </PageTransition>
  );
}
