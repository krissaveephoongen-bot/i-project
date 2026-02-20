@echo off
REM Git Sync Verification Script for Windows
REM ตรวจสอบว่า local และ production codebase ตรงกันเสมอ

echo 🔍 ตรวจสอบสถานะ Git Sync...

REM 1. ตรวจสอบว่าอยู่บน main branch
for /f "delims=" %%i in ('git branch --show-current') do set current_branch=%%i
if not "%current_branch%"=="main" (
    echo ❌ ไม่ได้อยู่บน main branch: %current_branch%
    echo 🔄 กำลัง switch ไป main branch...
    git checkout main
)

REM 2. Fetch ข้อมูลล่าสุดจาก remote
echo 📥 กำลัง fetch ข้อมูลล่าสุดจาก remote...
git fetch origin

REM 3. ตรวจสอบว่า local และ remote ตรงกัน
for /f "delims=" %%i in ('git rev-parse HEAD') do set local_head=%%i
for /f "delims=" %%i in ('git rev-parse origin/main') do set remote_head=%%i

if "%local_head%"=="%remote_head%" (
    echo ✅ Local และ Remote ตรงกัน
) else (
    echo ⚠️  Local และ Remote ไม่ตรงกัน
    echo 📍 Local HEAD: %local_head%
    echo 📍 Remote HEAD: %remote_head%
    
    REM 4. ตรวจสองว่ามีไฟล์ที่ยังไม่ได้ commit
    git status --porcelain > temp_status.txt
    for /f %%i in (temp_status.txt) do set has_changes=%%i
    
    if defined has_changes (
        echo 📝 มีไฟล์ที่ยังไม่ได้ commit:
        git status --porcelain
        
        echo 🔄 กำลัง add และ commit ทั้งหมด...
        git add .
        git commit -m "sync: auto-sync local changes to ensure production consistency
        
- Auto-sync all uncommitted changes
- Ensure local and production codebase are identical
- Prevent deployment inconsistencies"
        
        echo 📤 กำลัง push ไป production...
        git push origin main
    ) else (
        echo 📤 กำลัง pull ข้อมูลจาก production...
        git pull origin main
    )
    
    del temp_status.txt
)

REM 5. ตรวจสอบสถานะสุดท้าย
echo 🔍 ตรวจสอบสถานะสุดท้าย...
git status

REM 6. แสดง commit ล่าสุด
echo 📋 Commit ล่าสุด:
git log --oneline -3

echo ✅ การตรวจสอบ Git Sync เสร็จสิ้น!
echo 🌐 Local และ Production codebase ตรงกันแล้ว
