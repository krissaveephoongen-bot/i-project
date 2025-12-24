# Real User Testing Guide

## ทดสอบการเข้าสู่ระบบด้วย User จริงจากฐานข้อมูล

ไฟล์: `scripts/test-with-real-users.js`

## 🚀 เริ่มใช้งาน

### ข้อกำหนดเบื้องต้น

1. เซิร์ฟเวอร์ต้องทำงาน:
```bash
npm run dev
```

2. มี User ในฐานข้อมูล

### รันสคริปต์

```bash
node scripts/test-with-real-users.js
```

## 📋 ขั้นตอนการใช้งาน

### ขั้นตอนที่ 1: ตรวจสอบ User ในระบบ
เมื่อรันสคริปต์ จะแสดง:
- รายชื่อ User ทั้งหมดในฐานข้อมูล
- Email ของแต่ละคน
- Role (admin, manager, user)
- สถานะ (active, inactive)

**ตัวอย่างผลลัพธ์:**
```
🔍 Fetching users from database...

Available Users (3):

Index  │ Name                    │ Email                      │ Role      │ Status
───────┼─────────────────────────┼────────────────────────────┼───────────┼────────
  0    │ Admin User              │ admin@example.com          │ admin     │ active
  1    │ John Doe                │ john@example.com           │ user      │ active
  2    │ Test Manager            │ manager@example.com        │ manager   │ inactive
```

### ขั้นตอนที่ 2: เลือกโหมดทดสอบ

**โหมด 1: Interactive (ทีละคน)**
```
1. Interactive mode (choose user and test)
Enter user index to test (0-2), or 'q' to quit:
> 0
Enter password to test (or leave blank to skip): password123
```

**โหมด 2: Auto Test (อัตโนมัติ 3 users แรก)**
```
2. Auto test (test first 3 users with default password)
```

**โหมด 3: ออก**
```
3. Exit
```

### ขั้นตอนที่ 3: ทดสอบการเข้าสู่ระบบ

ผลลัพธ์จะแสดด:

#### ✓ สำเร็จ
```
🔐 Testing Login:
  Email: admin@example.com
  User: Admin User (admin)
  Status: active

✓ Login Successful
  Status Code: 200
  Duration: 45ms
  Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  User: Admin User (admin)
```

#### ❌ ล้มเหลว
```
🔐 Testing Login:
  Email: john@example.com
  User: John Doe (user)
  Status: active

❌ Login Failed
  Status Code: 401
  Message: Invalid email or password
```

## 🎯 กรณีการใช้งาน

### กรณี 1: ทดสอบ User เดียว

```bash
node scripts/test-with-real-users.js
# เลือก: 1 (Interactive mode)
# เลือก user index: 0
# ใส่รหัสผ่าน: [password]
```

### กรณี 2: ทดสอบทั้งหมด

```bash
node scripts/test-with-real-users.js
# เลือก: 2 (Auto test)
# ทดสอบ 3 users แรกด้วย password123
```

### กรณี 3: ใช้ร่วมกับ curl

หลังจากรันสคริปต์ ก็ยังสามารถทดสอบด้วย curl:

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

## 📊 ผลลัพธ์ที่เป็นไปได้

### 200 OK - สำเร็จ
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### 401 Unauthorized - รหัสผ่านผิด
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 401 Unauthorized - User ไม่ active
```json
{
  "success": false,
  "message": "User account is inactive"
}
```

### 400 Bad Request - ข้อมูลไม่ถูกต้อง
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

## 🔍 การแก้ไขปัญหา

### ปัญหา: "No users found in database"
**สาเหตุ:** ไม่มี user ในฐานข้อมูล

**วิธีแก้:**
```sql
-- สร้าง test user
INSERT INTO users (name, email, password, role, status)
VALUES ('Test User', 'test@example.com', '$2a$12$...', 'user', 'active');
```

### ปัญหา: "Cannot reach server"
**สาเหตุ:** เซิร์ฟเวอร์ไม่ทำงาน

**วิธีแก้:**
```bash
npm run dev
```

### ปัญหา: "Invalid email or password" ทุกครั้ง
**สาเหตุ:** 
- รหัสผ่านไม่ตรงกับ hash ในฐานข้อมูล
- ตัวอักษรพิมพ์ใหญ่-เล็กไม่ตรง

