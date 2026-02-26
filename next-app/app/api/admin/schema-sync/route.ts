import { NextResponse } from "next/server";
import { runSchemaSync } from "../../_lib/schema";

export async function GET() {
  try {
    const result = await runSchemaSync();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
