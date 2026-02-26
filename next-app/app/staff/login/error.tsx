"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Login page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          เกิดข้อผิดพลาดบนหน้าเข้าสู่ระบบ
        </h2>
        <p className="text-sm text-slate-600 mb-4">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-4">Ref: {error.digest}</p>
        )}
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ลองโหลดหน้าใหม่
        </button>
      </div>
    </div>
  );
}
