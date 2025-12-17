import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  DollarSign,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TEAM_MEMBERS = [
  { id: '1', name: 'John Doe', role: 'Project Manager' },
  { id: '2', name: 'Jane Smith', role: 'Developer' },
  { id: '3', name: 'Alice Brown', role: 'Designer' },
  { id: '4', name: 'Bob Wilson', role: 'QA Engineer' },
  { id: '5', name: 'Charlie Davis', role: 'Business Analyst' },
  { id: '6', name: 'Sarah Chen', role: 'DevOps Engineer' },
];

const CLIENTS = [
  { id: '1', name: 'TechCorp Solutions' },
  { id: '2', name: 'Global Marketing' },
  { id: '3', name: 'Retail Plus' },
  { id: '4', name: 'Finance First' },
  { id: '5', name: 'Healthcare Hub' },
];

interface ProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormData) => void;
}

export interface ProjectFormData {
  name: string;
  code: string;
  description: string;
  clientId: string;
  projectManagerId: string;
  teamMemberIds: string[];
  startDate: string;
  endDate: string;
  budget: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const ProjectWizard: React.FC<ProjectWizardProps> = ({ open, onOpenChange, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    code: '',
    description: '',
    clientId: '',
    projectManagerId: '',
    teamMemberIds: [],
    startDate: '',
    endDate: '',
    budget: 0,
    priority: 'medium',
  });

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name?.trim()) newErrors.name = 'Project name is required';
      if (!formData.code?.trim()) newErrors.code = 'Project code is required';
      if (formData.code?.length < 3) newErrors.code = 'Code must be at least 3 characters';
      if (!formData.description?.trim()) newErrors.description = 'Description is required';
      if (!formData.priority) newErrors.priority = 'Priority is required';
    }

    if (currentStep === 2) {
      if (!formData.clientId) newErrors.clientId = 'Client is required';
      if (!formData.projectManagerId) newErrors.projectManagerId = 'Project Manager is required';
      if (formData.teamMemberIds.length === 0) newErrors.teamMembers = 'Select at least one team member';
    }

    if (currentStep === 3) {
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (formData.budget < 0) newErrors.budget = 'Budget cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      onSubmit(formData);
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setErrors({});
    setFormData({
      name: '',
      code: '',
      description: '',
      clientId: '',
      projectManagerId: '',
      teamMemberIds: [],
      startDate: '',
      endDate: '',
      budget: 0,
      priority: 'medium',
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const toggleTeamMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMemberIds: prev.teamMemberIds.includes(memberId)
        ? prev.teamMemberIds.filter(id => id !== memberId)
        : [...prev.teamMemberIds, memberId]
    }));
  };

  const progress = (step / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Create New Project - Step {step} of 3</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Progress</span>
            <span className="text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps Indicators */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                  s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-blue-600 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}
              >
                {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {s === 1 ? 'Basic Info' : s === 2 ? 'Team & Client' : 'Timeline & Budget'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mobile App Development"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Code *
                    </label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., PROJ-001"
                      className={errors.code ? 'border-red-500' : ''}
                    />
                    {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority *
                    </label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && <p className="text-xs text-red-600 mt-1">{errors.priority}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Team & Client */}
        {step === 2 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team & Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLIENTS.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.clientId && <p className="text-xs text-red-600 mt-1">{errors.clientId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Manager *
                  </label>
                  <Select value={formData.projectManagerId} onValueChange={(value) => setFormData({ ...formData, projectManagerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PM" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_MEMBERS.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.projectManagerId && <p className="text-xs text-red-600 mt-1">{errors.projectManagerId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members * ({formData.teamMemberIds.length} selected)
                  </label>
                  <div className="space-y-2">
                    {TEAM_MEMBERS.map(member => (
                      <div key={member.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
                        <Checkbox
                          checked={formData.teamMemberIds.includes(member.id)}
                          onCheckedChange={() => toggleTeamMember(member.id)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.teamMembers && <p className="text-xs text-red-600 mt-1">{errors.teamMembers}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Timeline & Budget */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline & Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={errors.startDate ? 'border-red-500' : ''}
                    />
                    {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={errors.endDate ? 'border-red-500' : ''}
                    />
                    {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (THB) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">฿</span>
                    <Input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      className={errors.budget ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.budget && <p className="text-xs text-red-600 mt-1">{errors.budget}</p>}
                </div>

                {/* Summary Card */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project Name:</span>
                        <span className="font-medium">{formData.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {formData.startDate && formData.endDate
                            ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                            : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Team Size:</span>
                        <span className="font-medium">{formData.teamMemberIds.length} members</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>

          {step > 1 && (
            <Button variant="outline" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}

          {step < 3 ? (
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectWizard;
