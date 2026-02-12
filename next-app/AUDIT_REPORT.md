# Audit Report: Project Management System

## Executive Summary
จากการตรวจสอบ Codebase อย่างละเอียด พบปัญหาสำคัญที่มีผลต่อความเสถียรและความถูกต้องของข้อมูล โดยเฉพาะเรื่อง **Data Consistency** ระหว่าง API และ Database Schema (ชื่อตารางไม่ตรงกัน) และ **Error Handling** ที่ปิดบังข้อผิดพลาดที่แท้จริง ทำให้การ Debug ทำได้ยาก นอกจากนี้ยังพบฟังก์ชัน CRUD ที่ยังไม่ครบถ้วนในบาง Module

---

## 1. Data Consistency & Integrity (ความถูกต้องของข้อมูล)

### 🔴 Critical: Timesheet Table Mismatch
*   **อาการ:** API Route (`app/api/timesheet/entries/route.ts`) พยายามอ่าน/เขียนข้อมูลจากตาราง `time_entries`
*   **ความจริง:** ในไฟล์ Schema Definition (`app/api/_lib/schema.ts`) กำหนดชื่อตารางว่า `timesheets`
*   **ผลกระทบ:** การบันทึกเวลาทำงานจะล้มเหลว (หรือถ้าตาราง `time_entries` ไม่มีอยู่จริง ก็จะ Error) แต่เนื่องจากมีการดัก Error แบบเงียบๆ (Swallow Error) ทำให้ Frontend ไม่ทราบว่าบันทึกไม่สำเร็จ
*   **ระดับความรุนแรง:** Critical

### 🔴 Critical: Missing Stakeholders Table
*   **อาการ:** ฟีเจอร์ Stakeholders ที่เพิ่งเพิ่มเข้ามาเรียกใช้ตาราง `stakeholders`
*   **ความจริง:** ตารางนี้ยังไม่ได้ถูกนิยามใน `schema.ts` และยังไม่มีการ Run Migration เพื่อสร้างตารางนี้
*   **ผลกระทบ:** การกด "Add Stakeholder" จะเกิด Error 500 (Undefined Table) ทันที
*   **ระดับความรุนแรง:** Critical

### 🟡 Minor: Inconsistent Naming Conventions
*   **รายละเอียด:** บางตารางใช้ `camelCase` (เช่น `managerId` ใน Projects) บางตารางใช้ `snake_case` (เช่น `user_id` ใน Timesheets) ทำให้เกิดความสับสนในการเขียน Query และ Mapping Data
*   **ผลกระทบ:** เสี่ยงต่อการเกิด Bug เมื่อมีการ Join ตารางหรือ Refactor Code

---

## 2. Complete CRUD Operations (ความครบถ้วนของฟังก์ชัน)

### 🟠 Major: Sales Pipeline Management Incomplete
*   **รายละเอียด:** API สำหรับ Sales Pipeline (`app/api/sales/pipeline/route.ts`) มีเพียง `GET` เท่านั้น
*   **สิ่งที่ขาด:** ไม่มี API สำหรับ `POST` (สร้าง Pipeline ใหม่), `PUT` (แก้ไข Stages), หรือ `DELETE`
*   **ผลกระทบ:** User ไม่สามารถปรับแต่งขั้นตอนการขาย (Sales Stages) ให้ตรงกับธุรกิจจริงได้ ต้องใช้ Default Hardcoded เท่านั้น

### 🟢 Pass: Users & Clients
*   **รายละเอียด:** มีฟังก์ชัน Create, Read, Update, Delete ครบถ้วน (แม้ User API จะรวม PUT/DELETE ไว้ใน Route หลัก แต่ก็ใช้งานได้)

---

## 3. Dynamic Filtering & UI State

### 🟢 Pass: Task Filtering
*   **รายละเอียด:** หน้า Task List (Table View) มีการส่ง Parameter (Status, Priority) ไปยัง API และ API มีการรับค่าไป Query Database จริง ถูกต้องตามหลักการ

