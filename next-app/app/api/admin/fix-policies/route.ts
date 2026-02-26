import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), "fix-rls-policies.sql");
    const sql = readFileSync(sqlPath, "utf8");

    // Split SQL into individual statements
    const statements = sql.split(";").filter((s) => s.trim());

    const results = [];

    for (const statement of statements) {
      if (statement.trim()) {
        const { data, error } = await supabaseAdmin.rpc("exec_sql", {
          sql_query: statement,
        });
        if (error) {
          results.push({
            statement: statement.substring(0, 50),
            error: error.message,
          });
        } else {
          results.push({
            statement: statement.substring(0, 50),
            success: true,
          });
        }
      }
    }

    return NextResponse.json({
      message: "RLS policies fix attempted",
      results,
    });
  } catch (error) {
    console.error("Error in fix-policies route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
