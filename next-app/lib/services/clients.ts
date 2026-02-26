import { supabase } from "../supabaseClient";
import { Client, ClientInsert, ClientUpdate } from "../../types/database.types";

export class ClientService {
  // Fetch all clients
  static async fetchClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching clients:", error);
      throw new Error("Failed to fetch clients");
    }

    return data as Client[];
  }

  // Fetch a single client by ID
  static async fetchClientById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching client:", error);
      throw new Error("Failed to fetch client");
    }

    return data as Client;
  }

  // Create a new client
  static async createClient(client: ClientInsert): Promise<Client> {
    const { data, error } = await supabase
      .from("clients")
      .insert(client)
      .select()
      .single();

    if (error) {
      console.error("Error creating client:", error);
      throw new Error("Failed to create client");
    }

    return data as Client;
  }

  // Update an existing client
  static async updateClient(
    id: string,
    updates: ClientUpdate,
  ): Promise<Client> {
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating client:", error);
      throw new Error("Failed to update client");
    }

    return data as Client;
  }

  // Delete a client
  static async deleteClient(id: string): Promise<void> {
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      console.error("Error deleting client:", error);
      throw new Error("Failed to delete client");
    }
  }

  // Search clients by name or email
  static async searchClients(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order("name", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error searching clients:", error);
      throw new Error("Failed to search clients");
    }

    return data as Client[];
  }

  // Get client with related projects and contacts
  static async getClientWithDetails(id: string): Promise<any> {
    const { data, error } = await supabase
      .from("clients")
      .select(
        `
        *,
        projects:projects(id, name, status, budget, manager_id),
        contacts:contacts(id, name, position, email, phone, is_key_person)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching client details:", error);
      throw new Error("Failed to fetch client details");
    }

    return data;
  }
}
