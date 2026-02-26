"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const laborItemSchema = z.object({
  costSheetId: z.string().optional(),
  type: z.literal("labor"),
  level: z.string().optional(),
  position: z.string().optional(),
  projectRole: z.string().optional(),
  dailyRate: z.number().min(0).default(0),
  hourlyRate: z.number().min(0).default(0),
  plannedProjectMandays: z.number().min(0).default(0),
  plannedProjectManhours: z.number().min(0).default(0),
  plannedWarrantyMandays: z.number().min(0).default(0),
  plannedWarrantyManhours: z.number().min(0).default(0),
  remark: z.string().optional(),
});

const expenseItemSchema = z.object({
  costSheetId: z.string().optional(),
  type: z.literal("expense"),
  costCode: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().min(0).optional().nullable(),
  remark: z.string().optional(),
});

const costSheetSchema = z.object({
  projectId: z.string().uuid("Invalid Project ID"),
  status: z.enum(["Draft", "Submitted", "ManagerApproved", "FinalApproved"]).default("Draft"),
  items: z.array(z.union([laborItemSchema, expenseItemSchema])),
  createdBy: z.string().optional(),
});

export type CostSheetInput = z.infer<typeof costSheetSchema>;

export async function getCostSheetAction(projectId: string) {
  const supabase = createClient(cookies());

  // 1. Get Cost Sheet Header
  let { data: sheet } = await supabase
    .from("cost_sheets")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  // If not exists, create initial draft
  if (!sheet) {
    const { data: newSheet, error } = await supabase
      .from("cost_sheets")
      .insert({
        project_id: projectId,
        version: 1,
        status: "Draft",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) return { error: "Failed to init cost sheet" };
    sheet = newSheet;
  }

  // 2. Get Items
  const { data: items } = await supabase
    .from("cost_sheet_items")
    .select("*")
    .eq("cost_sheet_id", sheet.id);

  // 3. Get Catalog (Optional, could be static or another table)
  const { data: catalog } = await supabase
    .from("cost_code_catalog")
    .select("*")
    .eq("is_active", true);

  return {
    sheet,
    items: items || [],
    catalog: catalog || [],
  };
}

export async function saveCostSheetAction(input: CostSheetInput) {
  const result = costSheetSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  
  // 1. Get current sheet or create new version logic
  // For simplicity, we'll update the latest sheet or create a new version if status changed to Approved
  
  let { data: currentSheet } = await supabase
    .from("cost_sheets")
    .select("*")
    .eq("project_id", input.projectId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  let sheetId = currentSheet?.id;
  let version = currentSheet?.version || 1;

  // Logic: If status is FinalApproved, next save creates new version? 
  // Or just update current draft. Let's assume we update current sheet for now.
  
  if (!currentSheet) {
     const { data: newSheet } = await supabase.from("cost_sheets").insert({
        project_id: input.projectId,
        version: 1,
        status: input.status,
     }).select().single();
     sheetId = newSheet.id;
  } else {
    // Update status
    await supabase.from("cost_sheets").update({ status: input.status, updated_at: new Date().toISOString() }).eq("id", sheetId);
  }

  // 2. Replace Items (Delete all and insert new to handle removals easily)
  await supabase.from("cost_sheet_items").delete().eq("cost_sheet_id", sheetId);

  const dbItems = input.items.map(item => {
    if (item.type === "labor") {
      return {
        cost_sheet_id: sheetId,
        type: "labor",
        level: item.level,
        position: item.position,
        project_role: item.projectRole,
        daily_rate: item.dailyRate,
        hourly_rate: item.hourlyRate,
        planned_project_mandays: item.plannedProjectMandays,
        planned_project_manhours: item.plannedProjectManhours,
        planned_warranty_mandays: item.plannedWarrantyMandays,
        planned_warranty_manhours: item.plannedWarrantyManhours,
        remark: item.remark
      };
    } else {
      return {
        cost_sheet_id: sheetId,
        type: "expense",
        cost_code: item.costCode,
        description: item.description,
        amount: item.amount,
        remark: item.remark
      };
    }
  });

  if (dbItems.length > 0) {
    const { error } = await supabase.from("cost_sheet_items").insert(dbItems);
    if (error) return { error: "Failed to save items: " + error.message };
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { success: true, version };
}
