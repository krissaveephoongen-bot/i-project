"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { Button } from "@/app/components/ui/button";
import { FileText, Save, Download, AlertTriangle, ShieldCheck, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "react-hot-toast";

// Types
interface ContractData {
  contractNo: string;
  contractStartDate: string;
  contractEndDate: string;
  contractValue: number;
  penaltyDailyRate: number;
  maxPenaltyPercent: number;
  warrantyMonths: number;
  warrantyTerms: string;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  percentage: number;
}

export default function ContractPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractData>({
    contractNo: "",
    contractStartDate: "",
    contractEndDate: "",
    contractValue: 0,
    penaltyDailyRate: 0,
    maxPenaltyPercent: 10,
    warrantyMonths: 12,
    warrantyTerms: "",
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Contract
        const resContract = await fetch(`/api/projects/${params.id}/contract`);
        const dataContract = await resContract.json();
        
        if (dataContract && !dataContract.error) {
          setContract({
            contractNo: dataContract.contractNo || "",
            contractStartDate: dataContract.contractStartDate ? dataContract.contractStartDate.split('T')[0] : "",
            contractEndDate: dataContract.contractEndDate ? dataContract.contractEndDate.split('T')[0] : "",
            contractValue: Number(dataContract.contractValue) || 0,
            penaltyDailyRate: Number(dataContract.penaltyDailyRate) || 0,
            maxPenaltyPercent: Number(dataContract.maxPenaltyPercent) || 10,
            warrantyMonths: Number(dataContract.warrantyMonths) || 12,
            warrantyTerms: dataContract.warrantyTerms || "",
          });
        }

        // Fetch Milestones for Risk Calc
        const resMilestones = await fetch(`/api/projects/milestones?projectId=${params.id}`);
        const dataMilestones = await resMilestones.json();
        if (Array.isArray(dataMilestones)) {
            setMilestones(dataMilestones.map((m: any) => ({
                id: m.id,
                title: m.title,
                dueDate: m.due_date,
                status: m.status,
                percentage: Number(m.percentage)
            })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load contract data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}/contract`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contract),
      });
      if (res.ok) {
        toast.success("Contract updated successfully");
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to update contract");
    }
  };

  const handleChange = (field: keyof ContractData, value: any) => {
    setContract(prev => ({ ...prev, [field]: value }));
  };

  // Logic: Risk Calculation
  const calculateRisk = () => {
    const today = new Date();
    let totalPenalty = 0;
    const overdueItems: any[] = [];

    // 1. Check Overdue Milestones
    for (const m of milestones) {
        if (m.dueDate && m.status !== 'Paid' && m.status !== 'Approved' && m.status !== 'Completed') {
            const due = new Date(m.dueDate);
            // Reset time to compare dates only
            due.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            
            if (due < today) {
                const diffTime = Math.abs(today.getTime() - due.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                const penalty = diffDays * (contract.penaltyDailyRate || 0);
                totalPenalty += penalty;
                overdueItems.push({ ...m, daysLate: diffDays, penalty });
            }
        }
    }

    // 2. Cap at Max Penalty
    const maxPenaltyAmount = (contract.contractValue * (contract.maxPenaltyPercent || 0)) / 100;
    const isCapped = totalPenalty > maxPenaltyAmount && maxPenaltyAmount > 0;
    const finalPenalty = isCapped ? maxPenaltyAmount : totalPenalty;

    return { totalPenalty, finalPenalty, isCapped, overdueItems, maxPenaltyAmount };
  };

  const riskData = calculateRisk();

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="รายละเอียดสัญญา (Contract & TOR)"
          breadcrumbs={[
            { label: "Projects", href: "/projects" },
            { label: "Overview", href: `/projects/${params.id}/overview` },
            { label: "Contract" },
          ]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-5xl space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> บันทึกข้อมูล
            </Button>
          </div>

          {/* Risk Analysis Card - Dynamic Logic */}
          {riskData.overdueItems.length > 0 && (
             <Card className="border-red-200 shadow-sm bg-red-50/30">
                <CardHeader className="pb-2 border-b border-red-100">
                    <CardTitle className="text-base font-semibold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Risk Assessment: Penalty Risk Detected
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <p className="text-sm text-red-600 mb-2">
                                พบงวดงานล่าช้า {riskData.overdueItems.length} รายการ ที่มีความเสี่ยงถูกปรับ
                            </p>
                            <div className="space-y-2">
                                {riskData.overdueItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm p-2 bg-white rounded border border-red-100">
                                        <span>{item.title} (Late {item.daysLate} days)</span>
                                        <span className="font-mono text-red-600">-฿{item.penalty.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-64 bg-white p-4 rounded-lg border border-red-100 flex flex-col justify-center items-center">
                            <span className="text-xs text-slate-500 uppercase font-bold">Estimated Penalty</span>
                            <span className="text-2xl font-bold text-red-600">฿{riskData.finalPenalty.toLocaleString()}</span>
                            {riskData.isCapped && (
                                <span className="text-xs text-amber-600 mt-1">(Capped at Max {contract.maxPenaltyPercent}%)</span>
                            )}
                        </div>
                    </div>
                </CardContent>
             </Card>
          )}

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">ข้อมูลสัญญา (Contract Info)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">เลขที่สัญญา (Contract No.)</label>
                <Input 
                    placeholder="e.g. CON-2024-001" 
                    value={contract.contractNo} 
                    onChange={(e) => handleChange('contractNo', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">มูลค่าสัญญา (บาท)</label>
                <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={contract.contractValue} 
                    onChange={(e) => handleChange('contractValue', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">วันที่เริ่มสัญญา</label>
                <Input 
                    type="date" 
                    value={contract.contractStartDate} 
                    onChange={(e) => handleChange('contractStartDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">วันที่สิ้นสุดสัญญา</label>
                <Input 
                    type="date" 
                    value={contract.contractEndDate} 
                    onChange={(e) => handleChange('contractEndDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  เงื่อนไขการรับประกัน (Warranty Terms)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ระยะเวลารับประกัน (เดือน)</label>
                  <Input 
                    type="number" 
                    placeholder="12" 
                    value={contract.warrantyMonths}
                    onChange={(e) => handleChange('warrantyMonths', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">รายละเอียด/เงื่อนไข (Warranty Terms)</label>
                  <Textarea 
                    placeholder="e.g. Onsite Service 8x5 NBD..." 
                    rows={3}
                    value={contract.warrantyTerms}
                    onChange={(e) => handleChange('warrantyTerms', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-500" />
                  เงื่อนไขค่าปรับ (Penalty Terms)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ค่าปรับล่าช้า (บาท/วัน)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={contract.penaltyDailyRate}
                    onChange={(e) => handleChange('penaltyDailyRate', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-slate-500">Rate per day for delayed milestones</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ค่าปรับสูงสุด (% ของสัญญา)</label>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    value={contract.maxPenaltyPercent}
                    onChange={(e) => handleChange('maxPenaltyPercent', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-slate-500">Maximum penalty cap (usually 10%)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
