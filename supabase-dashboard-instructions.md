# 📋 หา Service Role Key จาก Supabase Dashboard

## 🔗 ลิงก์ Dashboard
- **Project URL**: https://vaunihijmwwkhqagjqjd.supabase.co
- **Direct Dashboard**: https://vaunihijmwwkhqagjqjd.supabase.co/project/default/settings/api

## 📝 ขั้นตอนการหา Service Role Key:

### 1. เข้าสู่ Supabase Dashboard
```
https://vaunihijmwwkhqagjqjd.supabase.co
```

### 2. ไปที่ Settings → API
- คลิกเมนู "Settings" ทางด้านซ้าย
- คลิก "API" ในเมนูย่อย

### 3. คัดลอก Service Role Key
- หาส่วน "Project API keys"
- คัดลอก key ที่อยู่ในช่อง "service_role" (เริ่มต้นด้วย `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 4. อัปเดต Environment Variable
เมื่อได้ Service Role Key แล้ว รันคำสั่ง:
```bash
echo "SERVICE_ROLE_KEY_ที่_คัดลอกมา" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

## 🔑 คีย์ที่ใช้งานอยู่:

### ✅ อัปเดตแล้ว:
- **NEXT_PUBLIC_SUPABASE_URL**: `https://vaunihijmwwkhqagjqjd.supabase.co`
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: `sb_publishable_MXBRHnc3b8kCjjsVaacMfQ_WwT_5g15`

### ⏳ รออัปเดต:
- **SUPABASE_SERVICE_ROLE_KEY**: ต้องไปดูใน Dashboard

## 🚀 หลังจากอัปเดต Service Role Key:
```bash
vercel --prod
node test-final-result.cjs
```

## 📊 สถานะปัจจุบัน:
- ✅ Database ใหม่พร้อมใช้งาน
- ✅ Publishable Key อัปเดตแล้ว
- ⏳ Service Role Key รออัปเดต
- 🎯 ใกล้เสร็จสมบูรณ์!
