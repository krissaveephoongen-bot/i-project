import { ok } from "../../_lib/db";
import { supabase } from "@/app/lib/supabaseClient";

export async function GET() {
  try {
    const { data: projRows } = await supabase
      .from("projects")
      .select("budget,remaining,spi");
    const { data: riskRows } = await supabase.from("risks").select("id,status");
    const totalValue = (projRows || []).reduce(
      (s: number, p: any) => s + Number(p.budget || 0),
      0,
    );
    const billingForecast = (projRows || []).reduce(
      (s: number, p: any) => s + Number(p.remaining || 0),
      0,
    );
    const activeIssues = (riskRows || []).filter(
      (r: any) => String(r.status || "").toLowerCase() !== "closed",
    ).length;
    const avgSpi = (projRows || []).length
      ? (projRows || []).reduce(
          (s: number, p: any) => s + Number(p.spi || 0),
          0,
        ) / (projRows || []).length
      : 1;
    return ok({ totalValue, activeIssues, billingForecast, avgSpi }, 200);
  } catch (error) {
    return ok(
      { totalValue: 0, activeIssues: 0, billingForecast: 0, avgSpi: 1 },
      200,
    );
  } finally {
  }
}
