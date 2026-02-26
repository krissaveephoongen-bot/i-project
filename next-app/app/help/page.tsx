"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/app/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/Dialog";

import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  User as UserIcon,
  Building2,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Types
interface Contact {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  management: boolean;
  department?: string;
  role?: string;
}

export default function HelpPage() {
  const queryClient = useQueryClient();
  const [isStakeholderModalOpen, setIsStakeholderModalOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Contact | null>(
    null,
  );
  const [stakeholderForm, setStakeholderForm] = useState<Partial<Contact>>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch comprehensive help data
  const { data: helpData, isLoading } = useQuery({
    queryKey: ["help-data"],
    queryFn: async () => {
      const res = await fetch("/api/help/contacts");
      if (!res.ok) throw new Error("Failed to fetch help data");
      return res.json();
    },
  });

  // Mutations
  const deleteStakeholderMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/stakeholders?id=${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-data"] });
      toast.success("Deleted successfully");
    },
  });

  const saveStakeholderMutation = useMutation({
    mutationFn: async (data: Partial<Contact>) => {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/stakeholders", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-data"] });
      setIsStakeholderModalOpen(false);
      toast.success("Saved successfully");
    },
    onError: () => toast.error("Failed to save"),
  });

  // Handlers
  const handleEditStakeholder = (s: Contact) => {
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
    if (confirm("Are you sure?")) deleteStakeholderMutation.mutate(id);
  };

  const filteredTeam =
    helpData?.team?.filter(
      (c: Contact) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const filteredStakeholders =
    helpData?.stakeholders?.filter(
      (c: Contact) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Help & Support"
        breadcrumbs={[{ label: "Help & Support" }]}
      />

      <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Contacts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-600" />
              Team Contacts ({filteredTeam.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading team contacts...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position / Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeam.map((c: Contact) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{c.position}</span>
                          <span className="text-xs text-slate-500 capitalize">
                            {c.role}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{c.department || "-"}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Mail className="h-3 w-3" /> {c.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
                          >
                            <Phone className="h-3 w-3" /> {c.phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {c.management ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Management
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                            Team Member
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTeam.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-slate-500"
                      >
                        No team contacts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Stakeholder Contacts Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Stakeholder Contacts ({filteredStakeholders.length})
            </CardTitle>
            <Button
              onClick={handleAddStakeholder}
              size="sm"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Add Stakeholder
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading stakeholders...</div>
            ) : (
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
                  {filteredStakeholders.map((s: Contact) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.position}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          {s.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-slate-400" />{" "}
                              {s.email}
                            </div>
                          )}
                          {s.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-slate-400" />{" "}
                              {s.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditStakeholder(s)}
                          >
                            <Edit className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteStakeholder(s.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStakeholders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-slate-500"
                      >
                        No stakeholders added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Stakeholder Modal */}
        <Dialog
          open={isStakeholderModalOpen}
          onOpenChange={setIsStakeholderModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStakeholder
                  ? "Edit Stakeholder"
                  : "Add New Stakeholder"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={stakeholderForm.name || ""}
                  onChange={(e) =>
                    setStakeholderForm({
                      ...stakeholderForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Full Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input
                    value={stakeholderForm.position || ""}
                    onChange={(e) =>
                      setStakeholderForm({
                        ...stakeholderForm,
                        position: e.target.value,
                      })
                    }
                    placeholder="e.g. Project Sponsor"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization</label>
                  <Input
                    value={stakeholderForm.department || ""}
                    onChange={(e) =>
                      setStakeholderForm({
                        ...stakeholderForm,
                        department: e.target.value,
                      })
                    }
                    placeholder="Company Name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={stakeholderForm.email || ""}
                  onChange={(e) =>
                    setStakeholderForm({
                      ...stakeholderForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={stakeholderForm.phone || ""}
                  onChange={(e) =>
                    setStakeholderForm({
                      ...stakeholderForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Phone Number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsStakeholderModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => saveStakeholderMutation.mutate(stakeholderForm)}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
