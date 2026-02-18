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
import { createLazyComponent } from '@/lib/lazy-load';
import { LoadingFallback } from '@/lib/lazy-load';

// Lazy load tab components for better performance
const LazyExecutiveTab = createLazyComponent(() => import('./components/ExecutiveTab'), {
  loadingVariant: 'card',
  loadingClassName: 'min-h-[400px]'
});

const LazyProjectsTab = createLazyComponent(() => import('./components/ProjectsTab'), {
  loadingVariant: 'table',
  loadingClassName: 'min-h-[400px]'
});

const LazyFinancialTab = createLazyComponent(() => import('./components/FinancialTab'), {
  loadingVariant: 'card',
  loadingClassName: 'min-h-[400px]'
});

const LazyResourcesTab = createLazyComponent(() => import('./components/ResourcesTab'), {
  loadingVariant: 'card',
  loadingClassName: 'min-h-[400px]'
});

const LazyInsightsTab = createLazyComponent(() => import('./components/InsightsTab'), {
  loadingVariant: 'chart',
  loadingClassName: 'min-h-[400px]'
});

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
                <LazyExecutiveTab />
            </TabsContent>
            
            <TabsContent value="projects">
                <LazyProjectsTab />
            </TabsContent>

            <TabsContent value="financial">
                <LazyFinancialTab />
            </TabsContent>

            <TabsContent value="resources">
                <LazyResourcesTab />
            </TabsContent>

            <TabsContent value="insights">
                <LazyInsightsTab />
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </PageTransition>
  );
}
