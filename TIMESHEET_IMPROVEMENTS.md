# Timesheet Improvements Summary

## ปรับปรุงที่ทำแล้ว (Changes Made)

### 1. ✅ เพิ่มปุ่ม "เพิ่มรายการใหม่" (Add Entry Button)

**ที่อยู่:** `next-app/app/timesheet/page.tsx`

**สิ่งที่เพิ่มเข้ามา:**

#### a) Import Plus Icon
```typescript
import { 
  // ... existing imports
  Plus,
} from 'lucide-react';
```

#### b) Handler Function `handleAddEntry()`
```typescript
const handleAddEntry = () => {
  if (!projects.length) {
    toast.error('ต้องมีโครงการอย่างน้อย 1 รายการ');
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const firstProject = projects[0].id;
  
  setModalProjectId(firstProject);
  setModalDate(today);
  setModalRows([{ 
    id: 'new',
    date: today,
    project: firstProject,
    task: '',
    startTime: '',
    endTime: '',
    hours: 0,
    description: '',
    status: 'Draft'
  }]);
  setModalOpen(true);
};
```

**หน้าที่:**
- เปิด Modal สำหรับเพิ่มรายการใหม่
- ตั้งค่าเริ่มต้น: วันนี้, โครงการแรก
- ไม่ต้องคลิกที่วันในตาราง

#### c) UI Button
```typescript
{canEdit && (
  <Button 
    onClick={handleAddEntry}
    className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-600/20"
  >
    <Plus className="h-4 w-4" /> เพิ่มรายการใหม่
  </Button>
)}
```

**เงื่อนไขแสดง:**
- ต้องมี `canEdit` = true
- ปุ่มจะแสดงเมื่อสถานะ: Draft, Rejected, หรือ Submitted (ถ้าเป็น admin)

---

### 2. ✅ ปรับปรุงการแก้ไขเวลาเมื่อไม่มีข้อมูล

**ที่อยู่:** `next-app/app/timesheet/page.tsx` (บรรทัด 170-212)

**ปัญหาเดิม:**
- เมื่อคลิกที่วันที่ไม่มีข้อมูล Modal อาจไม่แสดงอย่างถูกต้อง

**วิธีแก้:**
```typescript
const openDayEditor = (projectId: string, day: number, taskId?: string | null) => {
  // ... existing code ...
  
  if (existingEntries.length > 0) {
    // Show existing entries
    setModalRows(existingEntries.map(e => ({ ... })));
  } else {
    // Always allow adding new entry, even if no existing entries
    setModalRows([{ 
      id: 'new',
      date: dateStr,
      project: projectId,
      task: taskId || '',
      startTime: '',
      endTime: '',
      hours: 0,
      description: '',
      status: 'Draft'
    }]);
  }
  setModalOpen(true);
};
```

**ผลลัพธ์:**
- Modal จะแสดงแถวว่างเมื่อไม่มีข้อมูล
- สามารถแก้ไข/เพิ่มข้อมูลได้ทันที
- ไม่ต้องเปิดโหมดแก้ไขก่อน

---

## การใช้งาน (Usage)

### วิธีที่ 1: ใช้ปุ่ม "เพิ่มรายการใหม่" (Recommended for Quick Add)
```
1. คลิก "เพิ่มรายการใหม่" (ปุ่มสีเขียว)
2. Modal เปิดด้วย:
   - วันที่: วันนี้
   - โครงการ: โครงการแรก
   - ชั่วโมง: 0 (ต้องกรอก)
3. กรอกข้อมูลและบันทึก
```

**ข้อดี:**
- รวดเร็ว
- ไม่ต้องเปิดโหมดแก้ไข
- ตั้งค่าเริ่มต้นให้แล้ว

---

### วิธีที่ 2: ใช้ "แก้ไขเวลา" + คลิกวัน (For Multiple Edits)
```
1. คลิก "แก้ไขเวลา"
2. คลิกที่วันที่ต้องการ
3. Modal เปิด (มี/ไม่มีข้อมูลเดิม)
4. แก้ไข/เพิ่มข้อมูล
5. บันทึก
```

**ข้อดี:**
- สามารถแก้ไขหลายวัน
- มองเห็นข้อมูลตาราง
- รองรับเวลาที่มีอยู่และเพิ่มใหม่

---

## พฤติกรรม Modal (Modal Behavior)

