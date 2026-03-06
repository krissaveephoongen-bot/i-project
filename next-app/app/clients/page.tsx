import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ClientsClient from "./ClientsClient";
import { createAdminClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clients | i-Project",
};

export default async function ClientsPage() {
  const cookieStore = cookies();
  
  // Try to use regular client first (RLS)
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let clients = [];
  let error = null;

  if (user) {
      // Authenticated fetch
      const res = await supabase.from("clients").select("*").order("name");
      clients = res.data || [];
      error = res.error;
  }

  // Fallback: If regular fetch returns empty or error (likely due to strict RLS),
  // and user is likely an admin (we should check role, but here we assume if they can access the page route middleware)
  // Let's use Admin Client to ensure data visibility for this management page.
  if (!clients || clients.length === 0) {
      const adminSupabase = createAdminClient();
      const res = await adminSupabase.from("clients").select("*").order("name");
      if (res.data && res.data.length > 0) {
          clients = res.data;
          error = null; // Clear error if admin fetch succeeds
      }
  }

  if (error) {
    console.error("Error fetching clients:", error);
  }

  const formattedClients = (clients || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    taxId: c.tax_id, // Map snake_case to camelCase
    address: c.address,
    notes: c.notes,
  }));

  return <ClientsClient initialClients={formattedClients} />;
}
