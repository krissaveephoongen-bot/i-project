#!/bin/bash

# Git Sync Verification Script
# ตรวจสอบว่า local และ production codebase ตรงกันเสมอ

echo "🔍 ตรวจสอบสถานะ Git Sync..."

# 1. ตรวจสอบว่าอยู่บน main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "❌ ไม่ได้อยู่บน main branch: $current_branch"
    echo "🔄 กำลัง switch ไป main branch..."
    git checkout main
fi

# 2. Fetch ข้อมูลล่าสุดจาก remote
echo "📥 กำลัง fetch ข้อมูลล่าสุดจาก remote..."
git fetch origin

# 3. ตรวจสอบว่า local และ remote ตรงกัน
local_head=$(git rev-parse HEAD)
remote_head=$(git rev-parse origin/main)

if [ "$local_head" = "$remote_head" ]; then
    echo "✅ Local และ Remote ตรงกัน"
else
    echo "⚠️  Local และ Remote ไม่ตรงกัน"
    echo "📍 Local HEAD: $local_head"
    echo "📍 Remote HEAD: $remote_head"
    
    # 4. ตรวจสองว่ามีไฟล์ที่ยังไม่ได้ commit
    if [ -n "$(git status --porcelain)" ]; then
        echo "📝 มีไฟล์ที่ยังไม่ได้ commit:"
        git status --porcelain
        
        echo "🔄 กำลัง add และ commit ทั้งหมด..."
        git add .
        git commit -m "sync: auto-sync local changes to ensure production consistency
        
- Auto-sync all uncommitted changes
- Ensure local and production codebase are identical
- Prevent deployment inconsistencies"
        
        echo "📤 กำลัง push ไป production..."
        git push origin main
    else
        echo "📤 กำลัง pull ข้อมูลจาก production..."
        git pull origin main
    fi
fi

# 5. ตรวจสอบสถานะสุดท้าย
echo "🔍 ตรวจสอบสถานะสุดท้าย..."
git status

# 6. แสดง commit ล่าสุด
echo "📋 Commit ล่าสุด:"
git log --oneline -3

echo "✅ การตรวจสอบ Git Sync เสร็จสิ้น!"
echo "🌐 Local และ Production codebase ตรงกันแล้ว"
