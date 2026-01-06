# 1) ยืนยันว่าเชื่อมต่อ Neon ได้จริง (psql)
psql "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  -c "SELECT version();" \
  -c "SELECT current_database() AS db, current_user AS usr;" \
  -c "SELECT inet_server_addr() AS host, inet_server_port() AS port;" \
  -c "\dt public.*" \
  -c "SELECT COUNT(*) AS user_count FROM public.users;" \
  -c "SELECT id, email, role FROM public.users ORDER BY created_at NULLS LAST LIMIT 5;"

# 2) ตรวจสอบผู้ใช้ และ verify hash ตรงกับรหัสผ่าน (ผ่านสคริปต์ที่มีใน repo)
set DATABASE_URL=postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
set LOOKUP_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/db-query.mjs

# 3) Smoke test โปรดักชัน API ด้วย credentials ปัจจุบัน
set API_BASE_URL=https://ticket-apw-api.vercel.app/api
set TEST_USER_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/prod-smoke.mjs

# 4) ทดสอบ login + เรียก /users ตรงๆ (Node one-liner)
node -e "const base='https://ticket-apw-api.vercel.app/api'; const email='jakgrits.ph@appworks.co.th'; const password='AppWorks@123!'; (async()=>{const lr=await fetch(base+'/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})}); const lb=await lr.text(); let lj; try{lj=JSON.parse(lb)}catch{lj=lb} console.log('login:',{status:lr.status,body:lj}); const token=(lj&&lj.token)||(lj&&lj.data&&lj.data.token); if(lr.status===200&&token){const ur=await fetch(base+'/users',{headers:{Authorization:'Bearer '+token}}); const ub=await ur.text(); let uj; try{uj=JSON.parse(ub)}catch{uj=ub} console.log('users:',{status:ur.status,body:Array.isArray(uj)?'array':uj});}})().catch(e=>console.error(e))"

# 5) (ทางเลือก) ถ้าจำเป็นต้องรีเซ็ตรหัสผ่านใน DB Neon นี้อีกครั้ง (inline script)
node tests/integration/db-update-password-inline.mjs "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" "jakgrits.ph@appworks.co.th" "AppWorks@123!" 10
``````bash
# ตรวจสอบ Neon และยืนยันข้อมูลสำคัญ แล้วทดสอบ API อีกครั้ง

# 1) ยืนยันการเชื่อมต่อฐานข้อมูลบน Neon ด้วย psql
psql "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  -c "SELECT version();" \
  -c "SELECT current_database() AS db, current_user AS usr;" \
  -c "SHOW search_path;" \
  -c "\dt public.*" \
  -c "SELECT COUNT(*) AS user_count FROM public.users;" \
  -c "SELECT id, email, role, is_active FROM public.users ORDER BY created_at NULLS LAST LIMIT 5;"

# 2) ตรวจสอบผู้ใช้และ verify password hash (Neon)
set DATABASE_URL=postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
set LOOKUP_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/db-query.mjs

# 3) หากต้อง reset รหัสผ่านผู้ใช้ (Neon) แบบ one-off (ปลอดภัยกับ Windows CMD)
node tests/integration/db-update-password-inline.mjs "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" "jakgrits.ph@appworks.co.th" "AppWorks@123!" 10

# 4) รันทดสอบ Production API (Smoke) ด้วย credentials ปัจจุบัน
set API_BASE_URL=https://ticket-apw-api.vercel.app/api
set TEST_USER_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
npm run test:prod

# 5) ทดสอบแบบตรง (login -> /users พร้อม bearer token)
node -e "const base='https://ticket-apw-api.vercel.app/api'; const email='jakgrits.ph@appworks.co.th'; const password='AppWorks@123!'; (async()=>{const lr=await fetch(base+'/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})}); const lb=await lr.text(); let lj; try{lj=JSON.parse(lb)}catch{lj=lb} console.log('login:',{status:lr.status,body:lj}); const token=(lj&&lj.token)||(lj&&lj.data&&lj.data.token); if(lr.status===200&&token){const ur=await fetch(base+'/users',{headers:{Authorization:'Bearer '+token}}); const ub=await ur.text(); let uj; try{uj=JSON.parse(ub)}catch{uj=ub} console.log('users:',{status:ur.status,body:Array.isArray(uj)?'array':uj});}})().catch(e=>console.error(e))"# 1) ยืนยันว่าเชื่อมต่อ Neon ได้จริง (psql)
psql "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  -c "SELECT version();" \
  -c "SELECT current_database() AS db, current_user AS usr;" \
  -c "SELECT inet_server_addr() AS host, inet_server_port() AS port;" \
  -c "\dt public.*" \
  -c "SELECT COUNT(*) AS user_count FROM public.users;" \
  -c "SELECT id, email, role FROM public.users ORDER BY created_at NULLS LAST LIMIT 5;"

# 2) ตรวจสอบผู้ใช้ และ verify hash ตรงกับรหัสผ่าน (ผ่านสคริปต์ที่มีใน repo)
set DATABASE_URL=postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
set LOOKUP_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/db-query.mjs

