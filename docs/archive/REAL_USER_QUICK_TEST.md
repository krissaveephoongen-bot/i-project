# Real User Testing - Quick Start

## ⚡ เริ่มต้นใน 2 นาที

### ขั้นตอน 1: เปิด Terminal 2 หน้าต่าง

**Terminal 1 - เซิร์ฟเวอร์:**
```bash
npm run dev
```

**Terminal 2 - ทดสอบ:**
```bash
node scripts/test-with-real-users.js
```

### ขั้นตอน 2: เห็นรายชื่อ User

```
🔍 Fetching users from database...

Available Users (3):

Index  │ Name                    │ Email                      │ Role      │ Status
───────┼─────────────────────────┼────────────────────────────┼───────────┼────────
  0    │ Admin User              │ admin@example.com          │ admin     │ active
  1    │ John Doe                │ john@example.com           │ user      │ active
  2    │ Manager User            │ manager@example.com        │ manager   │ active
```

### ขั้นตอน 3: เลือกตัวเลือก

```
Options:
  1. Interactive mode (choose user and test)
  2. Auto test (test first 3 users with default password)
  3. Exit

Choose option (1-3): 1
```

### ขั้นตอน 4: ทดสอบ

**Interactive Mode:**
```
Enter user index to test (0-2), or 'q' to quit:
> 0
Enter password to test (or leave blank to skip): password123
```

**ผลลัพธ์:**
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

## 🎯 3 วิธีการใช้

### วิธี 1: ทดสอบ User เดียว (2 นาที)
```bash
node scripts/test-with-real-users.js
# เลือก 1 → index 0 → password → ได้ผล
```

### วิธี 2: ทดสอบทั้งหมด (1 นาที)
```bash
node scripts/test-with-real-users.js
# เลือก 2 → รอผลการทดสอบ 3 users
```

### วิธี 3: ทดสอบด้วย cURL (2 นาที)
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

## ✅ สิ่งที่ต้องตรวจสอบ

- [ ] เห็นรายชื่อ User
- [ ] เลือก User ได้
- [ ] ใส่รหัสผ่านได้
- [ ] ได้ผล Login successful/failed
- [ ] เห็น Token (ถ้าสำเร็จ)

## ❌ ปัญหาทั่วไป

| ปัญหา | แก้ไข |
|-------|-------|
| "Cannot find Prisma" | `npm install` |
| "No users found" | สร้าง test user ก่อน |
| "Connection refused" | รัน `npm run dev` ในหน้าต่าง 1 |
| "Invalid password" | เช็ครหัสผ่าน หรือ hash password |

## 📱 ผลลัพธ์ที่คาดหวัง

### ✓ สำเร็จ
```
✓ Login Successful
Status Code: 200
Token: eyJ...
```

### ❌ ล้มเหลว
```
❌ Login Failed
Status Code: 401
Message: Invalid email or password
```

## 🚀 ต่อไป

หลังจากทดสอบสำเร็จ:
1. อ่าน **REAL_USER_TESTING_GUIDE.md** สำหรับรายละเอียด
2. ทดสอบ endpoints อื่น ๆ
3. ทำเครื่องหมายว่าเสร็จ

---

**ใช้ได้เลย!** ประหยัดเวลา 5 นาที 🎉
