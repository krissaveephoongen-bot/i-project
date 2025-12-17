import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface BudgetBreakdown {
  category: string;
  allocated: number;
  spent: number;
  percentage: number;
}

interface ProjectBudgetAnalysisProps {
  totalBudget: number;
  spent: number;
  breakdown?: BudgetBreakdown[];
}

export function ProjectBudgetAnalysis({
  totalBudget,
  spent,
  breakdown = [],
}: ProjectBudgetAnalysisProps) {
  const remaining = totalBudget - spent;
  const utilizationPercent = (spent / totalBudget) * 100;
  const isOverBudget = spent > totalBudget;
  const budgetHealth =
    utilizationPercent <= 80
      ? 'healthy'
      : utilizationPercent <= 100
        ? 'at-risk'
        : 'over-budget';

  // Default breakdown if not provided
  const defaultBreakdown: BudgetBreakdown[] = [
    {
      category: 'Personnel',
      allocated: totalBudget * 0.5,
      spent: spent * 0.5,
      percentage: (spent * 0.5) / (totalBudget * 0.5),
    },
    {
      category: 'Infrastructure',
      allocated: totalBudget * 0.2,
      spent: spent * 0.2,
      percentage: (spent * 0.2) / (totalBudget * 0.2),
    },
    {
      category: 'Tools & Services',
      allocated: totalBudget * 0.15,
      spent: spent * 0.15,
      percentage: (spent * 0.15) / (totalBudget * 0.15),
    },
    {
      category: 'Other',
      allocated: totalBudget * 0.15,
      spent: spent * 0.15,
      percentage: (spent * 0.15) / (totalBudget * 0.15),
    },
  ];

  const displayBreakdown = breakdown.length > 0 ? breakdown : defaultBreakdown;

  const getBudgetColor = () => {
    switch (budgetHealth) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Budget Analysis</span>
            <Badge className={getBudgetColor()}>
              {budgetHealth === 'healthy'
                ? 'Healthy'
                : budgetHealth === 'at-risk'
                  ? 'At Risk'
                  : 'Over Budget'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Overview */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Total Budget</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Spent</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(spent)}</p>
              </div>
              <div
                className={`rounded-lg p-3 ${remaining >= 0 ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <p className="text-xs text-gray-600 mb-1">
                  {remaining >= 0 ? 'Remaining' : 'Over'}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(Math.abs(remaining))}
                </p>
              </div>
            </div>

            {/* Utilization Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Budget Utilization</span>
                <span className="font-medium">{Math.round(utilizationPercent)}%</span>
              </div>
              <Progress
                value={Math.min(utilizationPercent, 100)}
                className="h-3"
              />
              {isOverBudget && (
                <p className="text-xs text-red-600 flex items-center mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Budget exceeded by {formatCurrency(spent - totalBudget)}
                </p>
              )}
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Budget Breakdown</h4>
            <div className="space-y-3">
              {displayBreakdown.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.category}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.spent)} / {formatCurrency(item.allocated)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(item.percentage * 100, 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">
                    {Math.round(item.percentage * 100)}% allocated used
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Trend */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Budget Trend</p>
              <p className="text-xs text-gray-600 mt-1">
                {budgetHealth === 'healthy'
                  ? 'Budget is under control. Continue monitoring spending.'
                  : budgetHealth === 'at-risk'
                    ? 'Budget utilization is high. Consider cost optimization.'
                    : 'Project has exceeded budget. Immediate action required.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
