// next-app/components/ExpenseItemsForm.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Plus, Trash2, Calculator } from "lucide-react";

interface ExpenseItem {
  id?: string;
  expenseId?: string;
  vendorId?: string;
  category: string;
  subcategory?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  baseCost?: number;
  markup: number;
  marginAmount?: number;
  finalPrice?: number;
  vendorItemCode?: string;
  vendorInvoice?: string;
  notes?: string;
}

interface Vendor {
  id: string;
  name: string;
  code?: string;
  type: string;
  category: string;
}

interface ExpenseItemsFormProps {
  expenseId?: string;
  initialItems?: ExpenseItem[];
  vendors: Vendor[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: ExpenseItem[]) => void;
}

const ExpenseItemsForm: React.FC<ExpenseItemsFormProps> = ({
  expenseId,
  initialItems = [],
  vendors,
  isOpen,
  onClose,
  onSave,
}) => {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const expenseCategories = [
    { value: "travel", label: "ค่าเดินทาง" },
    { value: "supplies", label: "วัสดุสิ้นเปลือง" },
    { value: "equipment", label: "อุปกรณ์" },
    { value: "training", label: "การอบรม" },
    { value: "other", label: "อื่นๆ" },
    { value: "hardware_vendor", label: "อุปกรณ์คอมพิวเตอร์ (Vendor)" },
    { value: "software_vendor", label: "ซอฟต์แวร์ (Vendor)" },
    { value: "custom_software_vendor", label: "ซอฟต์แวร์ตามสั่ง (Vendor)" },
    { value: "material_vendor", label: "วัสดุอุปกรณ์ (Vendor)" },
    { value: "service_vendor", label: "บริการ (Vendor)" },
    { value: "consulting_vendor", label: "ที่ปรึกษา (Vendor)" },
    { value: "maintenance_vendor", label: "บำรุงรักษา (Vendor)" },
    { value: "license_vendor", label: "ลิขสิทธิ์ (Vendor)" },
  ];

  const subcategories = {
    hardware_vendor: [
      "laptops",
      "desktops",
      "servers",
      "networking",
      "storage",
      "peripherals",
    ],
    software_vendor: [
      "operating_system",
      "office_suite",
      "antivirus",
      "database",
      "development_tools",
    ],
    custom_software_vendor: [
      "web_application",
      "mobile_app",
      "desktop_app",
      "api_integration",
      "custom_system",
    ],
    material_vendor: [
      "office_supplies",
      "furniture",
      "construction_materials",
      "electronics",
      "other_materials",
    ],
    service_vendor: [
      "consulting",
      "training",
      "support",
      "installation",
      "maintenance_service",
    ],
    consulting_vendor: [
      "business_consulting",
      "it_consulting",
      "legal_consulting",
      "financial_consulting",
    ],
    maintenance_vendor: [
      "hardware_maintenance",
      "software_maintenance",
      "facility_maintenance",
    ],
    license_vendor: [
      "software_license",
      "subscription_license",
      "perpetual_license",
    ],
  };

  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  const addItem = () => {
    const newItem: ExpenseItem = {
      category: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      markup: 0,
    };

    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ExpenseItem, value: any) => {
    setItems((prev) => {
      const newItems = [...prev];
      const item = { ...newItems[index] };

      // Handle special cases
      if (field === "quantity" || field === "unitPrice") {
        const numValue = parseFloat(value) || 0;
        item[field] = numValue;
        item.totalPrice = item.quantity * item.unitPrice;

        // Recalculate margin if baseCost is set
        if (item.baseCost) {
          item.marginAmount = item.totalPrice - item.baseCost;
          item.finalPrice = item.baseCost * (1 + item.markup / 100);
        }
      } else if (field === "baseCost") {
        const numValue = parseFloat(value) || 0;
        item[field] = numValue;
        item.marginAmount = item.totalPrice - numValue;
        item.finalPrice = numValue * (1 + item.markup / 100);
      } else if (field === "markup") {
        const numValue = parseFloat(value) || 0;
        item[field] = numValue;
        if (item.baseCost) {
          item.finalPrice = item.baseCost * (1 + numValue / 100);
          item.marginAmount = item.finalPrice - item.baseCost;
        }
      } else {
        item[field] = value;
      }

      newItems[index] = item;
      return newItems;
    });
  };

  const calculateTotals = () => {
    return items.reduce(
      (acc, item) => {
        acc.totalPrice += item.totalPrice;
        acc.totalBaseCost += item.baseCost || 0;
        acc.totalMargin += item.marginAmount || 0;
        acc.totalFinalPrice += item.finalPrice || 0;
        return acc;
      },
      {
        totalPrice: 0,
        totalBaseCost: 0,
        totalMargin: 0,
        totalFinalPrice: 0,
      },
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    items.forEach((item, index) => {
      if (!item.category) {
        newErrors[`item_${index}_category`] = "กรุณาเลือกหมวดหมู่";
      }
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = "กรุณากรอกรายละเอียด";
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = "ราคาต่อหน่วยต้องมากกว่า 0";
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = "จำนวนต้องมากกว่า 0";
      }
    });

    if (items.length === 0) {
      newErrors.general = "กรุณาเพิ่มรายการค่าใช้จ่ายอย่างน้อย 1 รายการ";
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
      const itemsToSave = items.map((item) => ({
        ...item,
        expenseId,
        vendorId: item.vendorId || null,
      }));

      onSave(itemsToSave);
      onClose();
    } catch (error) {
      console.error("Error saving expense items:", error);
      setErrors({ general: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>จัดการรายการค่าใช้จ่าย</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
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

            {/* Items List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">รายการค่าใช้จ่าย</h3>
                <Button type="button" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มรายการ
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-4">ยังไม่มีรายการค่าใช้จ่าย</p>
                  <Button type="button" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มรายการแรก
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Category */}
                        <div>
                          <Label>หมวดหมู่ *</Label>
                          <Select
                            value={item.category}
                            onValueChange={(value) =>
                              updateItem(index, "category", value)
                            }
                          >
                            <SelectTrigger
                              className={
                                errors[`item_${index}_category`]
                                  ? "border-red-500"
                                  : ""
                              }
                            >
                              <SelectValue placeholder="เลือกหมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseCategories.map((category) => (
                                <SelectItem
                                  key={category.value}
                                  value={category.value}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`item_${index}_category`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`item_${index}_category`]}
                            </p>
                          )}
                        </div>

                        {/* Subcategory */}
                        <div>
                          <Label>หมวดหมู่ย่อย</Label>
                          <Select
                            value={item.subcategory || ""}
                            onValueChange={(value) =>
                              updateItem(index, "subcategory", value)
                            }
                            disabled={
                              !item.category ||
                              !subcategories[
                                item.category as keyof typeof subcategories
                              ]
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกหมวดหมู่ย่อย" />
                            </SelectTrigger>
                            <SelectContent>
                              {item.category &&
                                subcategories[
                                  item.category as keyof typeof subcategories
                                ]?.map((sub) => (
                                  <SelectItem key={sub} value={sub}>
                                    {sub
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Vendor */}
                        <div>
                          <Label>Vendor</Label>
                          <Select
                            value={item.vendorId || ""}
                            onValueChange={(value) =>
                              updateItem(index, "vendorId", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือก Vendor" />
                            </SelectTrigger>
                            <SelectContent>
                              {vendors.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.id}>
                                  {vendor.name}{" "}
                                  {vendor.code && `(${vendor.code})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Description */}
                        <div>
                          <Label>รายละเอียด *</Label>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            placeholder="รายละเอียดรายการ"
                            className={
                              errors[`item_${index}_description`]
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {errors[`item_${index}_description`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`item_${index}_description`]}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Quantity */}
                        <div>
                          <Label>จำนวน *</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", e.target.value)
                            }
                            min="1"
                            step="1"
                            className={
                              errors[`item_${index}_quantity`]
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`item_${index}_quantity`]}
                            </p>
                          )}
                        </div>

                        {/* Unit Price */}
                        <div>
                          <Label>ราคาต่อหน่วย *</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(index, "unitPrice", e.target.value)
                            }
                            min="0"
                            step="0.01"
                            className={
                              errors[`item_${index}_unitPrice`]
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {errors[`item_${index}_unitPrice`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`item_${index}_unitPrice`]}
                            </p>
                          )}
                        </div>

                        {/* Total Price */}
                        <div>
                          <Label>ราคารวม</Label>
                          <Input
                            type="number"
                            value={item.totalPrice}
                            readOnly
                            className="bg-gray-100"
                          />
                        </div>

                        {/* Base Cost */}
                        <div>
                          <Label>ต้นทุนจริง</Label>
                          <Input
                            type="number"
                            value={item.baseCost || ""}
                            onChange={(e) =>
                              updateItem(index, "baseCost", e.target.value)
                            }
                            min="0"
                            step="0.01"
                            placeholder="ต้นทุนจาก vendor"
                          />
                        </div>

                        {/* Markup */}
                        <div>
                          <Label>Markup (%)</Label>
                          <Input
                            type="number"
                            value={item.markup}
                            onChange={(e) =>
                              updateItem(index, "markup", e.target.value)
                            }
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </div>

                      {/* Additional Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>รหัสสินค้า Vendor</Label>
                          <Input
                            value={item.vendorItemCode || ""}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "vendorItemCode",
                                e.target.value,
                              )
                            }
                            placeholder="SKU/Item Code"
                          />
                        </div>

                        <div>
                          <Label>เลขที่ใบแจ้งหนี้ Vendor</Label>
                          <Input
                            value={item.vendorInvoice || ""}
                            onChange={(e) =>
                              updateItem(index, "vendorInvoice", e.target.value)
                            }
                            placeholder="Invoice Number"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบรายการ
                          </Button>
                        </div>
                      </div>

                      {/* Margin Display */}
                      {item.baseCost && (
                        <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-gray-50 rounded">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">ต้นทุน</div>
                            <div className="font-semibold">
                              ฿{item.baseCost?.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Margin</div>
                            <div className="font-semibold text-green-600">
                              ฿{item.marginAmount?.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">ราคาขาย</div>
                            <div className="font-semibold">
                              ฿{item.finalPrice?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <Label>หมายเหตุ</Label>
                        <Textarea
                          value={item.notes || ""}
                          onChange={(e) =>
                            updateItem(index, "notes", e.target.value)
                          }
                          placeholder="หมายเหตุเพิ่มเติม..."
                          rows={2}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">สรุปราคา</h3>
                  <Badge variant="outline">
                    <Calculator className="w-4 h-4 mr-2" />
                    {items.length} รายการ
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">ราคารวม</div>
                    <div className="font-semibold">
                      ฿{totals.totalPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">ต้นทุนรวม</div>
                    <div className="font-semibold">
                      ฿{totals.totalBaseCost.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Margin รวม</div>
                    <div className="font-semibold text-green-600">
                      ฿{totals.totalMargin.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">ราคาขายรวม</div>
                    <div className="font-semibold">
                      ฿{totals.totalFinalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                {totals.totalBaseCost > 0 && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-500">อัตรากำไรเฉลี่ย</div>
                    <div className="font-semibold text-lg">
                      {(
                        (totals.totalMargin / totals.totalBaseCost) *
                        100
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading || items.length === 0}>
                {loading ? "กำลังบันทึก..." : "บันทึกรายการ"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseItemsForm;
