"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { CheckCircle2, AlertTriangle, FileText, Settings, Rocket, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { toast } from "react-hot-toast";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface DeliveryData {
  systemChecklist: ChecklistItem[];
  userAcceptance: ChecklistItem[];
}

const DEFAULT_SYSTEM_CHECKLIST = [
  { id: "sys-1", label: "Server Configuration (Production)", checked: false },
  { id: "sys-2", label: "Database Migration & Seed", checked: false },
  { id: "sys-3", label: "Security Scan & Vulnerability Check", checked: false },
  { id: "sys-4", label: "Performance & Load Testing", checked: false },
  { id: "sys-5", label: "DNS & SSL Configuration", checked: false },
];

const DEFAULT_USER_ACCEPTANCE = [
  { id: "uat-1", label: "UAT Sign-off from Client", checked: false },
  { id: "uat-2", label: "User Training Completed", checked: false },
  { id: "uat-3", label: "User Manual & Documentation Delivered", checked: false },
  { id: "uat-4", label: "Admin Access Handover", checked: false },
];

export default function ProjectDeliveryPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<DeliveryData>({
    systemChecklist: DEFAULT_SYSTEM_CHECKLIST,
    userAcceptance: DEFAULT_USER_ACCEPTANCE,
  });

  // Calculate Readiness
  const allItems = [...data.systemChecklist, ...data.userAcceptance];
  const total = allItems.length;
  const completed = allItems.filter(i => i.checked).length;
  const readiness = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const json = await res.json();
        
        // Parse deliveryStatus from JSON
        if (json.data?.deliveryStatus) {
            // Merge with defaults to ensure structure
            const saved = typeof json.data.deliveryStatus === 'string' 
                ? JSON.parse(json.data.deliveryStatus) 
                : json.data.deliveryStatus;
            
            setData({
                systemChecklist: saved.systemChecklist || DEFAULT_SYSTEM_CHECKLIST,
                userAcceptance: saved.userAcceptance || DEFAULT_USER_ACCEPTANCE,
            });
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load delivery status");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleToggle = (listName: 'systemChecklist' | 'userAcceptance', id: string) => {
    setData(prev => ({
      ...prev,
      [listName]: prev[listName].map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            updatedFields: {
                deliveryStatus: data // Send as JSON object, Prisma/API handles it
            }
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success("Delivery status saved");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="Delivery & Cutover"
          breadcrumbs={[
            { label: "Projects", href: "/projects" },
            { label: "Overview", href: `/projects/${params.id}/overview` },
            { label: "Delivery" },
          ]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-5xl space-y-6">
          
          <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Go-Live Readiness</h2>
              <p className="text-sm text-slate-500">ความพร้อมก่อนขึ้นระบบจริง</p>
            </div>
            <div className="flex items-center gap-6 w-1/2 justify-end">
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Progress</span>
                  <span className={readiness === 100 ? "text-green-600" : "text-slate-600"}>{readiness}%</span>
                </div>
                <Progress value={readiness} className="h-2" />
              </div>
              
              <Button 
                onClick={handleSave} 
                variant="outline"
                disabled={saving || loading}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>

              <Button 
                disabled={readiness < 100} 
                className={`gap-2 ${readiness === 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300'}`}
              >
                <Rocket className="w-4 h-4" /> Go Live
              </Button>
            </div>
          </div>

          {loading ? (
             <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Checklist */}
                <Card className="border-slate-200 shadow-sm h-full">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" /> System Checklist
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                    {data.systemChecklist.map((item) => (
                        <div 
                            key={item.id} 
                            className="p-4 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => handleToggle('systemChecklist', item.id)}
                        >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                            {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm ${item.checked ? "text-slate-500 line-through decoration-slate-300" : "text-slate-700 font-medium"}`}>
                            {item.label}
                        </span>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>

                {/* User Acceptance */}
                <Card className="border-slate-200 shadow-sm h-full">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" /> User Acceptance
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                    {data.userAcceptance.map((item) => (
                        <div 
                            key={item.id} 
                            className="p-4 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => handleToggle('userAcceptance', item.id)}
                        >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                            {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm ${item.checked ? "text-slate-500 line-through decoration-slate-300" : "text-slate-700 font-medium"}`}>
                            {item.label}
                        </span>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>
            </div>
          )}

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">Cutover Plan (Runbook)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center text-slate-500 py-12">
              <p>ส่วนนี้อยู่ในระหว่างการพัฒนา (Coming Soon)</p>
              <Button variant="outline" className="mt-4" disabled>สร้างแผนงาน</Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}
