"use client";

import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/Button";
import { Printer, Users } from "lucide-react";
import ResourcesTab from "../components/ResourcesTab";

export default function ResourcesReportPage() {
  const printPdf = () => {
    window.print();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="Resources Report"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Reports", href: "/reports" },
            { label: "Resources" },
          ]}
        />

        <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Users className="h-8 w-8" />
                Resources Report
              </h1>
              <p className="text-slate-500 mt-1">
                Team allocation, capacity, and resource utilization.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={printPdf}
              className="gap-2 hover:bg-slate-100"
            >
              <Printer className="h-4 w-4" /> Print PDF
            </Button>
          </div>

          <ResourcesTab />
        </div>
      </div>
    </PageTransition>
  );
}
