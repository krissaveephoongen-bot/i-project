"use client"

import { useState, useMemo, useEffect } from 'react'
import { ProfessionalFilter } from '@/components/ProfessionalFilter'
import { ProfessionalFilterEnhanced } from '@/components/ProfessionalFilterEnhanced'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertTriangle, RefreshCw, Bug, CheckCircle } from 'lucide-react'
import { useProjects } from '@/hooks/use-projects'

export default function FilterTestPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [managerFilter, setManagerFilter] = useState('all')

    // Fetch real data from API
    const { projects, loading: dataLoading, error: dataError, refreshProjects } = useProjects()

    // Test states
    const [useEnhanced, setUseEnhanced] = useState(false)
    const [showError, setShowError] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Get unique manager names from projects
    const managerOptions = useMemo(() => {
        const managers = new Set<string>()
        projects.forEach(project => {
            if (project.manager?.name) {
                managers.add(project.manager.name)
            }
        })
        return Array.from(managers).sort()
    }, [projects])

    // Transform projects to displayable format with manager info
    const projectsWithDisplay = useMemo(() => {
      return projects.map(project => ({
        ...project,
        displayName: project.name,
        displayStatus: project.status || 'planning',
        displayPriority: 'medium' as const, // Projects don't have priority, default to medium
        displayManager: project.manager?.name || 'Unassigned',
      }))
    }, [projects])

    // Filter logic
    const filteredData = useMemo(() => {
        if (showError) return [] // Simulate error state
        if (isLoading) return projectsWithDisplay // Show all data during loading

        return projectsWithDisplay.filter(item => {
            const matchesSearch = !searchTerm ||
                item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.displayManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

            const matchesStatus = statusFilter === 'all' || item.displayStatus === statusFilter
            const matchesPriority = priorityFilter === 'all' || item.displayPriority === priorityFilter
            const matchesManager = managerFilter === 'all' || item.displayManager === managerFilter

            return matchesSearch && matchesStatus && matchesPriority && matchesManager
        })
    }, [projectsWithDisplay, searchTerm, statusFilter, priorityFilter, managerFilter, showError, isLoading])

    // Filter configuration
    const filters = [
        {
            key: 'status',
            label: 'สถานะ',
            value: statusFilter,
            type: 'static' as const,
            staticOptions: [
                { value: 'planning', label: 'วางแผน' },
                { value: 'active', label: 'ดำเนินการ' },
                { value: 'completed', label: 'เสร็จสิ้น' },
                { value: 'archived', label: 'เก็บถาวร' },
            ],
            onChange: setStatusFilter,
        },
        {
            key: 'priority',
            label: 'ความสำคัญ',
            value: priorityFilter,
            type: 'static' as const,
            staticOptions: [
                { value: 'high', label: 'สูง' },
                { value: 'medium', label: 'ปานกลาง' },
                { value: 'low', label: 'ต่ำ' },
            ],
            onChange: setPriorityFilter,
        },
        {
            key: 'manager',
            label: 'ผู้จัดการ',
            value: managerFilter,
            type: 'static' as const,
            staticOptions: managerOptions.map(manager => ({
                value: manager,
                label: manager,
            })),
            onChange: setManagerFilter,
        },
    ]

    const clearAllFilters = () => {
        setSearchTerm('')
        setStatusFilter('all')
        setPriorityFilter('all')
        setManagerFilter('all')
    }

    // Use useEffect with proper cleanup for timeouts
    useEffect(() => {
        if (!showError) return
        const timeout = setTimeout(() => setShowError(false), 3000)
        return () => clearTimeout(timeout)
    }, [showError])

    useEffect(() => {
        if (!isLoading) return
        const timeout = setTimeout(() => setIsLoading(false), 2000)
        return () => clearTimeout(timeout)
    }, [isLoading])

    const simulateError = () => {
        setShowError(true)
    }

    const simulateLoading = () => {
        setIsLoading(true)
    }

    const FilterComponent = useEnhanced ? ProfessionalFilterEnhanced : ProfessionalFilter

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Filter System Test Suite</h1>
                <p className="text-muted-foreground">
                    Comprehensive testing of the professional filter system with error handling and edge cases
                </p>
            </div>

            {/* Test Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bug className="w-5 h-5" />
                        Test Controls
                    </CardTitle>
                    <CardDescription>
                        Use these controls to test different scenarios and edge cases
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="enhanced"
                                checked={useEnhanced}
                                onCheckedChange={setUseEnhanced}
                            />
                            <Label htmlFor="enhanced">Use Enhanced Filter</Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                variant="outline"
                                onClick={simulateError}
                                className="w-full"
                            >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Simulate Error
                            </Button>

                            <Button
                                variant="outline"
                                onClick={simulateLoading}
                                className="w-full"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Simulate Loading
                            </Button>

                            <Button
                                variant="outline"
                                onClick={refreshProjects}
                                disabled={dataLoading}
                                className="w-full"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
                                {dataLoading ? 'Loading Data...' : 'Reload Real Data'}
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Current State:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>Component: {useEnhanced ? 'Enhanced' : 'Standard'}</div>
                            <div>Data: {dataLoading ? 'Loading...' : dataError ? 'Error' : 'Loaded'}</div>
                            <div>Simulated Error: {showError ? 'Yes' : 'No'}</div>
                            <div>Results: {filteredData.length}/{projects.length}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filter Component */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {useEnhanced ? 'Enhanced' : 'Standard'} Filter Component
                    </CardTitle>
                    <CardDescription>
                        Testing the filter component with current configuration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FilterComponent
                        searchPlaceholder="ค้นหาชื่อโครงการ, ผู้จัดการ..."
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        filters={filters}
                        resultCount={filteredData.length}
                        totalItems={projects.length}
                        onClearAll={clearAllFilters}
                        showError={showError}
                        errorMessage="This is a simulated error for testing purposes"
                        onRetry={() => setShowError(false)}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>
                        {dataLoading
                            ? 'Loading projects from database...'
                            : dataError
                                ? 'Error loading data from database'
                                : filteredData.length === 0
                                    ? (showError ? 'Error state simulated' : 'No results match current filters')
                                    : `Showing ${filteredData.length} of ${projects.length} projects`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {dataLoading ? (
                        <div className="text-center py-8">
                            <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Loading Database</h3>
                            <p className="text-muted-foreground">Fetching projects from API...</p>
                        </div>
                    ) : dataError ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-red-800 mb-2">Database Error</h3>
                            <p className="text-red-600">{dataError}</p>
                            <Button
                                onClick={refreshProjects}
                                className="mt-4"
                                variant="outline"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    ) : filteredData.length === 0 && !showError ? (
                        <EmptyState
                            type="no-results"
                            title="ไม่พบข้อมูลที่ตรงตามเงื่อนไข"
                            description="ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูลใหม่"
                            action={{
                                label: 'ล้างตัวกรอง',
                                onClick: clearAllFilters
                            }}
                        />
                    ) : showError ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-red-800 mb-2">Error State</h3>
                            <p className="text-red-600">This is a simulated error for testing purposes</p>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-8">
                            <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Loading State</h3>
                            <p className="text-muted-foreground">Simulating data loading...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredData.map((item) => (
                                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <h3 className="font-semibold text-lg">{item.displayName}</h3>
                                            {item.description && (
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                              <Badge variant={item.displayStatus === 'active' ? 'default' : 'secondary'}>
                                                {item.displayStatus}
                                              </Badge>
                                              {item.budget !== null && item.budget > 0 && (
                                                <Badge variant="outline">
                                                  Budget: ${item.budget.toLocaleString()}
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              <p>Manager: {item.displayManager}</p>
                                              {item.start_date && (
                                                <p>Start: {new Date(item.start_date).toLocaleDateString('th-TH')}</p>
                                              )}
                                              {item.end_date && (
                                                <p>End: {new Date(item.end_date).toLocaleDateString('th-TH')}</p>
                                              )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Test Cases */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Cases</CardTitle>
                    <CardDescription>
                        Manual test cases to verify filter functionality
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">✅ Basic Functionality</h4>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• Search works with debouncing</li>
                                    <li>• Dropdown filters update correctly</li>
                                    <li>• Clear all filters works</li>
                                    <li>• Result count updates</li>
                                </ul>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">✅ Edge Cases</h4>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• Empty search results</li>
                                    <li>• Error state handling</li>
                                    <li>• Loading state display</li>
                                    <li>• Multiple filter combinations</li>
                                </ul>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">✅ UI/UX</h4>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• Responsive design</li>
                                    <li>• Active filter badges</li>
                                    <li>• Smooth transitions</li>
                                    <li>• Proper loading states</li>
                                </ul>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">✅ Performance</h4>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• 300ms search debounce</li>
                                    <li>• Cached filter options</li>
                                    <li>• Minimal re-renders</li>
                                    <li>• Efficient filtering</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
