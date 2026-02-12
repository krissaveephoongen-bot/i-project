**วัตถุประสงค์**
- ยืนยันว่าหลัง login การเรนเดอร์ทุกหน้าในแอปทำงานถูกต้อง, ไม่มีหน้าขาว/404, และคำขอเครือข่ายตอบ 200
- ตรวจ UX หลัก (เมนู, breadcrumb, header, theme, i18n) ว่าทำงานร่วมกับ ProtectedLayout/Providers ได้ตามคาด

**ขอบเขตหน้า**
- โฮม: [/](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/page.tsx)
- โครงการ: [/projects](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/page.tsx), [/projects/[id]](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/%5Bid%5D/page.tsx)
- รายการย่อยโครงการ: [milestones](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/%5Bid%5D/milestones/page.tsx), [risks](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/%5Bid%5D/risks/page.tsx), [tasks](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/%5Bid%5D/tasks/page.tsx), [team](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/%5Bid%5D/team/page.tsx), [budget](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/%5Bid%5D/budget/page.tsx), [documents](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/%5Bid%5D/documents/page.tsx)
- งาน/ผู้มีส่วนได้เสีย/ทรัพยากร: [/tasks](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/tasks/page.tsx), [/stakeholders](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/stakeholders/page.tsx), [/resources](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/resources/page.tsx)
- รายงาน: [/reports](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/reports/page.tsx), [financial](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/reports/financial/page.tsx), [projects](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/reports/projects/page.tsx), [resources](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/reports/resources/page.tsx)
- อนุมัติ/เวลา: [/approval](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/approval/page.tsx), [approvals/expenses](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/approvals/expenses/page.tsx), [approvals/timesheets](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/approvals/timesheets/page.tsx), [/timesheet](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/timesheet/page.tsx)
- ผู้ใช้/โปรไฟล์/ตั้งค่า: [/users](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/users/page.tsx), [/profile](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/profile/page.tsx), [/settings](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/settings/page.tsx)
- หน้า public: [/staff/login](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/staff/login/page.tsx), [/vendor/login](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/vendor/login/page.tsx)

**การเตรียมก่อนตรวจ**
- เปิดเซิร์ฟเวอร์ dev รวม: npm run dev:all (Frontend 3000, Backend 3001)
- ยืนยัน env NEXT_PUBLIC_API_URL=http://localhost:3001 และ DATABASE_URL ใช้ Supabase pooler
- ล็อกอินด้วยผู้ใช้จริง (ตอนนี้ยืนยันแล้วว่า login ผ่าน)

**เช็คลิสต์ตรวจแบบแมนนวล**
1) ProtectedLayout/Sidebar/Header
- เปลี่ยนหน้าโดยคลิกเมนูใน Sidebar: ไม่มีหน้าขาว, breadcrumb/active state ถูกต้อง
- ตรวจ redirect: เมื่ออยู่หน้า login และล็อกอินแล้วต้องกลับไป /, เมื่อไม่ล็อกอินห้ามเข้าหน้า private
2) Dashboard บนโฮม
- FinancialChart และ TeamLoadChart แสดงผล กราฟ/ตารางโหลดได้ ไม่มี error
- คำขอไป Backend ตอบ 200: 
  - KPI: http://localhost:3001/api/dashboard/kpi
  - Financial: http://localhost:3001/api/dashboard/financial
  - Projects: http://localhost:3001/api/dashboard/projects
  - Team Load: http://localhost:3001/api/dashboard/teamload
3) กลุ่ม /projects และเพจย่อย
- เปิด /projects เลือก id ตัวอย่าง; เข้าหน้าย่อยทุกอัน (milestones/risks/tasks/team/budget/documents) ต้องเรนเดอร์ได้
- ตรวจ params id ถูกอ่านและ fallback ปลอดภัยตามที่ guard ไว้
4) หน้ารายงาน/อนุมัติ/เวลา/ทรัพยากร/ผู้ใช้
- แต่ละหน้าแสดงตาราง/การ์ด/กราฟตามคาด, ไม่มี error boundary แจ้งเตือน
5) i18n/Theme
- สลับภาษา th/en ผ่าน LanguageSwitcher มีข้อความเปลี่ยนตาม [I18nProvider.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/components/I18nProvider.tsx)
- สลับ Theme ผ่าน ThemeToggle แล้ว class และสีเปลี่ยนถูกต้อง

**การตรวจแบบอัตโนมัติ (เสนอเพิ่ม Playwright)**
- โครงสร้างทดสอบ (มีสคริปต์แล้วใน package.json):
  - Login.spec: เปิด /staff/login, กรอกอีเมล/รหัสผ่าน, ยืนยัน redirect ไป /
  - Navigation.spec: คลิกทุกเมนูใน Sidebar, ยืนยันหัวข้อ/title/Breadcrumb และไม่มี error console
  - Dashboard.spec: รอ network call 4 เส้นทางตอบ 200, ตรวจองค์ประกอบกราฟ/ตารางปรากฏ
  - Projects.spec: เปิด /projects และเส้นทางย่อยตาม id ตัวอย่าง, ตรวจส่วนประกอบหลักปรากฏ
  - Settings/Profile/Users.spec: เปิดหน้าและตรวจองค์ประกอบหลัก
- เกณฑ์ผ่าน: ไม่มี console error, network 4xx/5xx เป็นศูนย์, องค์ประกอบหลักปรากฏครบ

**กรณีขอบ/ข้อควรระวัง**
- เส้นทางต้องมี trailing slash เพื่อลด 308; ในโค้ดได้ปรับจุดหลักแล้ว (AuthProvider)
- ถ้าพึ่งเปลี่ยน env ให้รีสตาร์ท dev server
- หากเพจใดพึ่งพา DB schema เฉพาะ ให้ใช้ข้อมูลจริงในระบบ ไม่ใช้ seed

**ผลส่งมอบ**
- รายงานผลตรวจหน้า/เครือข่าย (สถานะผ่าน/ไม่ผ่าน), ลิสต์ข้อผิดพลาดพร้อมลิงก์ไฟล์แก้ไข
- สคริปต์ทดสอบ Playwright ครอบคลุมเส้นทางหลัก พร้อมวิธีรัน

ยืนยันตามแผนได้เลย ผมจะเริ่มตรวจแบบแมนนวลและเพิ่มชุดทดสอบ Playwright พร้อมรายงานผลหน้า/เครือข่ายทันที