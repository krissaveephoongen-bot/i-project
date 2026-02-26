function TeamMemberForm({ member, onSave }) {
  try {
    const [formData, setFormData] = React.useState({
      username: member?.objectData?.Username || "",
      email: member?.objectData?.Email || "",
      role: member?.objectData?.Role || "employee",
      department: member?.objectData?.Department || "",
      hourlyRate: member?.objectData?.HourlyRate || 0,
      status: member?.objectData?.Status || "active",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (
          typeof trickleCreateObject !== "function" &&
          typeof trickleUpdateObject !== "function"
        ) {
          alert("ไม่สามารถบันทึกข้อมูลได้");
          return;
        }

        const userData = {
          Username: formData.username,
          Email: formData.email,
          Role: formData.role,
          Department: formData.department,
          HourlyRate: parseFloat(formData.hourlyRate),
          Status: formData.status,
        };

        if (member) {
          await trickleUpdateObject("user", member.objectId, userData);
        } else {
          await trickleCreateObject("user", userData);
        }
        onSave();
      } catch (error) {
        console.error("Error saving member:", error);
        alert("เกิดข้อผิดพลาด");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">
          {member ? "แก้ไขสมาชิก" : "เพิ่มสมาชิกใหม่"}
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">ชื่อ *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">อีเมล *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">บทบาท</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="employee">พนักงาน</option>
              <option value="manager">ผู้จัดการ</option>
              <option value="admin">แอดมิน</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">แผนก</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              อัตราต่อชั่วโมง (฿)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.hourlyRate}
              onChange={(e) =>
                setFormData({ ...formData, hourlyRate: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">สถานะ</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="active">ใช้งานได้</option>
              <option value="inactive">ระงับ</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">
          <div className="icon-save text-sm mr-2"></div>
          บันทึก
        </button>
      </form>
    );
  } catch (error) {
    console.error("TeamMemberForm error:", error);
    return null;
  }
}
