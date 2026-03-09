"use client";

import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { Package, Truck, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

export default function ProjectProcurementPage({ params }: { params: { id: string } }) {
  const orders = [
    { id: "PO-001", vendor: "Cisco Systems", items: "Network Switches (x5)", status: "Delivered", eta: "2024-10-15", amount: 250000 },
    { id: "PO-002", vendor: "Dell", items: "Rack Servers (x2)", status: "In Transit", eta: "2024-11-01", amount: 480000 },
    { id: "PO-003", vendor: "Microsoft", items: "SQL Server Licenses", status: "Processing", eta: "2024-10-20", amount: 120000 },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="Vendor & Supply Chain Tracking"
          breadcrumbs={[
            { label: "Projects", href: "/projects" },
            { label: "Overview", href: `/projects/${params.id}/overview` },
            { label: "Procurement" },
          ]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-5xl space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Orders</p>
                  <h3 className="text-2xl font-bold text-slate-900">12</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">In Transit</p>
                  <h3 className="text-2xl font-bold text-slate-900">3</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-full">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Received</p>
                  <h3 className="text-2xl font-bold text-slate-900">8</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Purchase Orders (PO) & Status</h2>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Create PO
            </Button>
          </div>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">PO No.</th>
                    <th className="px-6 py-3">Vendor</th>
                    <th className="px-6 py-3">Items / Description</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3">ETA</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                      <td className="px-6 py-4 text-slate-600">{order.vendor}</td>
                      <td className="px-6 py-4 text-slate-600">{order.items}</td>
                      <td className="px-6 py-4 text-right font-medium">
                        {order.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{order.eta}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="outline" 
                          className={
                            order.status === "Delivered" ? "bg-green-50 text-green-700 border-green-200" :
                            order.status === "In Transit" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          Track
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Prototype / Assembly Tracking */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">Production & Assembly Tracking</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">Prototype Assembly (Phase 1)</p>
                    <p className="text-sm text-slate-500">Vendor: ABC Manufacturing</p>
                  </div>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2" />
                  <div className="relative flex justify-between">
                    {[
                      { label: "Design", status: "completed" },
                      { label: "Material Sourcing", status: "completed" },
                      { label: "Assembly", status: "current" },
                      { label: "QC Test", status: "pending" },
                      { label: "Delivery", status: "pending" },
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 bg-white px-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          step.status === "completed" ? "bg-green-500 border-green-500" :
                          step.status === "current" ? "bg-white border-blue-500 ring-2 ring-blue-100" :
                          "bg-white border-slate-300"
                        }`} />
                        <span className={`text-xs ${
                          step.status === "current" ? "font-bold text-blue-600" : 
                          step.status === "completed" ? "text-green-600" : "text-slate-400"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}