# 3) Smoke test โปรดักชัน API ด้วย credentials ปัจจุบัน
set API_BASE_URL=https://ticket-apw-api.vercel.app/api
set TEST_USER_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/prod-smoke.mjs

# 4) ทดสอบ login + เรียก /users ตรงๆ (Node one-liner)
node -e "const base='https://ticket-apw-api.vercel.app/api'; const email='jakgrits.ph@appworks.co.th'; const password='AppWorks@123!'; (async()=>{const lr=await fetch(base+'/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})}); const lb=await lr.text(); let lj; try{lj=JSON.parse(lb)}catch{lj=lb} console.log('login:',{status:lr.status,body:lj}); const token=(lj&&lj.token)||(lj&&lj.data&&lj.data.token); if(lr.status===200&&token){const ur=await fetch(base+'/users',{headers:{Authorization:'Bearer '+token}}); const ub=await ur.text(); let uj; try{uj=JSON.parse(ub)}catch{uj=ub} console.log('users:',{status:ur.status,body:Array.isArray(uj)?'array':uj});}})().catch(e=>console.error(e))"

# 5) (ทางเลือก) ถ้าจำเป็นต้องรีเซ็ตรหัสผ่านใน DB Neon นี้อีกครั้ง (inline script)
node tests/integration/db-update-password-inline.mjs "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" "jakgrits.ph@appworks.co.th" "AppWorks@123!" 10
``````bash
# ตรวจสอบ Neon และยืนยันข้อมูลสำคัญ แล้วทดสอบ API อีกครั้ง

# 1) ยืนยันการเชื่อมต่อฐานข้อมูลบน Neon ด้วย psql
psql "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  -c "SELECT version();" \
  -c "SELECT current_database() AS db, current_user AS usr;" \
  -c "SHOW search_path;" \
  -c "\dt public.*" \
  -c "SELECT COUNT(*) AS user_count FROM public.users;" \
  -c "SELECT id, email, role, is_active FROM public.users ORDER BY created_at NULLS LAST LIMIT 5;"

# 2) ตรวจสอบผู้ใช้และ verify password hash (Neon)
set DATABASE_URL=postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
set LOOKUP_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/db-query.mjs

# 3) หากต้อง reset รหัสผ่านผู้ใช้ (Neon) แบบ one-off (ปลอดภัยกับ Windows CMD)
node tests/integration/db-update-password-inline.mjs "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" "jakgrits.ph@appworks.co.th" "AppWorks@123!" 10

# 4) รันทดสอบ Production API (Smoke) ด้วย credentials ปัจจุบัน
set API_BASE_URL=https://ticket-apw-api.vercel.app/api
set TEST_USER_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
npm run test:prod

# 5) ทดสอบแบบตรง (login -> /users พร้อม bearer token)
node -e "const base='https://ticket-apw-api.vercel.app/api'; const email='jakgrits.ph@appworks.co.th'; const password='AppWorks@123!'; (async()=>{const lr=await fetch(base+'/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})}); const lb=await lr.text(); let lj; try{lj=JSON.parse(lb)}catch{lj=lb} console.log('login:',{status:lr.status,body:lj}); const token=(lj&&lj.token)||(lj&&lj.data&&lj.data.token); if(lr.status===200&&token){const ur=await fetch(base+'/users',{headers:{Authorization:'Bearer '+token}}); const ub=await ur.text(); let uj; try{uj=JSON.parse(ub)}catch{uj=ub} console.log('users:',{status:ur.status,body:Array.isArray(uj)?'array':uj});}})().catch(e=>console.error(e))"
``````bash
# 1) ยืนยันว่ากำลังใช้ฐานข้อมูลบน Neon ด้วย psql (ตรวจ version, db/user, ตาราง และผู้ใช้)
psql "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  -c "SELECT version();" \
  -c "SELECT current_database() AS db, current_user AS usr;" \
  -c "SHOW search_path;" \
  -c "\dt public.*" \
  -c "SELECT COUNT(*) AS user_count FROM public.users;" \
  -c "SELECT id, email, role, is_active, failed_login_attempts, locked_until FROM public.users ORDER BY created_at NULLS LAST LIMIT 5;" \
  -c "SELECT id, email, role, is_active, failed_login_attempts, locked_until FROM public.users WHERE lower(email)=lower('jakgrits.ph@appworks.co.th');"

# 2) ตรวจสอบผู้ใช้และ verify password hash กับ Neon (Windows CMD)
set DATABASE_URL=postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
set LOOKUP_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/db-query.mjs

# 3) (ทางเลือก) รีเซ็ตรหัสผ่านผู้ใช้บน Neon แบบ one-off หากยัง login ไม่ผ่าน
node tests/integration/db-update-password-inline.mjs "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" "jakgrits.ph@appworks.co.th" "AppWorks@123!" 10

# 4) Smoke test โปรดักชัน API ด้วย credentials ปัจจุบัน
set API_BASE_URL=https://ticket-apw-api.vercel.app/api
set TEST_USER_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/prod-smoke.mjs

