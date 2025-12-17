import React, { useState, useEffect } from 'react';
import { X, Lock, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { adminConfig, validateAdminPIN } from '../config/admin-config';

interface AdminPINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminPINModal: React.FC<AdminPINModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const MAX_ATTEMPTS = adminConfig.MAX_ATTEMPTS;

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setAttempts(0);
      setShowPin(false);
    }
  }, [isOpen]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setPin(value);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (validateAdminPIN(pin)) {
      // Log successful attempt if enabled
      if (adminConfig.LOG_ATTEMPTS) {
        console.log('✅ Admin console accessed successfully');
      }

      setIsLoading(false);
      onSuccess();
      setPin('');
      onClose();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Log failed attempt if enabled
      if (adminConfig.LOG_ATTEMPTS) {
        console.warn(`❌ Failed admin console access attempt ${newAttempts}/${MAX_ATTEMPTS}`);
      }

      if (newAttempts >= MAX_ATTEMPTS) {
        setError(`ลองจำนวนครั้งสูงสุดแล้ว (${MAX_ATTEMPTS} ครั้ง) กรุณาลองใหม่ในภายหลัง`);
        setIsLoading(false);
        
        // Send notification if enabled
        if (adminConfig.NOTIFY_ON_FAILED_ATTEMPTS) {
          // In production: send email or notification
          console.warn('Security Alert: Multiple failed admin console access attempts detected');
        }

        setTimeout(onClose, 2000);
      } else {
        setError(`PIN ไม่ถูกต้อง (พยายาม ${newAttempts}/${MAX_ATTEMPTS})`);
        setPin('');
        setIsLoading(false);
      }
    }
  };

  const isLocked = attempts >= MAX_ATTEMPTS;
  const progressPercentage = (attempts / MAX_ATTEMPTS) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Full screen covering everything including sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLocked ? onClose : undefined}
            className="fixed inset-0 top-0 left-0 z-[9999] bg-black/60 backdrop-blur-md"
          />

          {/* Modal - Full screen centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 top-0 left-0 z-[10000] flex items-center justify-center p-4 w-screen h-screen"
          >
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
              {/* Header with gradient background */}
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-8">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
                    >
                      <Shield className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Admin Console</h2>
                      <p className="text-xs text-blue-100">ระบบจัดการสูง</p>
                    </div>
                  </div>
                  {!isLocked && (
                    <button
                      onClick={onClose}
                      className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Subtitle */}
                <div className="text-center space-y-2">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    ยืนยันตัวตนของคุณ
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ใส่ PIN 6 หลักเพื่อเข้าถึง Admin Console
                  </p>
                </div>

                {/* Error Message with animation */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Attempt progress indicator */}
                {!isLocked && attempts > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        ความปลอดภัย
                      </span>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {attempts}/{MAX_ATTEMPTS}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        className={`h-full rounded-full ${
                          progressPercentage > 66
                            ? 'bg-red-500'
                            : progressPercentage > 33
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                      />
                    </div>
                  </motion.div>
                )}

                {/* PIN Input Form */}
                {!isLocked && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* PIN Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        ใส่ PIN
                      </label>
                      <div className="relative">
                        <input
                          type={showPin ? 'text' : 'password'}
                          inputMode="numeric"
                          value={pin}
                          onChange={handlePinChange}
                          placeholder="••••••"
                          disabled={isLoading}
                          className="w-full px-5 py-4 text-center text-3xl font-bold tracking-[0.5em] border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          tabIndex={-1}
                        >
                          {showPin ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <motion.p
                        animate={{ opacity: pin.length > 0 ? 1 : 0.5 }}
                        className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-between"
                      >
                        <span>กรุณาป้อน PIN {6 - pin.length} หลักที่เหลือ</span>
                        <span className="font-semibold">{pin.length}/6</span>
                      </motion.p>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={pin.length !== 6 || isLoading}
                      whileHover={{ scale: pin.length === 6 && !isLoading ? 1.02 : 1 }}
                      whileTap={{ scale: pin.length === 6 && !isLoading ? 0.98 : 1 }}
                      className={`w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        pin.length === 6 && !isLoading
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Shield className="h-4 w-4" />
                          </motion.div>
                          <span>กำลังยืนยัน...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>เข้าสู่ระบบ</span>
                        </>
                      )}
                    </motion.button>

                    {/* Cancel Button */}
                    <motion.button
                      type="button"
                      onClick={onClose}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-11 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      ยกเลิก
                    </motion.button>
                  </form>
                )}

                {/* Locked Message */}
                {isLocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center space-y-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                      className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto border-2 border-red-200 dark:border-red-800"
                    >
                      <Lock className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </motion.div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        ถูกล็อคแล้ว
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        ลองจำนวนครั้งสูงสุดแล้ว กรุณาลองใหม่ในภายหลัง
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        หน้านี้จะปิดอัตโนมัติใน 2 วินาที
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Security info */}
                {!isLocked && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl"
                  >
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        ระบบนี้มีการป้องกันความปลอดภัย จำนวนครั้งในการพยายามจะถูกจำกัด เพื่อปกป้องบัญชีของคุณ
                      </span>
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminPINModal;
