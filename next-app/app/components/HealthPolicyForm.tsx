"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function HealthPolicyForm({ projectId }: { projectId: string }) {
  const [form, setForm] = useState<any>({
    spiMin: 1,
    cpiMin: 1,
    overdueWarnDays: 1,
    overdueCriticalDays: 7,
    riskCountWarn: 3,
    riskCountCritical: 5,
    riskSeverityScoreWarn: 2,
    riskSeverityScoreCritical: 4,
  });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/saved-views?pageKey=${encodeURIComponent(`health-policy:${projectId}`)}&userId=*`, { cache: "no-store" });
    const json = await res.json();
    const v = (json?.views || [])[0];
    if (v?.filters) setForm({ ...form, ...v.filters });
  };

  const save = async () => {
    setLoading(true);
    try {
      await fetch("/api/saved-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "*",
          pageKey: `health-policy:${projectId}`,
          name: "policy",
          filters: form,
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle>นโยบายสุขภาพโครงการ</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input value={form.spiMin} onChange={(e) => setForm({ ...form, spiMin: Number(e.target.value) })} placeholder="SPI Min" />
        <Input value={form.cpiMin} onChange={(e) => setForm({ ...form, cpiMin: Number(e.target.value) })} placeholder="CPI Min" />
        <Input value={form.overdueWarnDays} onChange={(e) => setForm({ ...form, overdueWarnDays: Number(e.target.value) })} placeholder="Overdue Warn (days)" />
        <Input value={form.overdueCriticalDays} onChange={(e) => setForm({ ...form, overdueCriticalDays: Number(e.target.value) })} placeholder="Overdue Critical (days)" />
        <Input value={form.riskCountWarn} onChange={(e) => setForm({ ...form, riskCountWarn: Number(e.target.value) })} placeholder="Risk Count Warn" />
        <Input value={form.riskCountCritical} onChange={(e) => setForm({ ...form, riskCountCritical: Number(e.target.value) })} placeholder="Risk Count Critical" />
        <Input value={form.riskSeverityScoreWarn} onChange={(e) => setForm({ ...form, riskSeverityScoreWarn: Number(e.target.value) })} placeholder="Risk Severity Warn" />
        <Input value={form.riskSeverityScoreCritical} onChange={(e) => setForm({ ...form, riskSeverityScoreCritical: Number(e.target.value) })} placeholder="Risk Severity Critical" />
        <div className="col-span-full flex justify-end">
          <Button onClick={save} disabled={loading}>บันทึก</Button>
        </div>
      </CardContent>
    </Card>
  );
}
