"use client"

import * as React from "react"
import { CalendarIcon, Filter, Search, X } from "lucide-react"
import { format } from "date-fns"

import { Button } from "./ui/Button";
import { Calendar } from "./ui/calendar"
import { Input } from "./ui/Input"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

interface FilterOption {
  value: string
  label: string
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface PageFilterProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: Array<{
    key: string
    label: string
    value: string
    options: FilterOption[]
    onChange: (value: string) => void
  }>
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  showDateFilter?: boolean
  className?: string
  quickFilters?: Array<{ label: string; value: string; targetKey: string }>
  savedViews?: { enabled: boolean; userId: string; pageKey: string }
}

export function PageFilter({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  dateRange,
  onDateRangeChange,
  showDateFilter = false,
  className,
  quickFilters = [],
  savedViews,
}: PageFilterProps) {
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)
  const [views, setViews] = React.useState<Array<{ id: string; name: string; filters: any }>>([])
  const [selectedView, setSelectedView] = React.useState<string>("")

  React.useEffect(() => {
    const load = async () => {
      if (!savedViews?.enabled) return
      const res = await fetch(`/api/saved-views?pageKey=${encodeURIComponent(savedViews.pageKey)}&userId=${encodeURIComponent(savedViews.userId)}`)
      const json = await res.json()
      setViews(json.views || [])
    }
    load()
  }, [savedViews?.enabled, savedViews?.pageKey, savedViews?.userId])

  const activeFiltersCount = filters.filter(f => f.value && f.value !== "all").length +
    (dateRange?.from || dateRange?.to ? 1 : 0)

  const clearAllFilters = () => {
    filters.forEach(filter => filter.onChange("all"))
    if (onDateRangeChange) {
      onDateRangeChange({ from: undefined, to: undefined })
    }
    if (onSearchChange) {
      onSearchChange("")
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mobile-first responsive header */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        {/* Search input - full width on mobile */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        {/* Action buttons - stack on mobile */}
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

      {/* Quick Filters */}
      {quickFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((qf, idx) => {
            const target = filters.find(f => f.key === qf.targetKey)
            const isActive = target?.value === qf.value
            return (
              <Button
                key={`${qf.targetKey}-${qf.value}-${idx}`}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="h-8"
                onClick={() => target?.onChange(qf.value)}
              >
                {qf.label}
              </Button>
            )
          })}
        </div>
      )}

      {/* Saved Views */}
      {savedViews?.enabled && (
        <div className="flex items-center gap-2">
          <Select value={selectedView} onValueChange={(v) => {
            setSelectedView(v)
            const fv = views.find(x => x.id === v)
            if (!fv) return
            filters.forEach(f => {
              const next = fv.filters?.[f.key]
              if (typeof next === 'string') f.onChange(next)
            })
          }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder={"Saved views"} />
            </SelectTrigger>
            <SelectContent>
              {views.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const payload = {
                userId: savedViews.userId,
                pageKey: savedViews.pageKey,
                name: `View ${new Date().toLocaleString()}`,
                filters: Object.fromEntries(filters.map(f => [f.key, f.value]))
              }
              const res = await fetch('/api/saved-views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
              const json = await res.json()
              if (json.ok) {
                setSelectedView(json.id)
                const reload = await fetch(`/api/saved-views?pageKey=${encodeURIComponent(savedViews.pageKey)}&userId=${encodeURIComponent(savedViews.userId)}`)
                const j = await reload.json()
                setViews(j.views || [])
              }
            }}
          >
            Save current
          </Button>
          {selectedView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await fetch(`/api/saved-views?id=${encodeURIComponent(selectedView)}&userId=${encodeURIComponent(savedViews.userId)}`, { method: 'DELETE' })
                setSelectedView("")
                const reload = await fetch(`/api/saved-views?pageKey=${encodeURIComponent(savedViews.pageKey)}&userId=${encodeURIComponent(savedViews.userId)}`)
                const j = await reload.json()
                setViews(j.views || [])
              }}
            >
              Delete
            </Button>
          )}
        </div>
      )}

      {/* Advanced Filters - Responsive */}
      {isFiltersOpen && (
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label htmlFor={filter.key} className="text-sm font-medium">
                  {filter.label}
                </Label>
                <Select value={filter.value} onValueChange={filter.onChange}>
                  <SelectTrigger id={filter.key} className="w-full">
                    <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {filter.label.toLowerCase()}</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

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
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters
            .filter(f => f.value && f.value !== "all")
            .map((filter) => {
              const option = filter.options.find(opt => opt.value === filter.value)
              return (
                <Badge key={filter.key} variant="secondary" className="gap-1">
                  {filter.label}: {option?.label}
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
