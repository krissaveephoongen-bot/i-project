import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { themes, ThemeType } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Settings,
  Lock,
  Unlock,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

export default function ThemeSelector() {
  const { state, setTheme, toggleAdminMode, verifyAdminPassword, addCustomTheme, removeCustomTheme, updateCustomTheme } = useTheme();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [editingCustom, setEditingCustom] = useState(false);
  const [customColors, setCustomColors] = useState({
    primary: '#dc2626',
    secondary: '#b91c1c',
    background: '#fef2f2',
    surface: '#fee2e2',
    text: '#991b1b',
    textSecondary: '#7f1d1d',
    border: '#dc2626',
    accent: '#dc2626',
  });

  const handleThemeChange = (themeId: ThemeType) => {
    // Check if theme change requires admin mode
    const restrictedThemes: ThemeType[] = ['custom'];
    if (restrictedThemes.includes(themeId) && !state.isAdminMode) {
      setShowPasswordModal(true);
      return;
    }
    
    setTheme(themeId);
  };

  const handlePasswordSubmit = () => {
    if (verifyAdminPassword(password)) {
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
      toggleAdminMode();
    } else {
      setPasswordError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleCustomThemeSave = () => {
    const customTheme = {
      id: 'custom' as ThemeType,
      name: 'custom',
      displayName: 'กำหนดเอง',
      colors: customColors,
    };
    
    addCustomTheme(customTheme);
    setEditingCustom(false);
  };

  const handleDeleteCustomTheme = () => {
    removeCustomTheme('custom');
    setEditingCustom(false);
  };

  const predefinedThemes = Object.entries(themes).filter(([id]) => id !== 'custom');

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">การจัดการธีม</h2>
          <p className="text-gray-600 mt-1">เลือกธีมที่คุณชอบ หรือสร้างธีมที่กำหนดเอง</p>
        </div>
        
        {/* Admin Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={state.isAdminMode ? "default" : "outline"}
            size="sm"
            onClick={toggleAdminMode}
            className="flex items-center gap-2"
          >
            {state.isAdminMode ? (
              <>
                <Unlock className="h-4 w-4" />
                โหมดผู้ดูแล
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                ผู้ดูแล
              </>
            )}
          </Button>
          
          {state.isAdminMode && (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              โหมดผู้ดูแล
            </Badge>
          )}
        </div>
      </div>

      {/* Predefined Themes */}
      <Card>
        <CardHeader>
          <CardTitle>ธีมสำเร็จ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {predefinedThemes.map(([themeId, theme]) => (
              <button
                key={themeId}
                onClick={() => handleThemeChange(themeId as ThemeType)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  state.currentTheme === themeId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {/* Theme Preview */}
                  <div className="flex space-x-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: theme.colors.background }}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: theme.colors.text }}
                    />
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{theme.displayName}</div>
                    <div className="text-xs text-gray-500">{theme.name}</div>
                  </div>
                </div>
                
                {state.currentTheme === themeId && (
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ธีมกำหนดเอง</span>
            <div className="flex gap-2">
              {editingCustom ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCustom(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCustomThemeSave}
                  >
                    บันทึก
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCustom(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {state.customThemes.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteCustomTheme}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingCustom ? (
            <div className="space-y-4">
              {/* Color Pickers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(customColors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">ตัวอย่างตัวอย่าง</div>
                <div className="flex space-x-2">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">พื้นหน้า</div>
                    <div
                      className="w-16 h-16 rounded border-2 border-gray-300"
                      style={{ backgroundColor: customColors.background }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">ข้อความ</div>
                    <div
                      className="w-16 h-16 rounded border-2 border-gray-300"
                      style={{ backgroundColor: customColors.primary }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">ข้อความ</div>
                    <div
                      className="w-16 h-16 rounded border-2 border-gray-300"
                      style={{ backgroundColor: customColors.text }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: state.theme.colors.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: state.theme.colors.background }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: state.theme.colors.text }}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">ธีมกำหนดเอง</div>
                  <div className="text-xs text-gray-500">กำลงงอยู่</div>
                </div>
              </div>
              
              <Button
                onClick={() => handleThemeChange('custom')}
                className={`flex items-center gap-2 ${
                  state.currentTheme === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {state.currentTheme === 'custom' ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span>
                  {state.currentTheme === 'custom' ? 'กำลงงอยู่ใช้งาน' : 'เปิดใช้งาน'}
                </span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold">ต้องการยืนยันยันเป็นผู้ดูแล</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่านผู้ดูแล
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              {passwordError && (
                <div className="text-red-600 text-sm">{passwordError}</div>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError('');
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handlePasswordSubmit}
                  className="flex items-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  ยืนยันยัน
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Palette className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">คำแนะนำ:</div>
              <ul className="space-y-1 text-xs">
                <li>• ธีมสว่าง/มืด ใช้สำหรับการทำงานในแจ้ง</li>
                <li>• ธีมสีใช้สำหรับความความสว่าง</li>
                <li>• การเปลี่ยนธีมจะถูกบันทึกลงในระบบของคุณโดยอัตโนโดย</li>
                <li>• ธีมกำหนดเองจำเป็นพิเศษต้องการยืนยันยันเป็นผู้ดูแล</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
