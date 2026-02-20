'use client';

import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { timesheetService } from '@/app/lib/timesheet-service';
import { useParams } from 'next/navigation';

export default function ProjectCostSheetPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [costData, setCostData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Mock data fetching for now
        // In real impl, we would fetch timesheets for this project and aggregate costs
        // We also need user rates (which might be in a separate table or users table)
        
        // Simulating data aggregation
        const mockCostData = {
          labor: [
            { role: 'Project Manager', hours: 40, rate: 1000, cost: 40000 },
            { role: 'Developer', hours: 120, rate: 600, cost: 72000 },
            { role: 'Designer', hours: 30, rate: 800, cost: 24000 },
          ],
          expenses: [
            { category: 'Travel', amount: 5000 },
            { category: 'Equipment', amount: 12000 },
            { category: 'Meals', amount: 2000 },
          ],
          totalLabor: 136000,
          totalExpenses: 19000,
          grandTotal: 155000,
          budget: 200000,
        };

        setCostData(mockCostData);
      } catch (error) {
        console.error('Failed to load cost data', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  if (loading) return <div className="p-8">Loading cost sheet...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Cost Sheet" breadcrumbs={[
        { label: 'Projects', href: '/projects' }, 
        { label: 'Details', href: `/projects/${projectId}` },
        { label: 'Cost Sheet' }
      ]} />
      
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Project Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {costData?.grandTotal.toLocaleString()} THB
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Labor + Expenses
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Project Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {costData?.budget.toLocaleString()} THB
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Total allocated budget
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Remaining Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${costData.budget - costData.grandTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {(costData?.budget - costData?.grandTotal).toLocaleString()} THB
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {((costData.grandTotal / costData.budget) * 100).toFixed(1)}% used
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Labor Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Labor Costs (ค่าแรง)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role / Position</TableHead>
                  <TableHead className="text-right">Total Hours</TableHead>
                  <TableHead className="text-right">Avg. Rate (THB/hr)</TableHead>
                  <TableHead className="text-right">Total Cost (THB)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costData?.labor.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{item.role}</TableCell>
                    <TableCell className="text-right">{item.hours.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.rate.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{item.cost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell colSpan={3}>Total Labor Cost</TableCell>
                  <TableCell className="text-right">{costData?.totalLabor.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Project Expenses (ค่าใช้จ่ายโครงการ)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount (THB)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costData?.expenses.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right font-medium">{item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell>Total Expenses</TableCell>
                  <TableCell className="text-right">{costData?.totalExpenses.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
