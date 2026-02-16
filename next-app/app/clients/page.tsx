
'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/app/components/Header';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { getClients, deleteClient, Client } from '@/app/lib/clients';
import ClientFormModal from './components/ClientFormModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { getClientPageLabels } from '@/lib/services/clients.utils';
import {
    toastDeleteSuccess,
    toastError
} from '@/lib/toast-utils';
import {
    Search,
    Plus,
    MoreHorizontal,
    Building2,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Edit,
    Download
} from 'lucide-react';

import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Card, CardContent } from '@/app/components/ui/card';

export default function ClientsPage() {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
    const { language } = useLanguage();
    const labels = getClientPageLabels(language);

    const queryClient = useQueryClient();

    // Delete Client Mutation
    const deleteClientMutation = useMutation({
        mutationFn: (clientId: string) => deleteClient(clientId),
        onSuccess: () => {
            toastDeleteSuccess('Client');
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setDeleteConfirm(null);
        },
        onError: (error: any) => {
            toastError('delete', error?.message);
        },
    });

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['clients', search],
        queryFn: () => getClients({ q: search })
    });

    const handleOpenModal = (client?: Client) => {
        setEditingClient(client || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (client: Client) => {
        setDeleteConfirm({ id: client.id, name: client.name });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;
        deleteClientMutation.mutate(deleteConfirm.id);
    };

    const exportCsv = () => {
        const header = ['Name', 'Email', 'Phone', 'Tax ID', 'Address'];
        const lines = [header.join(','), ...clients.map(c =>
            [c.name, c.email, c.phone, c.taxId, c.address].map(f => `"${f || ''}"`).join(',')
        )];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'clients.csv'; a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Header title="Client Management" breadcrumbs={[{ label: 'Workspace', href: '/' }, { label: labels.title }]} />

            <div className="container mx-auto px-6 py-8 pt-24 space-y-6">

                {/* Top Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{labels.title}</h1>
                        <p className="text-slate-500 mt-1">{language === 'th' ? 'จัดการองค์กรลูกค้าและรายละเอียดติดต่อ' : 'Manage client organizations and contact details.'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <Button variant="outline" onClick={exportCsv} className="gap-2">
                            <Download className="h-4 w-4" /> {labels.edit === 'Export CSV' ? 'Export CSV' : language === 'th' ? 'ส่งออก CSV' : 'Export CSV'}
                        </Button>
                        <Button onClick={() => handleOpenModal()} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> {labels.addNew}
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder={labels.search}
                                className="pl-9"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Clients Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{labels.name}</TableHead>
                                    <TableHead>{language === 'th' ? 'ข้อมูลติดต่อ' : 'Contact Info'}</TableHead>
                                    <TableHead>{labels.taxId}</TableHead>
                                    <TableHead>{labels.address}</TableHead>
                                    <TableHead className="text-right">{language === 'th' ? 'การกระทำ' : 'Actions'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">{labels.loading}</TableCell>
                                    </TableRow>
                                ) : clients.length > 0 ? (
                                    clients.map((client) => (
                                        <TableRow key={client.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-900 block">{client.name}</span>
                                                        {client.notes && <span className="text-xs text-slate-500 truncate max-w-[200px] block">{client.notes}</span>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {client.email && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Mail className="w-3 h-3" /> {client.email}
                                                        </div>
                                                    )}
                                                    {client.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Phone className="w-3 h-3" /> {client.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-slate-600">
                                                {client.taxId || '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 max-w-[300px] truncate">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                                                    <span className="truncate">{client.address || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>{language === 'th' ? 'การกระทำ' : 'Actions'}</DropdownMenuLabel>
                                                                         <DropdownMenuItem onClick={() => handleOpenModal(client)}>
                                                                            <Edit className="h-4 w-4 mr-2" /> {labels.edit}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-red-600 cursor-pointer"
                                                                            onClick={() => handleDeleteClick(client)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" /> {labels.delete}
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            {labels.noClients}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <ClientFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    client={editingClient}
                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['clients'] })}
                />

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationDialog
                    open={!!deleteConfirm}
                    title={language === 'th' ? 'ยืนยันการลบคลายเอนต์' : 'Confirm Delete Client'}
                    description={language === 'th' ? 'เมื่อลบคลายเอนต์นี้ จะไม่สามารถกู้คืนข้อมูลได้' : 'This action cannot be undone.'}
                    entityName={deleteConfirm?.name}
                    isLoading={deleteClientMutation.isPending}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    isDangerous={true}
                />

            </div>
        </div>
    );
}