| สถานการณ์ | วิธี | ผลลัพธ์ |
|---------|------|--------|
| วันที่มี 1 entry | คลิกวัน | แสดง entry นั้น + ปุ่มลบ |
| วันที่มี 2+ entries | คลิกวัน | แสดงทั้งหมด + ปุ่มลบ |
| วันที่ไม่มี entry | คลิกวัน | แสดง 1 แถวว่าง + ปุ่มบันทึก |
| ใช้ "Add Entry" | คลิกปุ่ม | แสดง 1 แถวว่าง (วันนี้) |
| การแก้ไข existing | พิมพ์ใหม่ | อัปเดตเมื่อบันทึก |
| ลบ entry | คลิก X | ลบเมื่อบันทึก |

---

## Validation Rules (กฎตรวจสอบ)

```typescript
// ชั่วโมง (Hours)
- ต้อง > 0 เพื่อบันทึก
- ได้รับ 0 ถูกละเว้น

// วันที่ (Date)
- ต้องในเดือนปัจจุบัน
- สามารถแก้ไขได้ในโมดอล

// โครงการ (Project)
- ต้องมี
- เลือก Default = โครงการแรก

// Task
- ทำเลือก
- ว่างได้ = General Work
```

---

## สถานะปุ่ม (Button States)

| สถานะ Timesheet | Add Entry | Edit Mode | Submit |
|--------------|-----------|-----------|--------|
| Draft | ✓ | ✓ | ✓ |
| Submitted | ✓* | ✓* | ✗ |
| Approved | ✗ | ✗ | ✗ |
| Rejected | ✓ | ✓ | ✓ |

*เฉพาะ admin/manager

---

## Error Handling

```typescript
// ถ้าไม่มีโครงการ
handleAddEntry() → toast.error('ต้องมีโครงการอย่างน้อย 1 รายการ')

// ถ้าชั่วโมง = 0
save() → entry ถูกข้าม (ไม่บันทึก)

// ถ้า API ล้มเหลว
saveDayEditor() → toast.error('บันทึกข้อมูลล้มเหลว')
```

---

## Technical Details

**File ที่แก้ไข:**
- `next-app/app/timesheet/page.tsx`

**Component ที่เกี่ยวข้อง:**
- `TimesheetModal` - รับ modalRows และแสดง form
- `MonthlyView` - แสดงตาราง + คลิกวัน

**State ที่ใช้:**
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalProjectId, setModalProjectId] = useState<string>('');
const [modalDate, setModalDate] = useState<string>('');
const [modalRows, setModalRows] = useState<ModalRow[]>([]);
```

**Type:**
```typescript
type ModalRow = {
  id: string;
  date: string;
  project: string;
  task: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
  status: string;
}
```

---

## Performance Considerations

- ✓ `useCallback` ไม่ใช่ (handlers เรียกเมื่อ click เท่านั้น)
- ✓ Modal lazy render (ปิดตามค่าเริ่มต้น)
- ✓ No extra re-renders (state managed correctly)
- ✓ Toast notifications ไม่ block UI

---

## Testing Scenarios

### Scenario 1: ไม่มีข้อมูลเลย
```
1. เปิดหน้า Timesheet (ครั้งแรก)
2. คลิก "เพิ่มรายการใหม่"
   ✓ Modal แสดง 1 แถวว่าง (วันนี้)
3. กรอก "8 ชั่วโมง" + Project
4. คลิก "บันทึก"
   ✓ Data บันทึก + ตารางอัปเดต
```

### Scenario 2: มีข้อมูลแล้ว
```
1. คลิก "แก้ไขเวลา"
2. คลิกที่วันที่มี entry
   ✓ Modal แสดง entry เดิม
3. เปลี่ยนชั่วโมง
4. คลิก "บันทึก"
   ✓ Entry อัปเดต
```

### Scenario 3: เพิ่มและแก้ไขรวม
```
1. คลิก "แก้ิขเวลา"
2. คลิกวันที่มี 1 entry
   ✓ Modal แสดง entry นั้น
3. คลิก "+ เพิ่มแถว"
   ✓ แถวใหม่ว่างเพิ่ม
4. กรอกข้อมูลแถวใหม่
5. บันทึก
   ✓ Entry เดิมอัปเดต + entry ใหม่สร้าง
```

---

## Documentation Files Created

1. **TIMESHEET_USAGE_GUIDE.md** - คำแนะนำการใช้งาน
2. **TIMESHEET_IMPROVEMENTS.md** - นี่เองคือไฟล์นี้

---

## Summary

✅ **เพิ่ม:** ปุ่ม "เพิ่มรายการใหม่" (Green button)
✅ **ปรับปรุง:** Modal แสดงแถวว่างแม้ไม่มีข้อมูล
✅ **รักษา:** ความเข้ากันได้กับวิธีเดิม (Edit Mode)
✅ **ทดสอบ:** ทั้ง 3 scenario ข้างต้น
✅ **เอกสาร:** คู่มือการใช้งานสมบูรณ์
