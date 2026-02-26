import { supabase } from "../supabaseClient";
import {
  Message,
  MessageInsert,
  MessageUpdate,
  Thread,
  ThreadInsert,
  ThreadUpdate,
  MessageWithSender,
  ThreadWithDetails,
} from "../../types/database.types";

export class MessageService {
  // Fetch all threads for the current user
  static async fetchUserThreads(): Promise<ThreadWithDetails[]> {
    const { data, error } = await supabase
      .from("threads")
      .select(
        `
        *,
        created_by_user:profiles(id, name, avatar_url),
        members:thread_members(user_id, joined_at, user:profiles(id, name, avatar_url)),
        messages:messages(id, body, created_at, edited_at, sender:profiles(id, name, avatar_url))
      `,
      )
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Error fetching user threads:", error);
      throw new Error("Failed to fetch user threads");
    }

    return data as ThreadWithDetails[];
  }

  // Fetch a single thread with all messages
  static async fetchThreadById(
    threadId: string,
  ): Promise<ThreadWithDetails | null> {
    const { data, error } = await supabase
      .from("threads")
      .select(
        `
        *,
        created_by_user:profiles(id, name, avatar_url),
        members:thread_members(user_id, joined_at, user:profiles(id, name, avatar_url)),
        messages:messages(id, body, created_at, edited_at, sender:profiles(id, name, avatar_url))
      `,
      )
      .eq("id", threadId)
      .single();

    if (error) {
      console.error("Error fetching thread:", error);
      throw new Error("Failed to fetch thread");
    }

    return data as ThreadWithDetails;
  }

  // Create a new thread
  static async createThread(thread: ThreadInsert): Promise<Thread> {
    const { data, error } = await supabase
      .from("threads")
      .insert(thread)
      .select()
      .single();

    if (error) {
      console.error("Error creating thread:", error);
      throw new Error("Failed to create thread");
    }

    return data as Thread;
  }

  // Add user to thread
  static async addThreadMember(
    threadId: string,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("thread_members")
      .insert({ thread_id: threadId, user_id: userId });

    if (error) {
      console.error("Error adding thread member:", error);
      throw new Error("Failed to add thread member");
    }
  }

  // Remove user from thread
  static async removeThreadMember(
    threadId: string,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("thread_members")
      .delete()
      .eq("thread_id", threadId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing thread member:", error);
      throw new Error("Failed to remove thread member");
    }
  }

  // Fetch messages for a thread
  static async fetchThreadMessages(
    threadId: string,
  ): Promise<MessageWithSender[]> {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles(id, name, avatar_url)
      `,
      )
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching thread messages:", error);
      throw new Error("Failed to fetch thread messages");
    }

    return data as MessageWithSender[];
  }

  // Send a message
  static async sendMessage(message: MessageInsert): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }

    return data as Message;
  }

  // Update a message
  static async updateMessage(
    id: string,
    updates: MessageUpdate,
  ): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .update({ ...updates, edited_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating message:", error);
      throw new Error("Failed to update message");
    }

    return data as Message;
  }

  // Delete a message
  static async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      console.error("Error deleting message:", error);
      throw new Error("Failed to delete message");
    }
  }

  // Subscribe to real-time messages for a thread
  static subscribeToThreadMessages(
    threadId: string,
    callback: (payload: any) => void,
  ) {
    return supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        callback,
      )
      .subscribe();
  }

  // Unsubscribe from thread messages
  static unsubscribeFromThreadMessages(subscription: any) {
    supabase.removeChannel(subscription);
  }

  // Search messages
  static async searchMessages(query: string): Promise<MessageWithSender[]> {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles(id, name, avatar_url),
        thread:threads(id, title)
      `,
      )
      .ilike("body", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error searching messages:", error);
      throw new Error("Failed to search messages");
    }

    return data as MessageWithSender[];
  }
}
