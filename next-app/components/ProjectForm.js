import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { AlertCircle } from "lucide-react";
import {
  toastCreateSuccess,
  toastUpdateSuccess,
  toastValidationError,
  toastError,
} from "../lib/toast-utils";

const ProjectForm = ({ project, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    progress: 0,
    budget: 0,
    spent: 0,
    start_date: "",
    end_date: "",
    manager_id: "",
    payment_term: "",
    payment_term_count: 1,
    payment_percentage: 100.0,
    payment_schedule: [],
    project_type: "",
    project_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    // Fetch managers for dropdown
    const fetchManagers = async () => {
      const { data } = await supabase
        .from("users")
        .select("id, name")
        .in("role", ["Manager", "Admin", "manager", "admin"]);
      setManagers(data || []);
    };
    fetchManagers();

    // If editing, populate form with project data
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "Planning",
        progress: project.progress || 0,
        budget: project.budget || 0,
        spent: project.spent || 0,
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        manager_id: project.manager_id || "",
        payment_term: project.payment_term || "",
        payment_term_count: project.payment_term_count || 1,
        payment_percentage: project.payment_percentage || 100.0,
        payment_schedule: project.payment_schedule || [],
        project_type: project.project_type || "",
        project_code: project.project_code || "",
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "progress" || name === "budget" || name === "spent"
          ? Number(value)
          : value,
    }));
  };

  // Payment schedule management functions
  const handlePaymentScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.payment_schedule];
    if (field === "installment" || field === "percentage") {
      newSchedule[index][field] = Number(value);
    } else {
      newSchedule[index][field] = value;
    }
    setFormData((prev) => ({ ...prev, payment_schedule: newSchedule }));
  };

  const addPaymentScheduleItem = () => {
    const newInstallment = formData.payment_schedule.length + 1;
    setFormData((prev) => ({
      ...prev,
      payment_schedule: [
        ...prev.payment_schedule,
        { installment: newInstallment, percentage: 0 },
      ],
    }));
  };

  const removePaymentScheduleItem = (index) => {
    const newSchedule = formData.payment_schedule.filter((_, i) => i !== index);
    // Re-number installments
    const renumberedSchedule = newSchedule.map((item, i) => ({
      ...item,
      installment: i + 1,
    }));
    setFormData((prev) => ({ ...prev, payment_schedule: renumberedSchedule }));
  };

  const generateEqualSchedule = () => {
    const count = formData.payment_term_count || 1;
    const equalPercentage = (formData.payment_percentage || 100) / count;
    const newSchedule = Array.from({ length: count }, (_, i) => ({
      installment: i + 1,
      percentage: parseFloat(equalPercentage.toFixed(2)),
    }));
    setFormData((prev) => ({ ...prev, payment_schedule: newSchedule }));
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Budget validation
    if (formData.budget < 0) {
      newErrors.budget = "งบประมาณต้องมากกว่าหรือเท่ากับ 0";
    }

    // Spent validation
    if (formData.spent < 0) {
      newErrors.spent = "จำนวนใช้ไปต้องมากกว่าหรือเท่ากับ 0";
    }

    // Spent should not exceed budget
    if (formData.spent > formData.budget) {
      newErrors.spent = "จำนวนใช้ไปต้องไม่เกินงบประมาณ";
    }

    // Date range validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (startDate >= endDate) {
        newErrors.end_date = "วันสิ้นสุดต้องหลังจากวันเริ่มต้น";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before submitting
    if (!validateForm()) {
      toastValidationError();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (project?.id) {
        // Update existing project
        result = await supabase
          .from("projects")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", project.id)
          .select()
          .single();
      } else {
        // Create new project
        result = await supabase
          .from("projects")
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (project?.id) {
        toastUpdateSuccess("Project");
      } else {
        toastCreateSuccess("Project");
      }
      onSave(result.data);
    } catch (err) {
      setError(err.message);
      toastError("save", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {project?.id ? "แก้ไขโครงการ" : "เพิ่มโครงการ"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสโครงการ *
              </label>
              <input
                type="text"
                name="project_code"
                value={formData.project_code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกรหัสโครงการ (เช่น PRJ-001)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทโครงการ
              </label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">เลือกประเภทสัญญาจ้าง</option>
                <option value="งานโครงการ">งานโครงการ</option>
                <option value="ซื้อมาขายไป">ซื้อมาขายไป</option>
                <option value="จ้างทำของ">จ้างทำของ</option>
                <option value="Fixed Price">
                  Fixed Price / Lump Sum (สัญญาจ้างเหมาแบบราคาคงที่)
                </option>
                <option value="Time & Materials">
                  Time & Materials (T&M) (สัญญาจ้างตามระยะเวลาและวัสดุ)
                </option>
                <option value="Cost Plus">
                  Cost Plus / Cost Reimbursable (สัญญาจ้างแบบต้นทุนบวกกำไร)
                </option>
                <option value="Unit Price">
                  Unit Price / Unit Rate (สัญญาจ้างแบบราคาต่อหน่วย)
                </option>
                <option value="Retainer">
                  Retainer / Service Agreement (สัญญาจ้างบริการรายงวด/รายเดือน)
                </option>
                <option value="Turnkey">
                  Turnkey (สัญญาจ้างเหมาเบ็ดเสร็จ)
                </option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อโปรเจคต์ *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกชื่อโปรเจคต์"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Planning">วางแผน</option>
                <option value="Active">ดำเนินการ</option>
                <option value="Completed">เสร็จสิ้น</option>
                <option value="On Hold">พักชั่วคราว</option>
                <option value="Cancelled">ยกเลิก</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ผู้จัดการ
              </label>
              <select
                name="manager_id"
                value={formData.manager_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">เลือกผู้จัดการ</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความคืบหน้า (%)
              </label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                งบประมาณ (บาท)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.budget ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.budget && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} /> {errors.budget}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ใช้ไปแล้ว (บาท)
              </label>
              <input
                type="number"
                name="spent"
                value={formData.spent}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.spent ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.spent && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} /> {errors.spent}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันเริ่มต้น
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันสิ้นสุด
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.end_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} /> {errors.end_date}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกรายละเอียดโปรเจคต์"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Term
            </label>
            <input
              type="text"
              name="payment_term"
              value={formData.payment_term}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอก Payment Term"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จำนวนงวดงาน
            </label>
            <input
              type="number"
              name="payment_term_count"
              value={formData.payment_term_count}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกจำนวนงวดงาน"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เปอร์เซ็นต์ต่องวด (%)
            </label>
            <input
              type="number"
              name="payment_percentage"
              value={formData.payment_percentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกเปอร์เซ็นต์ต่องวด (%)"
            />
          </div>

          {/* Payment Schedule Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                ตารางงวดการชำระเงิน
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generateEqualSchedule}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  แบ่งเท่ากัน
                </button>
                <button
                  type="button"
                  onClick={addPaymentScheduleItem}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  + เพิ่มงวด
                </button>
              </div>
            </div>

            {formData.payment_schedule.length > 0 ? (
              <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 pb-2 border-b">
                  <div className="col-span-2">งวดที่</div>
                  <div className="col-span-4">เปอร์เซ็นต์ (%)</div>
                  <div className="col-span-4">จำนวนเงิน (บาท)</div>
                  <div className="col-span-2">จัดการ</div>
                </div>
                {formData.payment_schedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={schedule.installment}
                        onChange={(e) =>
                          handlePaymentScheduleChange(
                            index,
                            "installment",
                            e.target.value,
                          )
                        }
                        min="1"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        value={schedule.percentage}
                        onChange={(e) =>
                          handlePaymentScheduleChange(
                            index,
                            "percentage",
                            e.target.value,
                          )
                        }
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-4 text-sm text-gray-600">
                      {formData.budget
                        ? `฿${((formData.budget * schedule.percentage) / 100).toLocaleString()}`
                        : "-"}
                    </div>
                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={() => removePaymentScheduleItem(index)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t text-xs text-gray-600">
                  รวม:{" "}
                  {formData.payment_schedule
                    .reduce((sum, s) => sum + s.percentage, 0)
                    .toFixed(2)}
                  %
                  {formData.payment_percentage && (
                    <span
                      className={`ml-2 ${formData.payment_schedule.reduce((sum, s) => sum + s.percentage, 0).toFixed(2) !== formData.payment_percentage.toFixed(2) ? "text-orange-600 font-medium" : ""}`}
                    >
                      (ควรเป็น {formData.payment_percentage}%)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
                ยังไม่มีตารางงวดการชำระเงิน คลิก "แบ่งเท่ากัน" หรือ "+ เพิ่มงวด"
                เพื่อเริ่มต้น
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? "กำลังบันทึก..."
                : project?.id
                  ? "อัปเดต"
                  : "เพิ่มโครงการ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
