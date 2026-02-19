# กฏการทำงาน - การตรวจสอบโครงสร้างฐานข้อมูล

## 📋 ก่อนการพัฒนาทุกครั้ง

### ✅ 1. ตรวจสอบ Database Schema
- [ ] ตรวจสอบว่า tables ที่จะใช้มีอยู่จริง
- [ ] ตรวจสอบว่า columns ที่จะใช้มีอยู่
- [ ] ตรวจสอบว่า data types ถูกต้อง
- [ ] ตรวจสอบว่า foreign keys ถูกต้อง
- [ ] ตรวจสอบว่า indexes มีเพียงพอ

### ✅ 2. ตรวจสอบ API Endpoints
- [ ] ตรวจสอบว่า GET endpoints ทำงาน
- [ ] ตรวจสอบว่า POST endpoints ทำงาน
- [ ] ตรวจสอบว่า PUT endpoints ทำงาน
- [ ] ตรวจสอบว่า DELETE endpoints ทำงาน
- [ ] ตรวจสอบว่า error handling ครบถ้วน

### ✅ 3. ตรวจสอบ Data Flow
- [ ] ตรวจสอบว่า API → Library → Component ไหลถูกต้อง
- [ ] ตรวจสอบว่า field mapping ถูกต้อง
- [ ] ตรวจสอบว่า data transformation ถูกต้อง
- [ ] ตรวจสอบว่า error handling ครบถ้วน

### ✅ 4. ตรวจสอบ Integration
- [ ] ตรวจสอบว่า components ทำงานร่วมกัน
- [ ] ตรวจสอบว่า state management ถูกต้อง
- [ ] ตรวจสอบว่า navigation ทำงาน
- [ ] ตรวจสอบว่า permissions ทำงาน

## 📋 ก่อนการ Deploy ทุกครั้ง

### ✅ 1. Local Build
- [ ] รัน `npm run build` ก่อน deploy
- [ ] ตรวจสอบว่าไม่มี build errors
- [ ] ตรวจสอบว่าไม่มี TypeScript errors
- [ ] ตรวจสอบว่าไม่มี linting errors
- [ ] ตรวจสอบว่า bundle size พอเหมาะ

### ✅ 2. ตรวจสอบ Dependencies
- [ ] ตรวจสอบว่า package versions ถูกต้อง
- [ ] ตรวจสอบว่าไม่มี security vulnerabilities
- [ ] ตรวจสอบว่าไม่มี deprecated packages
- [ ] ตรวจสอบว่า dependencies ตรงกับ requirements

### ✅ 3. ตรวจสอบ Environment
- [ ] ตรวจสอบว่า environment variables ครบถ้วน
- [ ] ตรวจสอบว่า API URLs ถูกต้อง
- [ ] ตรวจสอบว่า database connections ถูกต้อง
- [ ] ตรวจสอบว่า authentication ถูกต้อง

### ✅ 4. ตรวจสอบ Performance
- [ ] ตรวจสอบว่า loading states ทำงาน
- [ ] ตรวจสอบว่า error states ทำงาน
- [ ] ตรวจสอบว่า caching ทำงาน
- [ ] ตรวจสอบว่า responsiveness ดี

## 📋 ขั้นตอนการทำงาน

### 1. เริ่มต้น (Planning)
1. วิเคราะหมาย requirements
2. ตรวจสอบ current state
3. วางแผนการเปลี่ยนแปลง
4. สร้าง checklist สำหรับตรวจสอบ

### 2. พัฒนา (Development)
1. เขียน code ตามแผน
2. ตรวจสอบแต่ละส่วนที่ทำ
3. รัน tests แบบ local
4. แก้ไข issues ที่พบ

### 3. ตรวจสอบ (Testing)
1. รัน `npm run build`
2. ตรวจสอบ build output
3. ทดสอบ functionality แบบ manual
4. ตรวจสอบ integration points

### 4. Deploy (Deployment)
1. Commit changes
2. Push to GitHub
3. ตรวจสอบ Vercel build
4. ทดสอบ production

## 📋 ตัวอย่างการใช้งาน

### ตัวอย่าง: การเพิ่ม Feature ใหม่
1. **ก่อนพัฒนา:** ตรวจสอบว่า table มี field ที่ต้องการ
2. **ระหว่างพัฒนา:** ทดสอบ build ทุกครั้งที่เปลี่ยนแปลง
3. **ก่อน deploy:** รัน build ครั้งสุดท้าย
4. **หลัง deploy:** ทดสอบ production ทันที

### ตัวอย่าง: การแก้ไข Bug
1. **ก่อนแก้ไข:** ตรวจสอบ root cause ของ bug
2. **ระหว่างแก้ไข:** ทดสอบ fix ทีละส่วน
3. **ก่อน deploy:** รัน build และ tests
4. **หลัง deploy:** ติดตามผลลัพธ์

## 📋 Tools ที่ใช้

### Database Schema
- `database-schema-validation.sql` - ตรวจสอบ database structure
- `check-clients-schema.sql` - ตรวจสอบ specific table

### Build Validation
- `npm run build` - ตรวจสอบ build process
- `npm run lint` - ตรวจสอบ code quality
- `npm run test` - รัน tests

### Environment Check
- `.env.local` - local environment
- `.env.production` - production environment
- Environment variables validation
