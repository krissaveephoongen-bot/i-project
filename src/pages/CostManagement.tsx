import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown, TrendingUp, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CostItem {
  id: string;
  projectId: string;
  project_name: string;
  category: string;
  budgeted_cost: number;
  actual_cost: number;
  description?: string;
  date: string;
  status: 'on-track' | 'over-budget' | 'under-budget';
  variance?: number;
  variance_percentage?: number;
}

interface NewCostForm {
  projectId: string;
  project_name?: string;
  category: string;
  budgeted_cost: string;
  actual_cost: string;
  description: string;
  date: string;
}

const CATEGORIES = [
  'Labor',
  'Materials',
  'Equipment',
  'Software',
  'Services',
  'Travel',
  'Training',
  'Other'
];

export default function CostManagement() {
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [projects, setProjects] = useState<any[]>([]);

  const [newCost, setNewCost] = useState<NewCostForm>({
    projectId: '',
    category: '',
    budgeted_cost: '',
    actual_cost: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  } as NewCostForm);

  const calculateVariance = (budgeted: number, actual: number) => {
    const variance = actual - budgeted;
    const variancePercentage = (variance / budgeted) * 100;
    let status: 'on-track' | 'over-budget' | 'under-budget' = 'on-track';
    
    if (variance > 0) status = 'over-budget';
    else if (variance < 0) status = 'under-budget';
    
    return { variance, variancePercentage, status };
  };

  const fetchProjects = async () => {
    try {
      // Mock projects - replace with actual API call
      const mockProjects = [
        { id: '1', name: 'Project Alpha' },
        { id: '2', name: 'Project Beta' },
        { id: '3', name: 'Project Gamma' },
      ];
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchCosts = async () => {
    try {
      setIsLoading(true);
      // Mock costs - replace with actual API call
      const mockCosts: CostItem[] = [
        {
          id: '1',
          projectId: '1',
          project_name: 'Project Alpha',
          category: 'Labor',
          budgeted_cost: 5000,
          actual_cost: 5200,
          description: 'Team Development',
          date: '2024-01-15',
          status: 'over-budget',
          variance: 200,
          variance_percentage: 4,
        },
        {
          id: '2',
          projectId: '1',
          project_name: 'Project Alpha',
          category: 'Materials',
          budgeted_cost: 2000,
          actual_cost: 1800,
          description: 'Software Licenses',
          date: '2024-01-20',
          status: 'under-budget',
          variance: -200,
          variance_percentage: -10,
        },
      ];
      setCosts(mockCosts);
    } catch (error) {
      console.error('Error fetching costs:', error);
      toast.error('Failed to load cost data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchCosts();
    }
  }, [projects]);

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const budgeted = parseFloat(newCost.budgeted_cost);
      const actual = parseFloat(newCost.actual_cost);
      
      if (isNaN(budgeted) || isNaN(actual)) {
        toast.error('Please enter valid numbers for budgeted and actual costs');
        return;
      }
      
      const projectName = projects.find((p: any) => p.id === newCost.projectId)?.name || newCost.project_name;
      
      // Calculate variance
      const { variance, variancePercentage, status } = calculateVariance(budgeted, actual);
      
      // Create new cost item
      const newCostItem: CostItem = {
        id: String(costs.length + 1),
        projectId: newCost.projectId,
        project_name: projectName,
        category: newCost.category,
        budgeted_cost: budgeted,
        actual_cost: actual,
        description: newCost.description,
        date: newCost.date,
        status,
        variance,
        variance_percentage: variancePercentage,
      };
      
      // Add the new cost to the list
      setCosts(prev => [...prev, newCostItem]);
      
      // Reset form and close dialog
      const defaultDate = new Date().toISOString().split('T')[0];
      setNewCost({
        projectId: '',
        category: '',
        budgeted_cost: '',
        actual_cost: '',
        description: '',
        date: defaultDate,
      } as NewCostForm);
      
      setIsDialogOpen(false);
      
      toast.success('Cost added successfully');
      
    } catch (error) {
      console.error('Error adding cost:', error);
      toast.error('Failed to add cost. Please try again.');
    }
  };

  const categories = ['all', ...new Set(costs.map((c) => c.category))].filter(Boolean);

  const filteredCosts = selectedCategory === 'all' 
    ? costs 
    : costs.filter((c) => c.category === selectedCategory);

  const totalBudgeted = filteredCosts.reduce((sum, c) => sum + (c.budgeted_cost || 0), 0);
  const totalActual = filteredCosts.reduce((sum, c) => sum + (c.actual_cost || 0), 0);
  const totalVariance = totalActual - totalBudgeted;
  const totalVariancePercentage = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;
  const overBudgetCount = filteredCosts.filter((c) => c.status === 'over-budget').length;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'on-track': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'over-budget': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'under-budget': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[status] || colors['on-track'];
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cost Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <span className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Cost
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Cost</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCost} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select 
                    value={newCost.projectId}
                    onValueChange={(value) => {
                      const project = projects.find((p: any) => p.id === value);
                      setNewCost(prev => ({
                        ...prev,
                        projectId: value,
                        project_name: project?.name || ''
                      }));
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newCost.category}
                    onValueChange={(value) => setNewCost(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgeted">Budgeted Cost</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">฿</span>
                      <Input
                        id="budgeted"
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-8"
                        value={newCost.budgeted_cost}
                        onChange={(e) => setNewCost(prev => ({ ...prev, budgeted_cost: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="actual">Actual Cost</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">฿</span>
                      <Input
                        id="actual"
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-8"
                        value={newCost.actual_cost}
                        onChange={(e) => setNewCost(prev => ({ ...prev, actual_cost: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newCost.date}
                    onChange={(e) => setNewCost(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Enter description"
                    value={newCost.description}
                    onChange={(e) => setNewCost(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                 <Button
                   type="button"
                   onClick={() => setIsDialogOpen(false)}
                 >
                   Cancel
                 </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Cost'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Budgeted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(totalBudgeted)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Actual Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(totalActual)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Variance</p>
                <p className="text-sm font-medium">
                  {formatCurrency(totalVariance)}
                  <span className={`ml-2 ${totalVariance >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {totalVariance >= 0 ? 'Over Budget' : 'Under Budget'}
                    {totalBudgeted > 0 && (
                      <span className="ml-1">
                        ({Math.abs(totalVariancePercentage).toFixed(1)}%)
                      </span>
                    )}
                  </span>
                </p>
              </div>
              {totalVariance > 0 ? (
                <TrendingUp className="h-8 w-8 text-red-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Over Budget Items</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{overBudgetCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Costs Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Date</th>
                  <th className="pb-3 font-medium text-right">Budgeted</th>
                  <th className="pb-3 font-medium text-right">Actual</th>
                  <th className="pb-3 font-medium text-right">Variance</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCosts.map((cost) => (
                  <tr
                    key={cost.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{cost.project_name}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cost.category}</td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-medium">{cost.date}</td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-medium">
                      {formatCurrency(cost.budgeted_cost)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-medium">
                      {formatCurrency(cost.actual_cost)}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${getVarianceColor(cost.variance || 0)}`}>
                       {formatCurrency(cost.variance || 0)} ({(cost.variance_percentage ?? 0).toFixed(1)}%)
                     </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(cost.status)}`}>
                        {cost.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
