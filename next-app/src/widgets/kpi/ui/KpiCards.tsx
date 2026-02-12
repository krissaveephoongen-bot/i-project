'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, AlertTriangle, Users } from 'lucide-react';

interface KpiData {
  totalValue: number;
  billingForecast: number;
  activeIssues: number;
  avgSpi: number;
}

export function KpiCards() {
  const [kpiData, setKpiData] = useState<KpiData>({
    totalValue: 0,
    billingForecast: 0,
    activeIssues: 0,
    avgSpi: 1,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard/kpi', { cache: 'no-store' });
        const kpi = await res.json();
        setKpiData({
          totalValue: Number(kpi.totalValue || 0),
          billingForecast: Number(kpi.billingForecast || 0),
          activeIssues: Number(kpi.activeIssues || 0),
          avgSpi: Number(kpi.avgSpi || 1),
        });
      } catch {
        setKpiData({
          totalValue: 0,
          billingForecast: 0,
          activeIssues: 0,
          avgSpi: 1,
        });
      }
    };
    load();
  }, []);

  const kpiCards = [
    {
      title: 'Total Portfolio Value',
      value: `฿${(kpiData.totalValue / 1_000_000).toFixed(1)}M`,
      change: undefined,
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Avg. SPI',
      value: kpiData.avgSpi.toFixed(2),
      change: undefined,
      changeType: 'positive' as const,
      icon: TrendingDown,
      color: 'text-blue-600',
    },
    {
      title: 'Active Issues',
      value: String(kpiData.activeIssues),
      change: undefined,
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      title: 'Billing Forecast (This Month)',
      value: `฿${(kpiData.billingForecast / 1_000_000).toFixed(1)}M`,
      change: undefined,
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((card) => (
        <div key={card.title} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              {card.change && (
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">from last month</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full bg-gray-50 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
