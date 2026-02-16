/**
 * Timesheet Concurrent Work Check API
 * Detects if the entered time overlaps with existing entries (Option 3)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, projectId, userId } = body;

    if (!date || !startTime || !endTime || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: date, startTime, endTime, userId' },
        { status: 400 }
      );
    }

    // Check for overlapping entries in the database
    const { data: existingEntries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .neq('project_id', projectId || '')
      .in('status', ['pending', 'in_progress', 'done']);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to check concurrent work' },
        { status: 500 }
      );
    }

    // Check for time overlaps
    const overlappingEntries: any[] = [];
    const newStart = new Date(`2000-01-01T${startTime}`);
    const newEnd = new Date(`2000-01-01T${endTime}`);

    for (const entry of existingEntries || []) {
      if (!entry.start_time || !entry.end_time) continue;
      
      const entryStart = new Date(`2000-01-01T${entry.start_time}`);
      const entryEnd = new Date(`2000-01-01T${entry.end_time}`);

      // Check if time ranges overlap
      if (newStart < entryEnd && newEnd > entryStart) {
        const overlapStart = newStart > entryStart ? newStart : entryStart;
        const overlapEnd = newEnd < entryEnd ? newEnd : entryEnd;
        const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);

        overlappingEntries.push({
          id: entry.id,
          projectName: `Project ${entry.project_id}`,
          startTime: entry.start_time,
          endTime: entry.end_time,
          hours: entry.hours || 0,
          overlapMinutes
        });
      }
    }

    const isConcurrent = overlappingEntries.length > 0;
    const warnings: string[] = [];

    if (isConcurrent) {
      warnings.push(`พบการทำงานที่ทับซ้อนกับ ${overlappingEntries.length} รายการอื่น`);
      
      if (overlappingEntries.length > 1) {
        warnings.push('คุณกำลังบันทึกเวลาทำงานพร้อมกันในหลายโครงการ');
      }
    }

    return NextResponse.json({
      isConcurrent,
      warnings,
      requiresComment: isConcurrent,
      overlappingEntries
    });

  } catch (error) {
    console.error('Error checking concurrent work:', error);
    return NextResponse.json(
      { error: 'Failed to check concurrent work' },
      { status: 500 }
    );
  }
}
