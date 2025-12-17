function Settings() {
  try {
    const [settings, setSettings] = React.useState({
      profile: {
        username: 'สมชาย ใจดี',
        email: 'somchai@company.com',
        department: 'Development',
        hourlyRate: 400
      },
      preferences: {
        language: 'th',
        timezone: 'Asia/Bangkok',
        notifications: true,
        emailNotifications: false
      }
    });

    const [activeTab, setActiveTab] = React.useState('profile');

    const handleSaveProfile = async () => {
      try {
        // Save profile settings
        console.log('Saving profile settings:', settings.profile);
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    };

    const handleSavePreferences = async () => {
      try {
        // Save user preferences
        console.log('Saving preferences:', settings.preferences);
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    };

    const tabs = [
      { id: 'profile', label: 'โปรไฟล์', icon: 'user' },
      { id: 'preferences', label: 'ความชอบ', icon: 'settings' },
      { id: 'notifications', label: 'การแจ้งเตือน', icon: 'bell' },
      { id: 'security', label: 'ความปลอดภัย', icon: 'shield' }
    ];

    return (
      <div className="space-y-6" data-name="settings" data-file="components/Settings.js">
        <div className="flex space-x-1 bg-[var(--secondary-color)] p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-[var(--primary-color)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className={`icon-${tab.icon} text-sm mr-2`}></div>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">โปรไฟล์ผู้ใช้</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                  <div className="icon-user text-3xl text-white"></div>
                </div>
                <div>
                  <button className="btn-secondary text-sm">
                    <div className="icon-upload text-sm mr-2"></div>
                    เปลี่ยนรูปโปรไฟล์
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">ชื่อผู้ใช้</label>
                  <input
                    type="text"
                    value={settings.profile.username}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, username: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">อีเมล</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">แผนก</label>
                  <select
                    value={settings.profile.department}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, department: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">อัตราค่าแรงต่อชั่วโมง (บาท)</label>
                  <input
                    type="number"
                    value={settings.profile.hourlyRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, hourlyRate: parseFloat(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <button onClick={handleSaveProfile} className="btn-primary">
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">ความชอบส่วนบุคคล</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">ภาษา</label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, language: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                  >
                    <option value="th">ไทย</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">เขตเวลา</label>
                  <select
                    value={settings.preferences.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, timezone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                  >
                    <option value="Asia/Bangkok">Asia/Bangkok</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">การแจ้งเตือนในแอป</div>
                    <div className="text-sm text-[var(--text-secondary)]">รับการแจ้งเตือนภายในระบบ</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.preferences.notifications}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, notifications: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">การแจ้งเตือนทางอีเมล</div>
                    <div className="text-sm text-[var(--text-secondary)]">รับการแจ้งเตือนผ่านอีเมล</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.preferences.emailNotifications}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, emailNotifications: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <button onClick={handleSavePreferences} className="btn-primary">
                  บันทึกการตั้งค่า
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">การตั้งค่าการแจ้งเตือน</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--border-color)]">
                <div>
                  <div className="font-medium">การอนุมัติ Timesheet</div>
                  <div className="text-sm text-[var(--text-secondary)]">แจ้งเตือนเมื่อ Timesheet ได้รับการอนุมัติ</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[var(--border-color)]">
                <div>
                  <div className="font-medium">การอนุมัติค่าใช้จ่าย</div>
                  <div className="text-sm text-[var(--text-secondary)]">แจ้งเตือนเมื่อค่าใช้จ่ายได้รับการอนุมัติ</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[var(--border-color)]">
                <div>
                  <div className="font-medium">งานใหม่</div>
                  <div className="text-sm text-[var(--text-secondary)]">แจ้งเตือนเมื่อได้รับมอบหมายงานใหม่</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">ความปลอดภัย</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">เปลี่ยนรหัสผ่าน</h4>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-2">รหัสผ่านปัจจุบัน</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">รหัสผ่านใหม่</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ยืนยันรหัสผ่านใหม่</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg"
                    />
                  </div>
                  <button className="btn-primary">
                    เปลี่ยนรหัสผ่าน
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Settings component error:', error);
    return null;
  }
}