import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import redis from "@/lib/redis";
import crypto from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin)
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 },
      );

    const body = await request.json();
    const {
      id,
      name,
      code,
      description,
      status = "in_progress",
      progress = 0,
      startDate,
      start_date,
      endDate,
      end_date,
      budget = 0,
      managerId,
      manager_id,
      clientId,
      client_id,
      priority = "medium",
      category,
      milestones = [],
      members = [],
      tasks = [],
      contacts = [],
    } = body || {};

    if (!name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const projectId = id ?? crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const start = start_date ?? startDate ?? null;
    const end = end_date ?? endDate ?? null;
    const manager = manager_id ?? managerId ?? null;
    const client = client_id ?? clientId ?? null;

    const payload: any = {
      id: projectId,
      name,
      code: code || null,
      description: description || null,
      status,
      progress: Number(progress ?? 0),
      progress_plan: 0,
      start_date: start,
      end_date: end,
      budget: Number(budget ?? 0),
      spent: 0,
      spi: 1.0,
      cpi: 1.0,
      client_id: client,
      manager_id: manager,
      category: category || null,
      is_archived: false,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { error: createErr } = await supabaseAdmin
      .from("projects")
      .insert([payload]);
    if (createErr)
      return NextResponse.json({ error: createErr.message }, { status: 500 });

    const project_id = projectId;

    // Handle milestones if any
    if (Array.isArray(milestones) && milestones.length > 0) {
      for (const m of milestones) {
        const id = m?.id ?? crypto.randomUUID();
        const title = m?.title ?? m?.name ?? "";
        const description = m?.description ?? null;
        const due = m?.due_date ?? m?.dueDate ?? null;
        const status = m?.status ?? "pending";
        const amount = Number(m?.amount ?? 0);
        const progress = Number(m?.percentage ?? m?.progress ?? 0);

        const snakeRich: any = {
          id,
          project_id,
          title,
          description,
          status,
          due_date: due,
          created_at: nowIso,
          updated_at: nowIso,
        };
        if (amount !== 0) snakeRich.amount = amount;
        if (progress !== 0) snakeRich.progress = progress;
        const snakeMin: any = {
          id,
          project_id,
          title,
          description,
          status,
          due_date: due,
          created_at: nowIso,
          updated_at: nowIso,
        };
        const camelRich: any = {
          id,
          projectId: project_id,
          title,
          description,
          status,
          dueDate: due,
          created_at: nowIso,
          updated_at: nowIso,
        };
        if (amount !== 0) camelRich.amount = amount;
        if (progress !== 0) camelRich.progress = progress;
        const camelMin: any = {
          id,
          projectId: project_id,
          title,
          description,
          status,
          dueDate: due,
          created_at: nowIso,
          updated_at: nowIso,
        };

        const candidates = [snakeRich, snakeMin, camelRich, camelMin];

        let lastErr: any = null;
        for (const p of candidates) {
          const { error } = await supabaseAdmin
            .from("milestones")
            .insert(p as any);
          if (!error) {
            lastErr = null;
            break;
          }
          lastErr = error;
          const msg = `${error.message || ""}`;
          if (
            msg.includes("Could not find the") ||
            msg.includes("schema cache")
          )
            continue;
          break;
        }
        if (lastErr) console.error("Error creating milestones:", lastErr);
      }
    }

    // Handle team members (roles) if provided
    if (Array.isArray(members) && members.length > 0) {
      const memberPayloads = members
        .filter((m: any) => m?.user_id && m?.role)
        .map((m: any) => ({
          project_id,
          user_id: m.user_id,
          role: m.role,
          joinedAt: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        }));
      if (memberPayloads.length > 0) {
        const { error: memErr } = await supabaseAdmin
          .from("project_members")
          .insert(memberPayloads);
        if (memErr) console.error("Error creating project members:", memErr);
      }
    }

    // Handle Tasks (with Weights) and Generate Plan Points
    if (Array.isArray(tasks) && tasks.length > 0) {
      const normalized = tasks.map((t: any) => ({
        id: t?.id ?? crypto.randomUUID(),
        title: t?.title ?? t?.name ?? "",
        description: t?.description ?? null,
        status: t?.status ?? "todo",
        priority: t?.priority ?? "medium",
        weight: Number(t?.weight ?? 0),
        start: t?.start_date ?? t?.startDate ?? null,
        due: t?.due_date ?? t?.dueDate ?? t?.end_date ?? t?.endDate ?? null,
      }));

      const snakePayloads = normalized.map((t: any) => ({
        id: t.id,
        project_id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        weight: t.weight,
        start_date: t.start,
        due_date: t.due,
        created_by: "system",
        created_at: nowIso,
        updated_at: nowIso,
      }));
      const camelPayloads = normalized.map((t: any) => ({
        id: t.id,
        projectId: project_id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        weight: t.weight,
        startDate: t.start,
        dueDate: t.due,
        createdBy: "system",
        created_at: nowIso,
        updated_at: nowIso,
      }));

      let taskErr: any = null;
      for (const payloads of [snakePayloads, camelPayloads]) {
        const { error } = await supabaseAdmin
          .from("tasks")
          .insert(payloads as any);
        if (!error) {
          taskErr = null;
          break;
        }
        taskErr = error;
        const msg = `${error.message || ""}`;
        if (msg.includes("Could not find the") || msg.includes("schema cache"))
          continue;
        break;
      }
      if (taskErr) {
        console.error("Error creating tasks:", taskErr);
      }

      const planPoints: any[] = [];
      for (const t of normalized) {
        const weight = Number(t.weight || 0);
        if (weight > 0 && t.start && t.due) {
          const start = new Date(t.start);
          const end = new Date(t.due);
          const durationMs = end.getTime() - start.getTime();
          const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
          if (days > 0) {
            const dailyWeight = weight / days;
            for (let i = 0; i < days; i++) {
              const d = new Date(start);
              d.setDate(d.getDate() + i);
              const dateStr = d.toISOString().slice(0, 10);
              planPoints.push({
                id: crypto.randomUUID(),
                task_id: t.id,
                date: dateStr,
                plan_percent: Number(dailyWeight.toFixed(4)),
              });
            }
          }
        }
      }

      if (planPoints.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < planPoints.length; i += batchSize) {
          const batch = planPoints.slice(i, i + batchSize);
          const { error: ppError } = await supabaseAdmin
            .from("task_plan_points")
            .insert(batch);
          if (ppError) console.error("Error creating plan points:", ppError);
        }
      }
    }

    // Handle Contacts (Stakeholders)
    if (Array.isArray(contacts) && contacts.length > 0) {
      const contactPayloads = contacts.map((c: any) => ({
        project_id: project_id,
        name: c.name,
        position: c.position || c.role,
        email: c.email,
        phone: c.phone,
        type: c.type || "Stakeholder",
        is_key_person: c.isKeyPerson || false,
      }));

      const { error: contactErr } = await supabaseAdmin
        .from("contacts")
        .insert(contactPayloads);

      if (contactErr) console.error("Error creating contacts:", contactErr);
    }

    await redis.del("projects:all");
    return NextResponse.json({ id: project_id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
