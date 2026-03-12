// Typography Examples Component
// ตัวอย่างการใช้งาน Typography ที่ปรับปรุงแล้ว

import React from 'react';

export default function TypographyExamples() {
  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Headings */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">หัวข้อหลัก H1 (36px)</h1>
          <h2 className="text-3xl font-semibold text-gray-800">หัวข้อรอง H2 (30px)</h2>
          <h3 className="text-2xl font-semibold text-gray-800">หัวข้อย่อย H3 (24px)</h3>
          <h4 className="text-xl font-medium text-gray-700">หัวข้อเล็ก H4 (20px)</h4>
          <h5 className="text-lg font-medium text-gray-700">หัวข้อเล็กมาก H5 (18px)</h5>
          <h6 className="text-base font-medium text-gray-600">หัวข้อเล็กที่สุด H6 (16px)</h6>
        </section>

        {/* Paragraph Text */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">ย่อหน้าและข้อความ</h2>
          
          <div className="space-y-3">
            <p className="text-base leading-relaxed text-gray-700">
              นี่คือข้อความปกติขนาด 16px พร้อมความสูงบรรทัดที่เหมาะสมสำหรับการอ่าน 
              ใช้ Inter font ซึ่งเป็นมาตรฐานสำหรับ web application สมัยใหม่
            </p>
            
            <p className="text-sm leading-normal text-gray-600">
              นี่คือข้อความขนาดเล็ก 14px เหมาะสำหรับข้อมูลเสริมหรือคำอธิบายเพิ่มเติม
            </p>
            
            <p className="text-xs leading-tight text-gray-500">
              นี่คือข้อความขนาดเล็กมาก 12px เหมาะสำหรับข้อมูลที่ไม่สำคัญหรือ caption
            </p>
          </div>
        </section>

        {/* Text Components */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">คอมโพเนนต์ข้อความ</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-lg font-medium text-blue-900">ข้อความขนาดใหญ่ (18px)</p>
              <p className="text-base text-blue-700 mt-1">สำหรับหัวข้อส่วนหรือข้อมูลที่ต้องการเน้น</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-base font-medium text-gray-900">ข้อความปกติ (16px)</p>
              <p className="text-sm text-gray-600 mt-1">เป็นขนาดมาตรฐานที่ใช้งานได้ดีที่สุด</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">ข้อความขนาดเล็ก (14px)</p>
              <p className="text-xs text-green-600 mt-1">เหมาะสำหรับข้อมูลเสริมและรายละเอียด</p>
            </div>
          </div>
        </section>

        {/* Font Weights */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">น้ำหนักตัวอักษร</h2>
          
          <div className="space-y-2">
            <p className="text-base font-light text-gray-700">Inter Light (300)</p>
            <p className="text-base font-normal text-gray-700">Inter Regular (400)</p>
            <p className="text-base font-medium text-gray-700">Inter Medium (500)</p>
            <p className="text-base font-semibold text-gray-700">Inter Semibold (600)</p>
            <p className="text-base font-bold text-gray-700">Inter Bold (700)</p>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">แนวทางการใช้งาน</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-800">✅ แนะนำ</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ใช้ text-base (16px) สำหรับข้อความทั่วไป</li>
                <li>• ใช้ text-lg (18px) สำหรับหัวข้อส่วน</li>
                <li>• ใช้ text-xl (20px) สำหรับหัวข้อเล็ก</li>
                <li>• ใช้ text-2xl (24px) สำหรับหัวข้อหลักในหน้า</li>
                <li>• ใช้ leading-relaxed สำหรับย่อหน้ายาวๆ</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-800">❌ ไม่แนะนำ</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ไม่ใช้ขนาดตัวอักษรใหญ่เกินไป (เดิม 22px+)</li>
                <li>• ไม่ใช้หลายขนาดมากเกินไปในหน้าเดียว</li>
                <li>• ไม่ใช้ font weight ที่ไม่ได้กำหนด</li>
                <li>• ไม่ละเลย line height สำหรับข้อความยาว</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
