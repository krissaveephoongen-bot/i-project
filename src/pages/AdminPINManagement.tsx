import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, RefreshCw, Check, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface PINHistory {
  id: string;
  oldPin: string;
  newPin: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

interface PINSettings {
  currentPin: string;
  maxAttempts: number;
  lockoutDuration: number;
  enableLogging: boolean;
  enableNotifications: boolean;
  sessionTimeout: number;
}

export default function AdminPINManagement() {
  const [settings, setSettings] = useState<PINSettings>({
    currentPin: '123456',
    maxAttempts: 3,
    lockoutDuration: 900, // 15 minutes
    enableLogging: true,
    enableNotifications: true,
    sessionTimeout: 60,
  });

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPinVerify, setCurrentPinVerify] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPins, setShowPins] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [history, setHistory] = useState<PINHistory[]>([
    {
      id: '1',
      oldPin: '000000',
      newPin: '123456',
      changedBy: 'System',
      changedAt: '2024-01-01T00:00:00Z',
      reason: 'Initial setup',
    },
  ]);

  const handleGenerateSecurePin = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setNewPin(randomPin);
    setConfirmPin('');
    toast.success('Random PIN generated');
  };

  const validateNewPin = (): boolean => {
    if (!newPin || newPin.length !== 6) {
      toast.error('PIN must be 6 digits');
      return false;
    }
    if (!/^\d+$/.test(newPin)) {
      toast.error('PIN must contain only numbers');
      return false;
    }
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return false;
    }
    if (newPin === settings.currentPin) {
      toast.error('New PIN must be different from current PIN');
      return false;
    }
    if (!currentPinVerify || currentPinVerify !== settings.currentPin) {
      toast.error('Current PIN verification failed');
      return false;
    }
    return true;
  };

  const handleChangePIN = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateNewPin()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add to history
      const newHistory: PINHistory = {
        id: (history.length + 1).toString(),
        oldPin: settings.currentPin.replace(/./g, '*'),
        newPin: newPin.replace(/./g, '*'),
        changedBy: 'Admin User',
        changedAt: new Date().toISOString(),
        reason: reason || 'PIN change',
      };

      setHistory([newHistory, ...history]);

      // Update current PIN
      setSettings({
        ...settings,
        currentPin: newPin,
      });

      // Clear form
      setNewPin('');
      setConfirmPin('');
      setCurrentPinVerify('');
      setReason('');

      toast.success('PIN changed successfully');
    } catch (error) {
      toast.error('Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Lock className="h-8 w-8 text-blue-600" />
            Admin PIN Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage Admin Console PIN security
          </p>
        </div>
      </div>

      {/* Current PIN Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current PIN</h3>
            <div className="flex items-center gap-2">
              <code className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                {settings.currentPin.split('').map((_, i) => '•').join('')}
              </code>
              <button
                onClick={() => copyToClipboard(settings.currentPin)}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Copy PIN"
              >
                <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              ⚠️ Default PIN is not secure. Please change it immediately.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Change PIN Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Change PIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePIN} className="space-y-4">
                {/* Verify Current PIN */}
                <div className="space-y-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Verify Current PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPins.current ? 'text' : 'password'}
                      value={currentPinVerify}
                      onChange={(e) => setCurrentPinVerify(e.target.value)}
                      placeholder="Enter current PIN"
                      className="w-full px-4 py-3 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPins({ ...showPins, current: !showPins.current })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      tabIndex={-1}
                    >
                      {showPins.current ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    For security, you must verify your current PIN to change it.
                  </p>
                </div>

                {/* New PIN */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    New PIN
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showPins.new ? 'text' : 'password'}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6 digits"
                        maxLength={6}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center text-2xl font-bold tracking-widest"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPins({ ...showPins, new: !showPins.new })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        tabIndex={-1}
                      >
                        {showPins.new ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <Button
                      type="button"
                      onClick={handleGenerateSecurePin}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {newPin.length}/6 digits
                  </p>
                </div>

                {/* Confirm PIN */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Confirm New PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPins.confirm ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Re-enter PIN"
                      maxLength={6}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center text-2xl font-bold tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPins({ ...showPins, confirm: !showPins.confirm })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      tabIndex={-1}
                    >
                      {showPins.confirm ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {newPin && confirmPin && newPin === confirmPin && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                      <Check className="h-4 w-4" />
                      PINs match
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Reason for Change (Optional)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Quarterly security rotation"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !newPin || !confirmPin || !currentPinVerify}
                  className="w-full"
                >
                  {loading ? 'Changing PIN...' : 'Change PIN'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxAttempts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxAttempts: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {settings.maxAttempts} attempts before lockout
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Lockout Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="60"
                    step="60"
                    value={settings.lockoutDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        lockoutDuration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(settings.lockoutDuration / 60)} minutes
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableLogging}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          enableLogging: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Logging
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          enableNotifications: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Notifications
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Save Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* PIN Change History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>PIN Change History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Changed At
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Changed By
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Reason
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {new Date(entry.changedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {entry.changedBy}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {entry.reason || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                          <Check className="h-3 w-3" />
                          Success
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
