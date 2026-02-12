'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/app/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';
import { Plus, Edit, Trash2, Mail, Phone, User as UserIcon, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types
interface Stakeholder {
    id: string;
    name: string;
    role: string;
    organization: string;
    email: string;
    phone: string;
}

export default function HelpPage() {
    const queryClient = useQueryClient();
    const [isStakeholderModalOpen, setIsStakeholderModalOpen] = useState(false);
    const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
    const [stakeholderForm, setStakeholderForm] = useState<Partial<Stakeholder>>({});

    // Fetch Team Contacts (Users)
    const { data: teamContacts = [] } = useQuery({
        queryKey: ['team-contacts'],
        queryFn: async () => {
            const res = await fetch('/api/users?status=active');
            if (!res.ok) return [];
            const json = await res.json();
            const users = json.rows || json || [];
            // Map users to contact format
            return users.map((u: any) => ({
                id: u.id,
                name: u.name,
                role: u.role,
                position: u.position || u.role, // Fallback if position not set
                email: u.email,
                phone: u.phone,
                department: u.department
            }));
        }
    });

    // Fetch Stakeholders
    const { data: stakeholders = [] } = useQuery({
        queryKey: ['stakeholders'],
        queryFn: async () => {
            // Using clients API with type=stakeholder as requested "/stakeholders" usually maps to a filtered client list or a specific table
            // Given the instruction "Stakeholder Contacts ดึงมาจาก /stakeholders", I'll assume we need to implement this endpoint or map it to clients type=stakeholder
            // Let's try to fetch from /api/clients?type=stakeholder first as it's common practice
            // If the user strictly meant a new table, we might need to create it. But for now, let's assume it's a subset of clients/contacts.
            // Wait, the prompt says "Stakeholder Contacts ดึงมาจาก /stakeholders". I should check if this API exists or I should create it.
            // Let's assume I need to create the client-side logic to fetch from /api/stakeholders (which I will implement).
            
            const res = await fetch('/api/stakeholders'); 
            if (res.ok) return res.json();
            return [];
        }
    });

    // Mutations
    const deleteStakeholderMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/stakeholders?id=${id}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stakeholders'] });
            toast.success('Deleted successfully');
        }
    });

    const saveStakeholderMutation = useMutation({
        mutationFn: async (data: Partial<Stakeholder>) => {
            const method = data.id ? 'PUT' : 'POST';
            const res = await fetch('/api/stakeholders', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to save');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stakeholders'] });
            setIsStakeholderModalOpen(false);
            toast.success('Saved successfully');
        },
        onError: () => toast.error('Failed to save')
    });

    // Handlers
    const handleEditStakeholder = (s: Stakeholder) => {
        setEditingStakeholder(s);
        setStakeholderForm(s);
        setIsStakeholderModalOpen(true);
    };

    const handleAddStakeholder = () => {
        setEditingStakeholder(null);
        setStakeholderForm({});
        setIsStakeholderModalOpen(true);
    };

    const handleDeleteStakeholder = (id: string) => {
        if (confirm('Are you sure?')) deleteStakeholderMutation.mutate(id);
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Header title="Help & Support" breadcrumbs={[{ label: 'Help & Support' }]} />
            
            <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
                
                {/* Team Contacts Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                            Team Contacts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Position / Role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teamContacts.map((c: any) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{c.position}</span>
                                                <span className="text-xs text-slate-500 capitalize">{c.role}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{c.department || '-'}</TableCell>
                                        <TableCell>
                                            <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                                                <Mail className="h-3 w-3" /> {c.email}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            {c.phone ? (
                                                <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
                                                    <Phone className="h-3 w-3" /> {c.phone}
                                                </a>
                                            ) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {teamContacts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-slate-500">No team contacts found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Stakeholder Contacts Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            Stakeholder Contacts
                        </CardTitle>
                        <Button onClick={handleAddStakeholder} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4" /> Add Stakeholder
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stakeholders.map((s: any) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell>{s.role}</TableCell>
                                        <TableCell>{s.organization}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-sm">
                                                {s.email && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3 w-3 text-slate-400" /> {s.email}
                                                    </div>
                                                )}
                                                {s.phone && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3 w-3 text-slate-400" /> {s.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditStakeholder(s)}>
                                                    <Edit className="h-4 w-4 text-slate-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStakeholder(s.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {stakeholders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-slate-500">No stakeholders added yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Stakeholder Modal */}
                <Dialog open={isStakeholderModalOpen} onOpenChange={setIsStakeholderModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingStakeholder ? 'Edit Stakeholder' : 'Add New Stakeholder'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input 
                                    value={stakeholderForm.name || ''} 
                                    onChange={e => setStakeholderForm({...stakeholderForm, name: e.target.value})} 
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Input 
                                        value={stakeholderForm.role || ''} 
                                        onChange={e => setStakeholderForm({...stakeholderForm, role: e.target.value})} 
                                        placeholder="e.g. Project Sponsor"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Organization</label>
                                    <Input 
                                        value={stakeholderForm.organization || ''} 
                                        onChange={e => setStakeholderForm({...stakeholderForm, organization: e.target.value})} 
                                        placeholder="Company Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input 
                                    value={stakeholderForm.email || ''} 
                                    onChange={e => setStakeholderForm({...stakeholderForm, email: e.target.value})} 
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input 
                                    value={stakeholderForm.phone || ''} 
                                    onChange={e => setStakeholderForm({...stakeholderForm, phone: e.target.value})} 
                                    placeholder="Phone Number"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsStakeholderModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => saveStakeholderMutation.mutate(stakeholderForm)}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}
