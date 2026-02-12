# Progress Tracker

ไฟล์นี้ใช้สำหรับติดตามความคืบหน้าในการแก้ไขปัญหาตาม `AUDIT_REPORT.md`

## 1. Fix Database Schema & Consistency
- [ ] **Fix Timesheet Table Name Mismatch**
    - [ ] แก้ไข `app/api/timesheet/entries/route.ts` ให้ใช้ตาราง `timesheets`
    - [ ] ตรวจสอบ Column Names (`userId` vs `user_id`, `projectId` vs `project_id`)
    - [ ] Side effects: ตรวจสอบหน้า `TimesheetRecordPage` ว่ายังดึงข้อมูลได้ถูกต้อง
- [ ] **Add Stakeholders Table**
    - [ ] เพิ่ม `CREATE TABLE stakeholders` ใน `app/api/_lib/schema.ts`
    - [ ] เพิ่ม Trigger/Sync logic (ถ้าจำเป็น)
    - [ ] Side effects: หน้า Help/Support จะต้องสามารถ Add Stakeholder ได้จริงโดยไม่ Error 500

## 2. Improve Error Handling
- [ ] **Fix Silent Failures in Timesheet API**
    - [ ] เปลี่ยน `return 200` ใน catch block เป็น `return 500`
    - [ ] เพิ่ม Console Log error
    - [ ] Side effects: Frontend ต้อง Handle Error case (แสดง Toast Error)

## 3. Implement Missing CRUD
- [ ] **Sales Pipeline Management**
    - [ ] เพิ่ม `POST`, `PUT`, `DELETE` ใน `app/api/sales/pipeline/route.ts`
    - [ ] Side effects: หน้า Sales Settings (ถ้ามี) หรือหน้า Sales Board ต้องรองรับการแก้ไข Stage

## 4. Manual Test Cases
- [ ] **Timesheet:** บันทึกเวลา -> เช็ค DB -> ค่าต้องลงตาราง `timesheets`
- [ ] **Stakeholder:** กดเพิ่ม -> Refresh หน้า -> ข้อมูลต้องยังอยู่
- [ ] **Error Handling:** ลองปิดเน็ตหรือแก้ชื่อตารางให้ผิด -> หน้าเว็บต้องขึ้น Toast Error สีแดง ไม่ใช่สีเขียว
