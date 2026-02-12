**สิ่งที่พบและสาเหตุหลัก**
- ฮุคจาก next/navigation (usePathname, useParams, useSearchParams) มีชนิดเป็น string | null หรืออาจ null บางสถานะ ทำให้เกิด TS errors เมื่อใช้โดยไม่ guard
- ฟังก์ชัน fetchWithTimeout ใน app/page.tsx มี implicit any และการจัดการ error เป็น unknown ที่เข้าถึงคุณสมบัติโดยไม่แคบชนิด
- components/ui/loading.tsx ไม่มีชนิด props ที่จำกัดค่า size ทำให้ index object ด้วย string ทั่วไปและเกิด TS7053
- processes/auth/ui/RegisterForm.tsx ชนิด RegisterFormData อนุญาต confirmPassword เป็น optional → การเรียก .trim() อาจ undefined
- app/api/auth/login/route.ts กำหนดออบเจ็กต์ updates แบบ dynamic จน TS ไม่เห็นฟิลด์ lockeduntil
- app/api/admin/fix-policies/route.ts ใช้ supabaseAdmin.query ซึ่งไม่อยู่ใน API มาตรฐานของ supabase-js
- ไม่พบการอ้างอิง "@vite/client" ในโค้ดโปรเจ็กต์ จึงน่าจะเป็นผลจากสภาพแวดล้อม dev/แคชหรือปลั๊กอิน ไม่ใช่โค้ด

**แผนแก้ไขทีละไฟล์**
- ProtectedLayout: ปรับให้ pathname มีค่า fallback เป็น '' และคำนวณ isPublicRoute แบบปลอดภัย
  - [ProtectedLayout.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/components/ProtectedLayout.tsx)
- Sidebar: กำหนด pathname ?? '' และใช้ startsWith อย่างปลอดภัยเมื่อ item.href มีค่า
  - [Sidebar.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/components/Sidebar.tsx#L170-L178)
- หน้า Dashboard
  - เพิ่มชนิดให้ fetchWithTimeout: url: string | URL, options: RequestInit; แคบชนิด error โดยตรวจสอบเป็น DOMException หรือมีคุณสมบัติ name ก่อนใช้
  - [page.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/page.tsx#L21-L39)
- หน้ากลุ่ม projects/milestones/risks/tasks/team: guard useParams ก่อนเข้าถึง id และ fallback เป็น '' เมื่อไม่มี
  - [milestones/page.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/[id]/milestones/page.tsx#L26-L33)
  - [risks/page.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/projects/[id]/risks/page.tsx#L26-L33)
  - [tasks/page.tsx] และ [team/page.tsx] ทำแนวทางเดียวกัน
- ตัวกรอง stakeholders/tasks: ใช้ searchParams?.toString() เมื่อสร้าง URLSearchParams และ defaultValue ด้วย searchParams?.get(...) ?? ''
  - [ProjectFilter.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/stakeholders/components/ProjectFilter.tsx#L10-L18)
  - [TaskFilters.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/tasks/components/TaskFilters.tsx#L12-L20)
- Loading UI: ใส่ชนิดให้ props และจำกัด size เป็น 'sm'|'md'|'lg'|'xl' แล้ว index ด้วย keyof typeof sizes
  - [loading.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/components/ui/loading.tsx#L4-L21)
- RegisterForm: ปรับ isFormValid ให้ใช้ formData.confirmPassword?.trim() และคงการแสดงผล validation ตามเดิม
  - [RegisterForm.tsx](file:///c:/Users/Jakgrits/project-mgnt/next-app/processes/auth/ui/RegisterForm.tsx#L57-L66)
- Login API: กำหนดชนิด updates เป็น { failedloginattempts: number; lockeduntil?: Date } เพื่อให้ TS รู้จักฟิลด์
  - [login/route.ts](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/api/auth/login/route.ts#L66-L76)
- Fix-policies API: ลบสาขา supabaseAdmin.query และใช้เฉพาะ supabaseAdmin.rpc หรือสลับไปใช้ pg client หากจำเป็น
  - [fix-policies/route.ts](file:///c:/Users/Jakgrits/project-mgnt/next-app/app/api/admin/fix-policies/route.ts#L17-L31)

**การตรวจสอบ @vite/client 404**
- ยืนยันอีกครั้งว่าไม่มีโค้ดอ้าง "@vite/client" และไม่มี service worker/manifest ในโครงการ
- ขั้นตอนตรวจสอบ:
  - เคลียร์แคชเบราว์เซอร์และ Hard Reload
  - ปิดส่วนขยาย devtools ที่อาจ inject สคริปต์ Vite
  - ตรวจสอบว่าหน้า dev ที่ตอบกลับมาจาก Next.js ไม่ใช่ HTML จากระบบอื่น
  - หากยังพบ 404: เก็บ Network log ที่ร้องขอ /@vite/client เพื่อตรวจดู initiator

**ขั้นตอนดำเนินการและทดสอบ**
- แก้โค้ดตามรายการด้านบนทั้งหมด
- รัน typecheck: npx tsc --noEmit ให้ผลลัพธ์ 0 errors
- รันแอป dev ทั้งคู่ แล้วทดสอบ:
  - เส้นทางสาธารณะ/ส่วนที่ต้อง login ใน ProtectedLayout ทำงานตามเงื่อนไข
  - Sidebar active state ถูกต้องและไม่มี error null
  - Dashboard โหลด KPI/Projects/Financial/TeamLoad พร้อม fallback เมื่อ backend ช้า
  - หน้ารายการ Projects และหน้ารอง (milestones/risks/tasks/team) แสดงผลได้
  - ตัวกรอง stakeholders/tasks อัปเดต URL query อย่างถูกต้อง
- ตรวจสอบ Console/Network เพื่อยืนยันว่าไม่มีการร้อง /@vite/client อีก หรือระบุแหล่งที่มาหากมี

**ผลกระทบและความปลอดภัย**
- เปลี่ยนแปลงเฉพาะการ guard ค่า null/typing ไม่กระทบ logic ธุรกิจ
- ไม่เพิ่มการ log ข้อมูลลับ/secret และไม่แก้ไขการตั้งค่า env

ยืนยันให้ดำเนินการหรือมีจุดไหนอยากปรับก่อนเริ่มแก้ไข?