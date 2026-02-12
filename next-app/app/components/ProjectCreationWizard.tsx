'use client';

import { useState, useEffect } from 'react';
import { Project } from '../lib/projects';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { getUsers, User } from '../lib/users';
import { getClients, Client } from '../lib/clients';
import { 
    CheckCircle2, 
    Circle, 
    ChevronRight, 
    ChevronLeft, 
    Plus, 
    Trash2,
    Users,
    Briefcase,
    Calendar,
    Target,
    ListTodo,
    Building2,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProjectCreationWizardProps {
  onSave: (data: any) => Promise<void> | void;
  onCancel: () => void;
}

const STEPS = [
    { id: 1, title: 'Project Info', icon: Briefcase },
    { id: 2, title: 'Stakeholders', icon: Users },
    { id: 3, title: 'Milestones', icon: Target },
    { id: 4, title: 'Tasks & Weights', icon: ListTodo },
    { id: 5, title: 'Review', icon: CheckCircle2 }
];

export default function ProjectCreationWizard({ onSave, onCancel }: ProjectCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Form State
  const [projectInfo, setProjectInfo] = useState<Partial<Project>>({
    name: '',
    code: '',
    description: '',
    status: 'Planning',
    startDate: '',
    endDate: '',
    budget: 0,
    managerId: '',
    clientId: '',
    priority: 'medium',
    category: '',
  });

  const [stakeholders, setStakeholders] = useState<Array<{ name: string; role: string; email: string; phone: string; isKeyPerson: boolean }>>([]);
  const [milestones, setMilestones] = useState<Array<{ name: string; dueDate: string; amount: number; percentage: number; status: string }>>([]);
  const [tasks, setTasks] = useState<Array<{ title: string; weight: number; startDate: string; dueDate: string }>>([]);

  // Fetch Dropdown Data
  useEffect(() => {
    getUsers({ status: 'active' }).then(setManagers).catch(() => setManagers([]));
    refreshClients();
  }, []);

  const refreshClients = () => {
    getClients().then(setClients).catch(() => setClients([]));
  };

  // Helper: New Client Modal (Simplified as a prompt for now, or use a state to toggle a sub-form)
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  const handleCreateClient = async () => {
      if(!newClientName) return;
      try {
          const res = await fetch('/api/clients', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ name: newClientName })
          });
          if(res.ok) {
              const client = await res.json();
              await refreshClients();
              setProjectInfo(prev => ({ ...prev, clientId: client.id }));
              setIsNewClientMode(false);
              setNewClientName('');
              toast.success('Client created');
          }
      } catch (e) {
          toast.error('Failed to create client');
      }
  };

  // Validation
  const validateStep = (step: number) => {
      if (step === 1) {
          if (!projectInfo.name) { toast.error('Project Name is required'); return false; }
          if (!projectInfo.code) { toast.error('Project Code is required'); return false; }
          if (!projectInfo.clientId) { toast.error('Client is required'); return false; }
          if (!projectInfo.managerId) { toast.error('Project Manager is required'); return false; }
          return true;
      }
      if (step === 4) {
          const totalWeight = tasks.reduce((sum, t) => sum + Number(t.weight || 0), 0);
          if (Math.abs(totalWeight - 100) > 0.1) {
              toast.error(`Total weight must be 100% (Current: ${totalWeight}%)`);
              return false;
          }
      }
      return true;
  };

  const handleNext = () => {
      if (validateStep(currentStep)) {
          setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      }
  };

  const handleBack = () => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
      if (!validateStep(currentStep)) return;
      setLoading(true);
      try {
          const payload = {
              ...projectInfo,
              contacts: stakeholders, // Map to API 'contacts'
              milestones: milestones,
              tasks: tasks
          };
          await onSave(payload);
          toast.success('Project initialized successfully');
      } catch (e) {
          console.error(e);
          toast.error('Failed to create project');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Progress Stepper */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />
                {STEPS.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const Icon = step.icon;
                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                ${isActive ? 'border-blue-600 bg-blue-50 text-blue-600' : 
                                  isCompleted ? 'border-green-500 bg-green-50 text-green-600' : 
                                  'border-slate-300 bg-white text-slate-400'}
                            `}>
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Content Area */}
        <div className="p-8 min-h-[400px]">
            {currentStep === 1 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Project Basics</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Name <span className="text-red-500">*</span></label>
                            <Input value={projectInfo.name} onChange={e => setProjectInfo({...projectInfo, name: e.target.value})} placeholder="e.g. ERP Implementation Phase 1" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Code <span className="text-red-500">*</span></label>
                            <Input value={projectInfo.code} onChange={e => setProjectInfo({...projectInfo, code: e.target.value})} placeholder="e.g. PRJ-2024-001" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea 
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            rows={3}
                            value={projectInfo.description} 
                            onChange={e => setProjectInfo({...projectInfo, description: e.target.value})} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Client <span className="text-red-500">*</span></label>
                            {!isNewClientMode ? (
                                <div className="flex gap-2">
                                    <Select value={projectInfo.clientId} onValueChange={val => setProjectInfo({...projectInfo, clientId: val})}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" onClick={() => setIsNewClientMode(true)} title="Add New Client">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Enter New Client Name" />
                                    <Button onClick={handleCreateClient}>Save</Button>
                                    <Button variant="ghost" onClick={() => setIsNewClientMode(false)}>Cancel</Button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Manager <span className="text-red-500">*</span></label>
                            <Select value={projectInfo.managerId} onValueChange={val => setProjectInfo({...projectInfo, managerId: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input type="date" value={projectInfo.startDate} onChange={e => setProjectInfo({...projectInfo, startDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <Input type="date" value={projectInfo.endDate} onChange={e => setProjectInfo({...projectInfo, endDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Budget (THB)</label>
                            <Input type="number" value={projectInfo.budget} onChange={e => setProjectInfo({...projectInfo, budget: Number(e.target.value)})} />
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900">External Stakeholders</h2>
                        <Button onClick={() => setStakeholders([...stakeholders, { name: '', role: '', email: '', phone: '', isKeyPerson: false }])} size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" /> Add Person
                        </Button>
                    </div>
                    
                    {stakeholders.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No stakeholders added yet.</p>
                            <p className="text-xs text-slate-400">Add key contacts from the client side.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stakeholders.map((s, i) => (
                                <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        <Input placeholder="Name" value={s.name} onChange={e => {
                                            const newS = [...stakeholders]; newS[i].name = e.target.value; setStakeholders(newS);
                                        }} />
                                        <Input placeholder="Role / Position" value={s.role} onChange={e => {
                                            const newS = [...stakeholders]; newS[i].role = e.target.value; setStakeholders(newS);
                                        }} />
                                        <Input placeholder="Email" value={s.email} onChange={e => {
                                            const newS = [...stakeholders]; newS[i].email = e.target.value; setStakeholders(newS);
                                        }} />
                                        <Input placeholder="Phone" value={s.phone} onChange={e => {
                                            const newS = [...stakeholders]; newS[i].phone = e.target.value; setStakeholders(newS);
                                        }} />
                                    </div>
                                    <div className="flex flex-col gap-2 items-center pt-1">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                                            setStakeholders(stakeholders.filter((_, idx) => idx !== i));
                                        }}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900">Payment Milestones</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600">
                                Total: {milestones.reduce((sum, m) => sum + m.amount, 0).toLocaleString()} / {projectInfo.budget?.toLocaleString()}
                            </span>
                            <Button onClick={() => setMilestones([...milestones, { name: '', dueDate: '', amount: 0, percentage: 0, status: 'Pending' }])} size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-2" /> Add Milestone
                            </Button>
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-4 py-2 text-left rounded-l-lg">Name</th>
                                <th className="px-4 py-2 text-left">Due Date</th>
                                <th className="px-4 py-2 text-left w-24">%</th>
                                <th className="px-4 py-2 text-left w-32">Amount</th>
                                <th className="px-4 py-2 text-center rounded-r-lg w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {milestones.map((m, i) => (
                                <tr key={i}>
                                    <td className="p-2">
                                        <Input value={m.name} onChange={e => {
                                            const newM = [...milestones]; newM[i].name = e.target.value; setMilestones(newM);
                                        }} />
                                    </td>
                                    <td className="p-2">
                                        <Input type="date" value={m.dueDate} onChange={e => {
                                            const newM = [...milestones]; newM[i].dueDate = e.target.value; setMilestones(newM);
                                        }} />
                                    </td>
                                    <td className="p-2">
                                        <Input type="number" value={m.percentage} onChange={e => {
                                            const pct = Number(e.target.value);
                                            const newM = [...milestones]; 
                                            newM[i].percentage = pct;
                                            newM[i].amount = (pct / 100) * (projectInfo.budget || 0);
                                            setMilestones(newM);
                                        }} />
                                    </td>
                                    <td className="p-2">
                                        <Input type="number" value={m.amount} onChange={e => {
                                            const amt = Number(e.target.value);
                                            const newM = [...milestones];
                                            newM[i].amount = amt;
                                            newM[i].percentage = projectInfo.budget ? (amt / projectInfo.budget) * 100 : 0;
                                            setMilestones(newM);
                                        }} />
                                    </td>
                                    <td className="p-2 text-center">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {currentStep === 4 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Tasks & Weights (S-Curve)</h2>
                            <p className="text-sm text-slate-500">Define high-level tasks to calculate progress.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`text-sm font-medium ${Math.abs(tasks.reduce((s,t)=>s+Number(t.weight),0) - 100) < 0.1 ? 'text-green-600' : 'text-orange-600'}`}>
                                Total Weight: {tasks.reduce((s,t)=>s+Number(t.weight),0).toFixed(1)}%
                            </span>
                            <Button onClick={() => setTasks([...tasks, { title: '', weight: 0, startDate: '', dueDate: '' }])} size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-2" /> Add Task
                            </Button>
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-4 py-2 text-left rounded-l-lg">Task Title</th>
                                <th className="px-4 py-2 text-left w-24">Weight (%)</th>
                                <th className="px-4 py-2 text-left w-32">Start</th>
                                <th className="px-4 py-2 text-left w-32">Due</th>
                                <th className="px-4 py-2 text-center rounded-r-lg w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tasks.map((t, i) => (
                                <tr key={i}>
                                    <td className="p-2">
                                        <Input value={t.title} onChange={e => {
                                            const newT = [...tasks]; newT[i].title = e.target.value; setTasks(newT);
                                        }} placeholder="Task Name" />
                                    </td>
                                    <td className="p-2">
                                        <Input type="number" value={t.weight} onChange={e => {
                                            const newT = [...tasks]; newT[i].weight = Number(e.target.value); setTasks(newT);
                                        }} />
                                    </td>
                                    <td className="p-2">
                                        <Input type="date" value={t.startDate} onChange={e => {
                                            const newT = [...tasks]; newT[i].startDate = e.target.value; setTasks(newT);
                                        }} />
                                    </td>
                                    <td className="p-2">
                                        <Input type="date" value={t.dueDate} onChange={e => {
                                            const newT = [...tasks]; newT[i].dueDate = e.target.value; setTasks(newT);
                                        }} />
                                    </td>
                                    <td className="p-2 text-center">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {currentStep === 5 && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900 text-center">Review Project Details</h2>
                    
                    <div className="bg-slate-50 p-6 rounded-xl space-y-4 border border-slate-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500 block">Project Name</span>
                                <span className="font-medium">{projectInfo.name}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Code</span>
                                <span className="font-medium">{projectInfo.code}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Client</span>
                                <span className="font-medium">{clients.find(c => c.id === projectInfo.clientId)?.name || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Manager</span>
                                <span className="font-medium">{managers.find(m => m.id === projectInfo.managerId)?.name || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Budget</span>
                                <span className="font-medium">฿{projectInfo.budget?.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Duration</span>
                                <span className="font-medium">{projectInfo.startDate} to {projectInfo.endDate}</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                            <h3 className="font-medium mb-2">Summary</h3>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                <li>{stakeholders.length} Stakeholders added</li>
                                <li>{milestones.length} Milestones defined</li>
                                <li>{tasks.length} High-level tasks defined ({tasks.reduce((s,t)=>s+Number(t.weight),0).toFixed(1)}% Weight)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>Once created, you can track progress by updating the actual completion of the tasks defined here. S-Curve will be generated automatically based on task weights.</p>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
            <Button variant="ghost" onClick={currentStep === 1 ? onCancel : handleBack}>
                {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <div className="flex gap-2">
                {currentStep < STEPS.length ? (
                    <Button onClick={handleNext}>
                        Next Step <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? 'Creating...' : 'Initialize Project'}
                    </Button>
                )}
            </div>
        </div>
    </div>
  );
}
