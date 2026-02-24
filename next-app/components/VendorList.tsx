// next-app/components/VendorList.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, Filter, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  code?: string;
  type: string;
  category: string;
  status: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  overallRating: string;
  totalProjects: number;
  successfulProjects: number;
  averageDeliveryTime?: number;
  onTimeDeliveryRate?: number;
  createdAt: string;
  updatedAt: string;
}

interface VendorListProps {
  onEdit?: (vendor: Vendor) => void;
  onView?: (vendor: Vendor) => void;
  onDelete?: (vendor: Vendor) => void;
  onCreateNew?: () => void;
}

const VendorList: React.FC<VendorListProps> = ({
  onEdit,
  onView,
  onDelete,
  onCreateNew
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const vendorTypes = [
    { value: 'company', label: 'บริษัท' },
    { value: 'individual', label: 'บุคคลธรรมดา' },
    { value: 'partnership', label: 'ห้างหุ้นส่วน' },
    { value: 'government', label: 'หน่วยงานราชการ' }
  ];

  const vendorCategories = [
    { value: 'hardware', label: 'อุปกรณ์คอมพิวเตอร์' },
    { value: 'software', label: 'ซอฟต์แวร์' },
    { value: 'custom_software', label: 'ซอฟต์แวร์ตามสั่ง' },
    { value: 'materials', label: 'วัสดุอุปกรณ์' },
    { value: 'services', label: 'บริการ' },
    { value: 'consulting', label: 'ที่ปรึกษา' },
    { value: 'maintenance', label: 'บำรุงรักษา' },
    { value: 'licensing', label: 'ลิขสิทธิ์' }
  ];

  const statusOptions = [
    { value: 'active', label: 'ใช้งาน' },
    { value: 'inactive', label: 'ไม่ใช้งาน' },
    { value: 'suspended', label: 'ระงับ' },
    { value: 'blacklisted', label: 'บัญชีดำ' }
  ];

  const ratingColors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    satisfactory: 'bg-yellow-100 text-yellow-800',
    needs_improvement: 'bg-orange-100 text-orange-800',
    poor: 'bg-red-100 text-red-800'
  };

  const ratingLabels = {
    excellent: 'ดีเยี่ยม',
    good: 'ดี',
    satisfactory: 'พอใช้',
    needs_improvement: 'ต้องปรับปรุง',
    poor: 'แย่'
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    blacklisted: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    active: 'ใช้งาน',
    inactive: 'ไม่ใช้งาน',
    suspended: 'ระงับ',
    blacklisted: 'บัญชีดำ'
  };

  useEffect(() => {
    fetchVendors();
  }, [search, filterType, filterCategory, filterStatus, currentPage]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search,
        ...(filterType !== 'all' && { type: filterType }),
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await fetch(`/api/vendors-management?${params}`);
      const data = await response.json();

      if (response.ok) {
        setVendors(data.vendors || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        setError(data?.error || 'ไม่สามารถโหลดรายชื่อ vendor');
      }
    } catch (error) {
      setError(error?.message || 'เกิดข้อผิดพลาดขณะโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    if (!onDelete) return;
    
    if (window.confirm(`คุณต้องการลบ vendor "${vendor.name}" ใช่หรือไม่?`)) {
      onDelete(vendor);
    }
  };

  const getSuccessRate = (vendor: Vendor) => {
    if (vendor.totalProjects === 0) return 0;
    return Math.round((vendor.successfulProjects / vendor.totalProjects) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>จัดการ Vendor</CardTitle>
          {onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม Vendor
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700 flex items-center justify-between">
            <div>{error}</div>
            <Button variant="outline" size="sm" onClick={fetchVendors}>
              ลองอีกครั้ง
            </Button>
          </div>
        )}
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ค้นหา vendor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              กรอง
            </Button>
          </div>
          
          <div className="flex gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="ประเภท Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                {vendorTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                {vendorCategories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ Vendor</TableHead>
                <TableHead>รหัส</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>การจัดอันดับ</TableHead>
                <TableHead>โครงการ</TableHead>
                <TableHead>อัตราสำเร็จ</TableHead>
                <TableHead>ติดต่อ</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="text-gray-500">
                      {search || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                        ? 'ไม่พบ vendor ที่ตรงเงื่อนไข'
                        : 'ยังไม่มี vendor ในระบบ'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{vendor.name}</div>
                        {vendor.contactPerson && (
                          <div className="text-sm text-gray-500">{vendor.contactPerson}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.code || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      {vendorTypes.find(t => t.value === vendor.type)?.label || vendor.type}
                    </TableCell>
                    <TableCell>
                      {vendorCategories.find(c => c.value === vendor.category)?.label || vendor.category}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[vendor.status as keyof typeof statusColors]}>
                        {statusLabels[vendor.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={ratingColors[vendor.overallRating as keyof typeof ratingColors]}>
                        {ratingLabels[vendor.overallRating as keyof typeof ratingLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{vendor.totalProjects} โครงการ</div>
                        <div className="text-gray-500">สำเร็จ {vendor.successfulProjects}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {getSuccessRate(vendor)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {vendor.email && <div>{vendor.email}</div>}
                        {vendor.phone && <div className="text-gray-500">{vendor.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(vendor)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(vendor)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(vendor)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              หน้า {currentPage} จาก {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ก่อนหน้า
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorList;
