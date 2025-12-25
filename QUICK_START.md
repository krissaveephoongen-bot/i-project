# Quick Start Guide

## วิธีรัน Project Management System

### ตัวเลือกที่ 1: รัน Backend + Frontend พร้อมกัน (แนะนำ)

**Windows:**
```bash
run-dev.bat
```

นี่จะเปิด 2 terminal windows:
- Terminal 1: Backend server (port 5000)
- Terminal 2: Frontend dev server (port 5173)

---

### ตัวเลือกที่ 2: รัน Manual (ทีละขั้น)

**Terminal 1 - Backend Server:**
```bash
set JWT_SECRET=d23a93f3826e78dc8eceafdebdc687a99ca90cc121d09d324612855673aa93cf
npm run server
```
จะแสดง: `🚀 Server running on port 5000`

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```
จะแสดง: `VITE v7.3.0  ready in 123 ms`

---

## เปิด Application

1. เมื่อทั้งสองตัวรัน ให้เปิด Browser:
   ```
   http://localhost:5173
   ```

2. คุณจะถูกโหลดไปที่ landing page ลองคลิก "Sign In" หรือไปที่:
   ```
   http://localhost:5173/auth/login
   ```

---

## Test Accounts

ใช้ account ตัวใดตัวหนึ่งต่อไปนี้เพื่อทดสอบ:

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `Admin@1234` | Admin |
| `pm@example.com` | `Manager@1234` | Project Manager |
| `lead@example.com` | `Lead@1234` | Team Lead |
| `dev@example.com` | `Dev@1234` | Developer |

---

## Troubleshooting

### Error: Address already in use (port 5000/5173)
- มี process อื่นใช้ port นั้นอยู่
- ปิด terminal ด้วย `Ctrl+C` แล้วรัน `run-dev.bat` ใหม่

### Error: Network Error on Login
- ตรวจสอบว่า Backend server กำลังรัน (ควรเห็น `🚀 Server running on port 5000`)
- ถ้ายังไม่รัน ให้รัน `npm run server` ในแรก terminal

### Error: Database Connection Failed
- ตรวจสอบ `.env` file มี `DATABASE_URL` ถูกต้อง
- Database (Neon PostgreSQL) ต้องมี internet connection

### Blank Page / 404
- ตรวจสอบ URL: `http://localhost:5173/auth/login`
- ไม่ใช่ `/login` หรือ `/auth/auth/login`

---

## Available Routes

### Public Routes (ไม่ต้อง login)
- `/landing` - Landing page
- `/auth/login` - Login page
- `/auth/forgot-password` - Forgot password
- `/auth/reset-password` - Reset password

### Protected Routes (ต้อง login)
- `/dashboard` - Main dashboard
- `/projects` - Project management
- `/timesheet` - Timesheet entry
- `/reports` - Reports
- `/settings` - User settings

---

## Development Commands

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start backend
npm run server

# Start frontend
npm run dev

# Run tests
npm run test
npm run test:e2e
npm run test:integration

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Port Configuration

- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`
- **Database**: Neon PostgreSQL (hosted)

---

## Next Steps

1. ✅ รัน `run-dev.bat` (หรือรัน backend + frontend manually)
2. ✅ เปิด `http://localhost:5173/auth/login`
3. ✅ Login ด้วย test account
4. ✅ Explore dashboard และ features

---

## ต้องการความช่วยเหลือเพิ่มเติม?

- ดู `START_HERE.txt` - Complete project documentation
- ดู `src/` folder - Source code
- ดู `server/` folder - Backend API code
- ดู `prisma/schema.prisma` - Database schema

Happy coding! 🚀
