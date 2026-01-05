import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { AlertCircle, Lock, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="max-w-md w-full space-y-6 text-center animate-slide-up">
        {/* Icon Container */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-white rounded-full p-6 shadow-lg">
              <Lock className="w-16 h-16 text-error-600" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Status Code */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-error-600 to-error-700 bg-clip-text text-transparent">
            403
          </h1>
          <div className="h-1 w-16 bg-gradient-to-r from-error-500 to-error-600 mx-auto rounded-full"></div>
        </div>

        {/* Title and Description */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900">
            การเข้าถึงถูกปฏิเสธ
          </h2>
          <p className="text-gray-600 leading-relaxed">
            ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคุณเชื่อว่านี่เป็นข้อผิดพลาด
          </p>
        </div>

        {/* Alert Info */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">
                สิทธิ์การเข้าถึงจำกัด
              </p>
              <p className="text-gray-600 text-xs mt-1">
                คุณพยายามเข้าถึงทรัพยากรที่คุณไม่ได้รับอนุญาต
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button asChild className="bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 text-white font-semibold">
            <Link to="/" className="flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าแรก
            </Link>
          </Button>
          <button 
            onClick={() => window.location.href = 'mailto:support@example.com'}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-gray-300 text-gray-700 hover:bg-gray-50 h-10 py-2 px-4"
          >
            ติดต่อผู้ดูแลระบบ
          </button>
        </div>

        {/* Footer Text */}
        <div className="text-xs text-gray-500 pt-4">
          <p>รหัสข้อผิดพลาด: <span className="font-mono font-semibold">AUTH_403</span></p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-5 w-20 h-20 bg-red-100 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-red-100 rounded-full opacity-10 blur-3xl"></div>
    </div>
  );
}
