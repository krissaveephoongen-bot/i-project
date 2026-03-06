import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ClientsClient from "./ClientsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clients | i-Project",
};

export default async function ClientsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

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