**วิธีแก้:**
1. ตรวจสอบรหัสผ่านใน env file
2. อัปเดตรหัสผ่าน:
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('password123', 12);
// UPDATE users SET password = '...' WHERE email = '...';
```

### ปัญหา: "User account is inactive"
**สาเหตุ:** User มีสถานะ inactive

**วิธีแก้:**
```sql
UPDATE users SET status = 'active' WHERE email = 'admin@example.com';
```

## 🛠️ Advanced Usage

### ทดสอบ User เฉพาะ

แก้ไขหลังจากเลือก user:

```javascript
// ที่ส่วนท้าย ของ autoTest()
const specificUser = users.find(u => u.email === 'admin@example.com');
await testLogin(specificUser, 'password123');
```

### เปลี่ยน Default Password

แก้ไขใน `autoTest()`:
```javascript
const testPassword = 'your-password-here'; // เปลี่ยนจาก 'password123'
```

### ทดสอบ API Endpoints อื่น

หลังจากได้ token:
```bash
# ใช้ token ที่ได้จากการ login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ทดสอบ profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/auth/profile

# ทดสอบ verify token
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/auth/verify
```

## 📈 ประสิทธิภาพ

สคริปต์จะแสดด **Duration** ของแต่ละการทดสอบ:

```
Duration: 45ms
```

- ✓ < 100ms = ดีมาก
- ✓ 100-500ms = ดี
- ⚠ 500-1000ms = ปกติ
- ❌ > 1000ms = ชัว

## 🔐 ความปลอดภัย

### ข้อควรระวัง
- ✓ รหัสผ่านไม่ถูกบันทึก
- ✓ Token แสดงเพียง 50 ตัวแรก
- ✓ ข้อมูลสำเร็จสำหรับการทดสอบเท่านั้น
- ⚠ ไม่ใช้ในการผลิต

### Best Practices
1. ใช้ test user เท่านั้น
2. ไม่ใช้ production password
3. ลบ test user หลังเสร็จสิ้น
4. ไม่เก็บ token จากการพิมพ์

## 📚 เอกสารที่เกี่ยวข้อง

- **TESTING_QUICK_START.md** - เริ่มต้นอย่างรวดเร็ว
- **LOGIN_TESTING_GUIDE.md** - คู่มือการทดสอบอย่างละเอียด
- **TESTING_REFERENCE_CARD.md** - ข้อมูลอ้างอิง

## ✅ Checklist

- [ ] เซิร์ฟเวอร์ทำงาน (`npm run dev`)
- [ ] มี User ในฐานข้อมูล
- [ ] รันสคริปต์: `node scripts/test-with-real-users.js`
- [ ] เห็น User ในรายชื่อ
- [ ] เลือกโหมดทดสอบ (interactive หรือ auto)
- [ ] ทดสอบสำเร็จ

## 🎯 ผลลัพธ์ที่คาดหวัง

### สำเร็จ ✓
- [ ] สคริปต์เชื่อมต่อฐานข้อมูลสำเร็จ
- [ ] แสดงรายชื่อ User
- [ ] ทดสอบการเข้าสู่ระบบสำเร็จ
- [ ] แสดง Token

### ล้มเหลว ❌
- [ ] ข้อความแสดงข้อผิดพลาดชัดเจน
- [ ] แนะนำวิธีแก้

## 💡 Tips

1. **บันทึกข้อมูล User ที่ใช้งาน**
   ```
   Email: ___________
   Password: ___________
   Role: ___________
   ```

2. **ใช้ Interactive mode สำหรับการทดสอบครั้งแรก**
   - สามารถเลือก user ที่ต้องการ
   - มีการยืนยันก่อนแต่ละการทดสอบ

3. **ใช้ Auto test สำหรับการตรวจสอบอย่างรวดเร็ว**
   - ทดสอบ 3 users แรกโดยอัตโนมัติ
   - ดีสำหรับ CI/CD pipelines

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ server logs
2. ตรวจสอบ browser console
3. ดูผลลัพธ์ของสคริปต์
4. อ้างอิง troubleshooting ด้านบน
