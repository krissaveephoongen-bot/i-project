"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Users,
  Search,
  Download,
  FileText,
} from "lucide-react";
import { getVendorReportAction } from "../actions";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

export default function VendorTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getVendorReportAction();
        setData(res);
      } catch (e: any) {
        setError(e?.message || "Error loading vendor report");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredVendors = (data?.vendors || []).filter((v: any) =>
    search
      ? v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.type.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const exportCsv = () => {
    const cols = ["name", "type", "category", "paid", "pending", "total", "rating"];
    const header = cols.join(",");
    const rows = filteredVendors
      .map((v: any) => cols.map((c) => String(v[c] ?? "")).join(","))
      .join("\n");
    const csv = header + "\n" + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendor-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded-md bg-red-50">
        Error: {error}
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Vendors
            </CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data?.summary?.totalVendors ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Paid
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{(data?.summary?.totalPaid || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Payments
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ฿{(data?.summary?.totalPending || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Commitment
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ฿{(data?.summary?.totalCommitment || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
            <FileText className="h-5 w-5 text-slate-600" />
            Vendor Performance & Spend
          </h2>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search vendors..."
                className="pl-9 w-[200px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={exportCsv}
              className="gap-2 hover:bg-slate-100"
            >
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Total Paid</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Pending</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Total Spend</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((v: any) => (
                    <TableRow key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{v.name}</TableCell>
                      <TableCell>{v.type}</TableCell>
                      <TableCell>{v.category}</TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        ฿{v.paid.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-orange-600">
                        ฿{v.pending.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ฿{v.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={v.rating === 'excellent' ? 'default' : 'secondary'}>
                          {v.rating || 'N/A'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No vendors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
