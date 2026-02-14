"use client"

import * as React from "react"
import { CalendarIcon, Filter, Search, X, RefreshCw, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

import { Button } from "./ui/Button"
import { Calendar } from "./ui/calendar"
import { Input } from "./ui/Input"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select"
import { Badge } from "./ui/badge"
import { EmptyState } from "./ui/EmptyState"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { useDynamicFilterOptions } from "@/hooks/useDynamicFilterOptions"

interface FilterOption {
  value: string
  label: string
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface ProfessionalFilterEnhancedProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: Array<{
    key: string
    label: string
    value: string
    type: 'static' | 'dynamic'
    dynamicOptions?: 'projectStatuses' | 'projectCategories' | 'taskStatuses' | 'taskPriorities' | 'expenseCategories' | 'clients' | 'users'
    staticOptions?: FilterOption[]
    onChange: (value: string) => void
  }>
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  showDateFilter?: boolean
  className?: string
  onClearAll?: () => void
  resultCount?: number
  totalItems?: number
  showError?: boolean
  errorMessage?: string
  onRetry?: () => void
}

export function ProfessionalFilterEnhanced({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  dateRange,
  onDateRangeChange,
  showDateFilter = false,
  className,
  onClearAll,
  resultCount,
  totalItems,
  showError = false,
  errorMessage,
  onRetry,
}: ProfessionalFilterEnhancedProps) {
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)
  const debouncedSearchValue = useDebounce(searchValue, 300)
  
  const { 
    data: dynamicOptions, 
    isLoading: optionsLoading, 
    error: optionsError,
    refetch: refetchOptions 
  } = useDynamicFilterOptions()
  
  React.useEffect(() => {
    if (debouncedSearchValue !== searchValue && onSearchChange) {
      onSearchChange(debouncedSearchValue)
    }
  }, [debouncedSearchValue, searchValue, onSearchChange])

  const activeFiltersCount = filters.filter(f => f.value && f.value !== "all").length +
    (dateRange?.from || dateRange?.to ? 1 : 0) +
    (searchValue ? 1 : 0)

  const clearAllFilters = () => {
    filters.forEach(filter => filter.onChange("all"))
    if (onDateRangeChange) {
      onDateRangeChange({ from: undefined, to: undefined })
    }
    if (onSearchChange) {
      onSearchChange("")
    }
    if (onClearAll) {
      onClearAll()
    }
  }

  const getFilterOptions = (filter: typeof filters[0]): FilterOption[] => {
    if (filter.type === 'dynamic' && dynamicOptions && filter.dynamicOptions) {
      return dynamicOptions[filter.dynamicOptions] || []
    }
    return filter.staticOptions || []
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      refetchOptions()
    }
  }

  if (showError || optionsError) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Filter Loading Error
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {errorMessage || optionsError?.message || 'Failed to load filter options'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
        
        {/* Fallback basic filters */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full sm:w-auto justify-center sm:justify-start h-9"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full sm:w-auto justify-center sm:justify-start h-9"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full sm:w-auto justify-center sm:justify-start h-9"
            disabled={optionsLoading}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {resultCount !== undefined && totalItems !== undefined && (
        <div className="text-sm text-muted-foreground">
          {resultCount === 0 ? (
            <span className="text-red-600">ไม่พบข้อมูลที่ตรงตามเงื่อนไข</span>
          ) : (
            <span>แสดง {resultCount} รายการจากทั้งหมด {totalItems} รายการ</span>
          )}
        </div>
      )}

      {isFiltersOpen && (
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          {optionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading filter options...</span>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filters.map((filter) => {
                const options = getFilterOptions(filter)
                return (
                  <div key={filter.key} className="space-y-2">
                    <Label htmlFor={filter.key} className="text-sm font-medium">
                      {filter.label}
                    </Label>
                    <Select 
                      value={filter.value} 
                      onValueChange={filter.onChange}
                      disabled={optionsLoading || options.length === 0}
                    >
                      <SelectTrigger id={filter.key} className="w-full">
                        <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {filter.label.toLowerCase()}</SelectItem>
                        {options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}

              {showDateFilter && onDateRangeChange && (
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="truncate">
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "MMM dd")} -{" "}
                                {format(dateRange.to, "MMM dd")}
                              </>
                            ) : (
                              format(dateRange.from, "MMM dd, yyyy")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={{
                          from: dateRange?.from,
                          to: dateRange?.to,
                        }}
                        onSelect={(range) => {
                          onDateRangeChange({
                            from: range?.from,
                            to: range?.to,
                          })
                        }}
                        numberOfMonths={1}
                        className="sm:hidden"
                      />
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={{
                          from: dateRange?.from,
                          to: dateRange?.to,
                        }}
                        onSelect={(range) => {
                          onDateRangeChange({
                            from: range?.from,
                            to: range?.to,
                          })
                        }}
                        numberOfMonths={2}
                        className="hidden sm:block"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchValue && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchValue}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onSearchChange?.("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters
            .filter(f => f.value && f.value !== "all")
            .map((filter) => {
              const options = getFilterOptions(filter)
              const option = options.find(opt => opt.value === filter.value)
              return (
                <Badge key={filter.key} variant="secondary" className="gap-1">
                  {filter.label}: {option?.label || filter.value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => filter.onChange("all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          {(dateRange?.from || dateRange?.to) && (
            <Badge variant="secondary" className="gap-1">
              Date Range: {dateRange.from ? format(dateRange.from, "MMM dd") : ""} - {dateRange.to ? format(dateRange.to, "MMM dd") : ""}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onDateRangeChange?.({ from: undefined, to: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
