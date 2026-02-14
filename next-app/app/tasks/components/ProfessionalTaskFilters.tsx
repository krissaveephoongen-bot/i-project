"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProfessionalFilter } from '@/components/ProfessionalFilter';
import { useDynamicFilterOptions } from '@/hooks/useDynamicFilterOptions';

interface ProfessionalTaskFiltersProps {
  className?: string;
}

export function ProfessionalTaskFilters({ className }: ProfessionalTaskFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { data: dynamicOptions, isLoading } = useDynamicFilterOptions();

  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    replace(`${pathname}?`);
  };

  const filters = React.useMemo(() => [
    {
      key: 'status',
      label: 'สถานะ',
      value: searchParams?.get('status') || 'all',
      type: 'dynamic' as const,
      dynamicOptions: 'taskStatuses' as const,
      onChange: (value: string) => updateUrlParams('status', value),
    },
    {
      key: 'priority',
      label: 'ความสำคัญ',
      value: searchParams?.get('priority') || 'all',
      type: 'dynamic' as const,
      dynamicOptions: 'taskPriorities' as const,
      onChange: (value: string) => updateUrlParams('priority', value),
    },
    {
      key: 'assignedTo',
      label: 'ผู้รับผิดชอบ',
      value: searchParams?.get('assignedTo') || 'all',
      type: 'dynamic' as const,
      dynamicOptions: 'users' as const,
      onChange: (value: string) => updateUrlParams('assignedTo', value),
    },
  ], [searchParams]);

  return (
    <ProfessionalFilter
      searchPlaceholder="ค้นหาชื่องาน, รหัส, หรือคำอธิบาย..."
      searchValue={searchParams?.get('q') || ''}
      onSearchChange={(value) => updateUrlParams('q', value)}
      filters={filters}
      onClearAll={clearAllFilters}
      isLoading={isLoading}
      className={className}
    />
  );
}
