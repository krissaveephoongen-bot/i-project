import { useQuery } from "@tanstack/react-query";

export interface FilterOption {
  value: string;
  label: string;
}

export interface DynamicFilterOptions {
  projectStatuses: FilterOption[];
  projectCategories: FilterOption[];
  taskStatuses: FilterOption[];
  taskPriorities: FilterOption[];
  taskCategories: FilterOption[];
  expenseCategories: FilterOption[];
  expenseStatuses: FilterOption[];
  userRoles: FilterOption[];
  clients: FilterOption[];
  users: FilterOption[];
}

async function fetchFilterOptions(): Promise<DynamicFilterOptions> {
  const response = await fetch("/api/filters/options");
  if (!response.ok) {
    throw new Error("Failed to fetch filter options");
  }
  return response.json();
}

export function useDynamicFilterOptions() {
  return useQuery<DynamicFilterOptions>({
    queryKey: ["filter-options"],
    queryFn: fetchFilterOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
  });
}

// Individual hooks for specific filter types
export function useProjectStatuses() {
  const { data } = useDynamicFilterOptions();
  return data?.projectStatuses || [];
}

export function useProjectCategories() {
  const { data } = useDynamicFilterOptions();
  return data?.projectCategories || [];
}

export function useTaskStatuses() {
  const { data } = useDynamicFilterOptions();
  return data?.taskStatuses || [];
}

export function useTaskPriorities() {
  const { data } = useDynamicFilterOptions();
  return data?.taskPriorities || [];
}

export function useTaskCategories() {
  const { data } = useDynamicFilterOptions();
  return data?.taskCategories || [];
}

export function useExpenseCategories() {
  const { data } = useDynamicFilterOptions();
  return data?.expenseCategories || [];
}

export function useExpenseStatuses() {
  const { data } = useDynamicFilterOptions();
  return data?.expenseStatuses || [];
}

export function useClients() {
  const { data } = useDynamicFilterOptions();
  return data?.clients || [];
}

export function useUsers() {
  const { data } = useDynamicFilterOptions();
  return data?.users || [];
}
