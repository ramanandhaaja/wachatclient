import { NextResponse } from "next/server";

// Event CRUD handlers are currently disabled.
// To re-enable, implement GET/PUT/DELETE using createClient() from @/lib/supabase/server.

export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
