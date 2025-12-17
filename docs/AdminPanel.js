function AdminPanel() {
  try {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeSection, setActiveSection] = React.useState('users');

    React.useEffect(() => {
      loadUsers();
    }, []);

    const loadUsers = async () => {
      try {
        const result = await trickleListObjects('user', 50, true);
        setUsers(result.items || []);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    const getRoleColor = (role) => {
      switch (role) {
        case 'admin': return 'bg-red-100 text-red-800';
        case 'manager': return 'bg-blue-100 text-blue-800';
        case 'employee': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getRoleText = (role) => {
      switch (role) {
        case 'admin': return 'แอดมิน';
        case 'manager': return 'ผู้จัดการ';
        case 'employee': return 'พนักงาน';
        default: return role;
      }
    };

    const sections = [
      { id: 'users', label: 'จัดการผู้ใช้', icon: 'users' },
      { id: 'roles', label: 'สิทธิ์การใช้งาน', icon: 'shield' },
      { id: 'system', label: 'ตั้งค่าระบบ', icon: 'settings' },
      { id: 'reports', label: 'รายงานระบบ', icon: 'chart-bar' }
    ];

    return (
      <div className="space-y-6" data-name="admin-panel" data-file="components/AdminPanel.js">
        <div className="flex space-x-1 bg-[var(--secondary-color)] p-1 rounded-lg w-fit">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-white text-[var(--primary-color)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className={`icon-${section.icon} text-sm mr-2`}></div>
              {section.label}
            </button>
          ))}
        </div>

        {activeSection === 'users' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">จัดการผู้ใช้</h3>
              <button className="btn-primary">
                <div className="icon-user-plus text-sm mr-2"></div>
                เพิ่มผู้ใช้
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">กำลังโหลด...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="text-left py-3 px-4 font-medium">ชื่อผู้ใช้</th>
                      <th className="text-left py-3 px-4 font-medium">อีเมล</th>
                      <th className="text-left py-3 px-4 font-medium">บทบาท</th>
                      <th className="text-left py-3 px-4 font-medium">แผนก</th>
                      <th className="text-left py-3 px-4 font-medium">อัตราค่าแรง</th>
                      <th className="text-left py-3 px-4 font-medium">สถานะ</th>
                      <th className="text-left py-3 px-4 font-medium">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.objectId} className="border-b border-[var(--border-color)] hover:bg-[var(--secondary-color)]">
                        <td className="py-3 px-4 font-medium">{user.objectData.Username}</td>
                        <td className="py-3 px-4">{user.objectData.Email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.objectData.Role)}`}>
                            {getRoleText(user.objectData.Role)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{user.objectData.Department}</td>
                        <td className="py-3 px-4">฿{user.objectData.HourlyRate}/ชม.</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.objectData.Status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.objectData.Status === 'active' ? 'ใช้งานได้' : 'ระงับ'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <div className="icon-edit text-sm text-[var(--text-secondary)]"></div>
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <div className="icon-trash-2 text-sm text-red-500"></div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'roles' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">สิทธิ์การใช้งาน</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-red-600">แอดมิน</h4>
                  <ul className="text-sm space-y-1">
                    <li>• จัดการผู้ใช้ทั้งหมด</li>
                    <li>• ตั้งค่าระบบ</li>
                    <li>• อนุมัติทุกประเภท</li>
                    <li>• ดูรายงานทั้งหมด</li>
                  </ul>
                </div>
                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-blue-600">ผู้จัดการ</h4>
                  <ul className="text-sm space-y-1">
                    <li>• อนุมัติ Timesheet</li>
                    <li>• อนุมัติค่าใช้จ่าย</li>
                    <li>• จัดการโปรเจกต์</li>
                    <li>• ดูรายงานแผนก</li>
                  </ul>
                </div>
                <div className="border border-[var(--border-color)] rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-green-600">พนักงาน</h4>
                  <ul className="text-sm space-y-1">
                    <li>• บันทึก Timesheet</li>
                    <li>• บันทึกค่าใช้จ่าย</li>
                    <li>• ดูโปรเจกต์ที่เกี่ยวข้อง</li>
                    <li>• ดูรายงานส่วนตัว</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'system' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">ตั้งค่าระบบ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">ตั้งค่าการทำงาน</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ชั่วโมงทำงานต่อวัน</label>
                    <input
                      type="number"
                      defaultValue="8"
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">อัตราค่าล่วงเวลา</label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue="1.5"
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-4">ตั้งค่าอื่นๆ</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">สกุลเงิน</label>
                    <select className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg">
                      <option value="THB">บาท (THB)</option>
                      <option value="USD">ดอลลาร์ (USD)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">เขตเวลา</label>
                    <select className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg">
                      <option value="Asia/Bangkok">Asia/Bangkok</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="btn-primary">บันทึกการตั้งค่า</button>
            </div>
          </div>
        )}

        {activeSection === 'reports' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">รายงานระบบ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-[var(--border-color)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--primary-color)]">{users.length}</div>
                <div className="text-sm text-[var(--text-secondary)]">ผู้ใช้ทั้งหมด</div>
              </div>
              <div className="text-center p-4 border border-[var(--border-color)] rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.objectData.Status === 'active').length}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">ผู้ใช้ที่ใช้งานได้</div>
              </div>
              <div className="text-center p-4 border border-[var(--border-color)] rounded-lg">
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-[var(--text-secondary)]">Timesheet รอการอนุมัติ</div>
              </div>
              <div className="text-center p-4 border border-[var(--border-color)] rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-[var(--text-secondary)]">ค่าใช้จ่ายรอการอนุมัติ</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('AdminPanel component error:', error);
    return null;
  }
}
