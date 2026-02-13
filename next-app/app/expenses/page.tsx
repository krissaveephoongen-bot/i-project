'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Calendar, DollarSign, FileText, X, Truck } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/Dialog";
import { Textarea } from '@/app/components/ui/textarea';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Expense {
  id: string;
  projectId: string;
  taskId?: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  receiptUrl?: string;
  details?: any;
  status: 'pending' | 'approved' | 'rejected';
  rejectedReason?: string;
  project?: { name: string };
  task?: { title: string };
}

interface Project {
  id: string;
  name: string;
}

const CATEGORIES = ['Travel', 'Meals', 'Lodging', 'Office Supplies', 'Software', 'Hardware', 'Other'];

export default function ExpensesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    receiptUrl: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Expenses
      const expRes = await fetch(`${API_BASE}/api/expenses?userId=${user?.id}`);
      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(data);
      }

      // Fetch Projects
      const projRes = await fetch(`${API_BASE}/api/timesheet/projects?userId=${user?.id}`);
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        projectId: expense.projectId,
        date: expense.date,
        amount: String(expense.amount),
        category: expense.category,
        description: expense.description || '',
        receiptUrl: expense.receiptUrl || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        projectId: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        receiptUrl: ''
      });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/expenses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses(prev => prev.filter(e => e.id !== id));
        toast.success('Expense deleted');
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.date || !formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        user_id: user?.id,
        project_id: formData.projectId,
        date: formData.date,
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description,
        receiptUrl: formData.receiptUrl
      };

      let res;
      if (editingId) {
        res = await fetch(`${API_BASE}/api/expenses`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        });
      } else {
        res = await fetch(`${API_BASE}/api/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        toast.success(editingId ? 'Expense updated' : 'Expense added');
        setModalOpen(false);
        fetchData(); // Refresh list
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title="My Expenses" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Expenses' }]} />
      
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Expense Claims</h1>
                <p className="text-slate-500">Manage and track your project expenses</p>
            </div>
            <div className="flex gap-2">
                <Link href="/expenses/memo">
                    <Button variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" /> Memo Request
                    </Button>
                </Link>
                <Link href="/expenses/travel">
                    <Button variant="outline" className="gap-2">
                        <Truck className="h-4 w-4" /> Travel Claim
                    </Button>
                </Link>
                <Button onClick={() => handleOpenModal()} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> New Claim
                </Button>
            </div>
        </div>

        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-slate-500">
                                    No expenses recorded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{expense.project?.name || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal">{expense.category}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={expense.description}>
                                        {expense.description || '-'}
                                        {expense.rejectedReason && (
                                            <div className="text-xs text-red-500 mt-1">
                                                Reason: {expense.rejectedReason}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ฿{expense.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(expense.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(expense.status === 'pending' || expense.status === 'rejected') && (
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(expense)}>
                                                    <Edit2 className="h-4 w-4 text-slate-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(expense.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Expense Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Expense' : 'New Expense Claim'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for your expense claim.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input 
                                    type="date" 
                                    className="pl-9"
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount (THB)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input 
                                    type="number" 
                                    className="pl-9"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={e => setFormData({...formData, amount: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Project</label>
                        <Select value={formData.projectId} onValueChange={val => setFormData({...formData, projectId: val})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                            placeholder="Describe the expense..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Receipt URL (Optional)</label>
                        <Input 
                            placeholder="https://example.com/receipt.jpg"
                            value={formData.receiptUrl}
                            onChange={e => setFormData({...formData, receiptUrl: e.target.value})}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Claim</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
