import React, { useState } from 'react';
import { Search, Filter, X, Calendar, User, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
  type?: 'text' | 'select' | 'date';
  options?: Array<{ label: string; value: string | number }>;
  placeholder?: string;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, any>) => void;
  onClear: () => void;
  placeholder?: string;
  filters?: FilterOption[];
  className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ 
  onSearch, 
  onFilter, 
  placeholder = 'ค้นหา...', 
  className 
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const handleSearch = () => {
    onSearch(query);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilter({});
    setShowFilters(false);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="pl-10 pr-4"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>ตัวกรอง</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', showFilters ? 'rotate-180' : '')} />
        </Button>
      </div>

      {showFilters && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border border-gray-200 rounded-lg p-4 z-50 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ตัวกรองขั้น</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
              <Input
                type="date"
                placeholder="เริ่มวัน"
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ถึงวัน</label>
              <Input
                type="date"
                placeholder="เริ่มวัน"
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
            <select
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full"
            >
              <option value="">ทั้งหมด</option>
              <option value="active">กำลังงาน</option>
              <option value="completed">เสร็จสมบ</option>
              <option value="pending">รอดรอ</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ความความ</label>
            <select
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full"
            >
              <option value="">ทั้งหมด</option>
              <option value="high">สูง</option>
              <option value="medium">กลาง</option>
              <option value="low">ต่ำ</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">โครงการ</label>
            <select
              onChange={(e) => handleFilterChange('project', e.target.value)}
              className="w-full"
            >
              <option value="">ทั้งหมด</option>
              <option value="mobile">Mobile App</option>
              <option value="web">Web App</option>
              <option value="backend">Backend</option>
            </select>
          </div>

          {/* Team Member Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">สมาชิกทีม</label>
            <select
              onChange={(e) => handleFilterChange('teamMember', e.target.value)}
              className="w-full"
            >
              <option value="">ทั้งหมด</option>
              <option value="team1">ทีม A</option>
              <option value="team2">ทีม B</option>
              <option value="team3">ทีม C</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  onSearch, 
  onClear, 
  placeholder = 'ค้นหาขั้นสูง...',
  filters = [],
  className 
}) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const handleSearch = () => {
    onSearch(query, activeFilters);
  };

  const handleClear = () => {
    setQuery('');
    setActiveFilters({});
    setShowAdvanced(false);
    onClear();
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-10 pr-4"
            />
            
            <div className="absolute right-2 top-1/2 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>ค้นหาขั้นสูง</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', showAdvanced ? 'rotate-180' : '')} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                <X className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">ตัวกรองขั้นสูง</h4>
                
                {filters.map((filter, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {filter.label}
                    </label>
                    
                    {filter.type === 'select' ? (
                      <select
                        onChange={(e) => handleFilterChange(filter.value as string, e.target.value)}
                        className="w-full"
                      >
                        {filter.options?.map((option, optIndex) => (
                          <option key={optIndex} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : filter.type === 'date' ? (
                      <Input
                        type="date"
                        onChange={(e) => handleFilterChange(filter.value as string, e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <Input
                        type="text"
                        placeholder={filter.placeholder}
                        onChange={(e) => handleFilterChange(filter.value as string, e.target.value)}
                        className="w-full"
                      />
                    )}
                    
                    {filter.count && (
                      <div className="mt-2">
                        <Badge variant="secondary">
                          {filter.count} รายการ
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  ค้นหา
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  <X className="h-4 w-4 mr-2" />
                  ล้างาน
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  SearchFilter,
  AdvancedSearch
};
