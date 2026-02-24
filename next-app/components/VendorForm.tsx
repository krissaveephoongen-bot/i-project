// next-app/components/VendorForm.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Save, X } from 'lucide-react';

interface Vendor {
  id?: string;
  name: string;
  code?: string;
  type: string;
  category: string;
  status: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  bankAccount?: string;
  bankName?: string;
  paymentTerms?: number;
  creditLimit?: number;
  notes?: string;
}

interface VendorFormProps {
  vendor?: Vendor;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendor: Vendor) => void;
}

const VendorForm: React.FC<VendorFormProps> = ({
  vendor,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Vendor>({
    name: '',
    code: '',
    type: '',
    category: '',
    status: 'active',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    taxId: '',
    registrationNumber: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Thailand',
    bankAccount: '',
    bankName: '',
    paymentTerms: '',
    creditLimit: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (vendor && isOpen) {
      setFormData(vendor);
    }
  }, [vendor, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        code: '',
        type: '',
        category: '',
        status: 'active',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        taxId: '',
        registrationNumber: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Thailand',
        bankAccount: '',
        bankName: '',
        paymentTerms: '',
        creditLimit: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ Vendor';
    }

    if (!formData.type) {
      newErrors.type = 'กรุณาเลือกประเภท Vendor';
    }

    if (!formData.category) {
      newErrors.category = 'กรุณาเลือกหมวดหมู่ Vendor';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (formData.phone && !/^[0-9\-\s\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
    }

    if (formData.paymentTerms && (formData.paymentTerms < 0 || formData.paymentTerms > 365)) {
      newErrors.paymentTerms = 'เงื่อนไขการชำระเงินต้องอยู่ระหว่าง 0-365 วัน';
    }

    if (formData.creditLimit && formData.creditLimit < 0) {
      newErrors.creditLimit = 'วงเงินเครดิตต้องมากกว่าหรือเท่ากับ 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = formData.id 
        ? `/api/vendors-management/${formData.id}`
        : '/api/vendors-management';
      
      const method = formData.id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onSave(data.vendor);
        onClose();
      } else {
        setErrors({ general: data.error || 'เกิดข้อผิดพลาด' });
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      setErrors({ general: 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {formData.id ? 'แก้ไข Vendor' : 'เพิ่ม Vendor ใหม่'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ข้อมูลพื้นฐาน</h3>
                
                <div>
                  <Label htmlFor="name">ชื่อ Vendor *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="code">รหัส Vendor</Label>
                  <Input
                    id="code"
                    value={formData.code || ''}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="เช่น V001, V002"
                  />
                </div>

                <div>
                  <Label htmlFor="type">ประเภท *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">หมวดหมู่ *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">สถานะ</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ข้อมูลติดต่อ</h3>
                
                <div>
                  <Label htmlFor="contactPerson">ผู้ติดต่อ</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson || ''}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="ชื่อผู้ติดต่อ"
                  />
                </div>

                <div>
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="เช่น 02-123-4567"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">เว็บไซต์</Label>
                  <Input
                    id="website"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ข้อมูลธุรกิจ</h3>
                
                <div>
                  <Label htmlFor="taxId">เลขประจานภาษี</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId || ''}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    placeholder="เลขประจานภาษี 13 หลัก"
                  />
                </div>

                <div>
                  <Label htmlFor="registrationNumber">เลขทะเบียน</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber || ''}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    placeholder="เลขทะเบียนพาณิชยการ"
                  />
                </div>

                <div>
                  <Label htmlFor="address">ที่อยู่</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="เลขที่ ถนน ซอย แขวง เขต จังหวัด"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">จังหวัด</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="เช่น กรุงเทพมหานคร"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province">จังหวัด</Label>
                    <Input
                      id="province"
                      value={formData.province || ''}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      placeholder="เช่น กรุงเทพมหานคร"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode || ''}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="เช่น 10110"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">ประเทศ</Label>
                    <Input
                      id="country"
                      value={formData.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ข้อมูลการเงิน</h3>
                
                <div>
                  <Label htmlFor="bankAccount">บัญชีบัญชีธนาคาร</Label>
                  <Input
                    id="bankAccount"
                    value={formData.bankAccount || ''}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                    placeholder="เลขบัญชี 10 หลัก"
                  />
                </div>

                <div>
                  <Label htmlFor="bankName">ชื่อธนาคาร</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName || ''}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="เช่น ธนาคารไทย"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentTerms">เงื่อนไขการชำระเงิน (วัน)</Label>
                    <Input
                      id="paymentTerms"
                      type="number"
                      value={formData.paymentTerms || ''}
                      onChange={(e) => handleInputChange('paymentTerms', parseInt(e.target.value) || '')}
                      placeholder="เช่น 30"
                      className={errors.paymentTerms ? 'border-red-500' : ''}
                    />
                    {errors.paymentTerms && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentTerms}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="creditLimit">วงเงินเครดิต (บาท)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      value={formData.creditLimit || ''}
                      onChange={(e) => handleInputChange('creditLimit', parseFloat(e.target.value) || '')}
                      placeholder="เช่น 100000"
                      className={errors.creditLimit ? 'border-red-500' : ''}
                    />
                    {errors.creditLimit && (
                      <p className="text-red-500 text-sm mt-1">{errors.creditLimit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">หมายเหตุ</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับ vendor..."
                rows={4}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorForm;