### 🟡 Minor: Dashboard Charts (Mock Logic)
*   **รายละเอียด:** กราฟบางตัวใน Dashboard (เช่น `FinancialChart.tsx`, `ReportsSunburst.tsx`) มีการคำนวณแบบ Mockup Logic บางส่วน เช่น การกระจาย Revenue รายเดือนจากยอดรวม Budget เนื่องจากยังไม่มีตาราง Transaction/Invoice จริงรองรับ
*   **เพิ่มเติม:** `SCurveAnalysis.js` และ `ProjectSCurve.js` คำนวณ Plan Progress แบบ Linear (เส้นตรง) ซึ่งอาจไม่สะท้อนความเป็นจริงในโปรเจกต์ที่ซับซ้อน

### 🔴 Critical: Legacy UI Components with Mock Data
*   **รายละเอียด:** พบไฟล์ Component เก่าที่ยังคงใช้ Mock Data หรือ Hardcoded Logic และไม่ได้ถูกใช้งานจริงในหน้าหลัก (Dead Code):
    *   `components/ProjectSCurve.js`: ใช้ `window.Chart` (Chart.js) โดยตรง และคำนวณข้อมูลจำลอง
    *   `components/SCurveAnalysis.js`: ใช้ `trickleListObjects` (ฟังก์ชันที่ไม่มีอยู่จริง หรือเป็น Legacy)
    *   `components/ProjectChart.js`: ใช้ `ChartJS` และ `projects` prop ที่ไม่ได้เชื่อมต่อกับ State กลาง
    *   `components/TasksDataTable.js`: ใช้ `trickleListObjects` และ `trickleDeleteObject` ซึ่งจะทำให้เกิด Reference Error
*   **ผลกระทบ:** หากเผลอนำ Component เหล่านี้ไปใช้ หน้าเว็บจะพังทันที (Runtime Error)

---

## 4. Professional Error Handling

### 🔴 Critical: Silent Failures in Timesheet API
*   **Code:**
    ```typescript
    catch {
      return NextResponse.json({ id: undefined }, { status: 200 });
    }
    ```
*   **ปัญหา:** เมื่อเกิด Database Error (เช่น หาตารางไม่เจอ) API กลับส่ง HTTP 200 OK กลับไป พร้อม Object ว่างๆ
*   **ผลกระทบ:** Frontend เข้าใจว่าบันทึกสำเร็จ (Toast Success ขึ้น) แต่ข้อมูลไม่ลง Database ทำให้ User เข้าใจผิดและข้อมูลสูญหาย
*   **สิ่งที่ต้องแก้:** ต้อง Return HTTP 400/500 พร้อม Error Message ที่ชัดเจน

### 🟠 Major: Generic Error Responses
*   **รายละเอียด:** หลาย API ใช้ `return err(e?.message || 'error', 500)` ซึ่งดีกว่า Silent Failure แต่ยังขาดการ Log ลง Server Console อย่างเป็นระบบ (เช่น ไม่มี Request ID หรือ Stack Trace) ทำให้ติดตามปัญหายากใน Production

---

## Action Plan (ลำดับการแก้ไข)

1.  ✅ **Fix Database Schema:**
    *   แก้ชื่อตารางใน API Timesheet ให้ตรงกับ Schema (`timesheets`)
    *   เพิ่มตาราง `stakeholders` ลงใน `schema.ts` และรัน Sync
2.  ✅ **Clean Up Legacy UI:**
    *   ลบหรือ Refactor Components เก่า (`ProjectSCurve.js`, `SCurveAnalysis.js`, `TasksDataTable.js`) ให้ใช้ Recharts และข้อมูลจริงจาก API หรือ `useQuery`
    *   ตรวจสอบหน้า `app/projects/[id]/page.tsx` ว่ามีการเรียกใช้ Component เก่าเหล่านี้หรือไม่
3.  ✅ **Improve Error Handling:**
    *   รื้อถอน `try-catch` ที่กลืน Error ใน Timesheet API
    *   ปรับปรุง Response Code ให้ถูกต้อง (4xx, 5xx)
4.  ✅ **Implement Missing CRUD:**
    *   เพิ่ม API สำหรับจัดการ Sales Pipeline (Stages)
5.  **Refactor & Consistency:**
    *   ตรวจสอบ Field Name ให้ตรงกันทั้งระบบ (Snake Case vs Camel Case)