# 5) ทดสอบแบบตรง (login -> /users พร้อม Bearer token)
node -e "const base='https://ticket-apw-api.vercel.app/api'; const email='jakgrits.ph@appworks.co.th'; const password='AppWorks@123!'; (async()=>{const lr=await fetch(base+'/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})}); const lb=await lr.text(); let lj; try{lj=JSON.parse(lb)}catch{lj=lb} console.log('login:',{status:lr.status,body:lj}); const token=(lj&&lj.token)||(lj&&lj.data&&lj.data.token); if(lr.status===200&&token){const ur=await fetch(base+'/users',{headers:{Authorization:'Bearer '+token}}); const ub=await ur.text(); let uj; try{uj=JSON.parse(ub)}catch{uj=ub} console.log('users:',{status:ur.status,body:Array.isArray(uj)?'array':uj});}})().catch(e=>console.error(e))"
``````bash
# ตรวจสอบ Neon ด้วย psql (ยืนยันกำลังใช้ฐานข้อมูลที่ระบุ)
psql "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  -c "SELECT version();" \
  -c "SELECT current_database() AS db, current_user AS usr;" \
  -c "SHOW search_path;" \
  -c "\dt public.*" \
  -c "SELECT COUNT(*) AS user_count FROM public.users;" \
  -c "SELECT id, email, role, is_active, failed_login_attempts, locked_until FROM public.users ORDER BY created_at NULLS LAST LIMIT 5;" \
  -c "SELECT id, email, role, is_active, failed_login_attempts, locked_until FROM public.users WHERE lower(email)=lower('jakgrits.ph@appworks.co.th');"

# ตรวจสอบ hash รหัสผ่านของผู้ใช้กับ DB Neon โดยตรง (Windows CMD)
set DATABASE_URL=postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
set LOOKUP_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/db-query.mjs

# (ถ้าจำเป็น) รีเซ็ตรหัสผ่านผู้ใช้บน Neon แบบ one-off
node tests/integration/db-update-password-inline.mjs "postgresql://neondb_owner:npg_BJ1iUjpYv7fo@ep-withered-river-a1o8uvr3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" "jakgrits.ph@appworks.co.th" "AppWorks@123!" 10

# รัน Production API Smoke Test ด้วย credentials ปัจจุบัน
set API_BASE_URL=https://ticket-apw-api.vercel.app/api
set TEST_USER_EMAIL=jakgrits.ph@appworks.co.th
set TEST_USER_PASSWORD=AppWorks@123!
node tests/integration/prod-smoke.mjs

# ทดสอบแบบตรง (login -> /users พร้อม Bearer token)
node -e "const base='https://ticket-apw-api.vercel.app/api'; const email='jakgrits.ph@appworks.co.th'; const password='AppWorks@123!'; (async()=>{const lr=await fetch(base+'/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})}); const lb=await lr.text(); let lj; try{lj=JSON.parse(lb)}catch{lj=lb} console.log('login:',{status:lr.status,body:lj}); const token=(lj&&lj.token)||(lj&&lj.data&&lj.data.token); if(lr.status===200&&token){const ur=await fetch(base+'/users',{headers:{Authorization:'Bearer '+token}}); const ub=await ur.text(); let uj; try{uj=JSON.parse(ub)}catch{uj=ub} console.log('users:',{status:ur.status,body:Array.isArray(uj)?'array':uj});}})().catch(e=>console.error(e))"import postgres from 'postgres';
import bcrypt from 'bcrypt';

// Usage: node db-update-password-inline.mjs <DATABASE_URL> <EMAIL> <NEW_PASSWORD> [BCRYPT_ROUNDS]
const [,, DBURL, EMAIL_ARG, NEW_PW, ROUNDS_ARG] = process.argv;
if (!DBURL || !EMAIL_ARG || !NEW_PW) {
  console.error('Usage: node db-update-password-inline.mjs <DATABASE_URL> <EMAIL> <NEW_PASSWORD> [BCRYPT_ROUNDS]');
  process.exit(1);
}
const ROUNDS = parseInt(ROUNDS_ARG || '10', 10);
const EMAIL = EMAIL_ARG.trim().toLowerCase();

const sql = postgres(DBURL, { ssl: 'require', max: 1 });

async function run() {
  try {
    const user = await sql`
      select id, email, name, role, is_active, failed_login_attempts, locked_until
      from users
      where lower(trim(email)) = ${EMAIL}
      limit 1
    `;
    if (user.length === 0) {
      console.error('User not found for email:', EMAIL);
      process.exit(1);
    }

    const hash = await bcrypt.hash(NEW_PW, ROUNDS);

    const updated = await sql`
      update users
      set password = ${hash},
          failed_login_attempts = 0,
          locked_until = null,
          is_active = true,
          updated_at = now()
      where lower(trim(email)) = ${EMAIL}
      returning id, email, is_active, failed_login_attempts, locked_until
    `;

    console.log('Updated user:', updated[0]);
    console.log('Password updated successfully.');
  } finally {
    await sql.end({ timeout: 2 });
  }
}

run().catch((e) => {
  console.error('DB update error:', e.message);
  process.exit(1);
});
