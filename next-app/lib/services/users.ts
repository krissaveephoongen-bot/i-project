import { supabase } from "../supabaseClient";
import { User, UserInsert, UserUpdate } from "../../types/database.types";
import bcrypt from "bcryptjs";

export class UserService {
  // Fetch all users
  static async fetchUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      // .eq('isDeleted', false)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }

    return data as User[];
  }

  // Fetch a single user by ID
  static async fetchUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      // .eq('isDeleted', false)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }

    return data as User;
  }

  // Create a new user with hashed password
  static async createUser(
    user: UserInsert & { password: string },
  ): Promise<User> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }

    return data as User;
  }

  // Update an existing user
  static async updateUser(id: string, updates: UserUpdate): Promise<User> {
    // Handle password update separately - note: password field not in current User type
    // This would need to be added to the database schema
    let safeUpdates = { ...updates };
    // if (updates.password) {
    //   const hashedPassword = await bcrypt.hash(updates.password, 10)
    //   safeUpdates.password = hashedPassword
    // }

    // Add updated timestamp
    safeUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }

    return data as User;
  }

  // Soft delete a user
  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }

  // Fetch users by role
  static async fetchUsersByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", role)
      // .eq('isDeleted', false)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching users by role:", error);
      throw new Error("Failed to fetch users by role");
    }

    return data as User[];
  }

  // Fetch users by department
  static async fetchUsersByDepartment(department: string): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("department", department)
      // .eq('isDeleted', false)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching users by department:", error);
      throw new Error("Failed to fetch users by department");
    }

    return data as User[];
  }

  // Update user role
  static async updateUserRole(id: string, role: string): Promise<User> {
    return this.updateUser(id, { role });
  }

  // Update user department
  static async updateUserDepartment(
    id: string,
    department: string,
  ): Promise<User> {
    return this.updateUser(id, { department });
  }

  // Search users by name or email
  static async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      // .eq('isDeleted', false)
      .order("name", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error searching users:", error);
      throw new Error("Failed to search users");
    }

    return data as User[];
  }

  // Authenticate user
  static async authenticateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return null;
    }

    // Note: Password authentication not implemented as password field not in current schema
    // const isValidPassword = await bcrypt.compare(password, user.password)
    // if (!isValidPassword) {
    //   return null
    // }

    return user as User;
  }

  // Get user profile with related data
  static async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        managed_projects:projects(id, name, status, progress, budget, spent),
        assigned_tasks:tasks(id, title, status, priority, dueDate, projectId),
        time_entries:time_entries(id, date, hours, description, status, projectId),
        project_members:project_members(id, projectId, role)
      `,
      )
      .eq("id", userId)
      // .eq('isDeleted', false)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch user profile");
    }

    return data;
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<any> {
    const profile = await this.getUserProfile(userId);

    const stats = {
      totalProjects: profile.managed_projects?.length || 0,
      activeProjects:
        profile.managed_projects?.filter((p: any) => p.status === "in_progress")
          .length || 0,
      totalTasks: profile.assigned_tasks?.length || 0,
      completedTasks:
        profile.assigned_tasks?.filter((t: any) => t.status === "done")
          .length || 0,
      totalHours:
        profile.time_entries?.reduce(
          (sum: number, entry: any) => sum + (entry.hours || 0),
          0,
        ) || 0,
      totalEarnings:
        (profile.time_entries?.reduce(
          (sum: number, entry: any) => sum + (entry.hours || 0),
          0,
        ) || 0) * (profile.hourlyRate || 0),
    };

    return stats;
  }

  // Update user status (activate/deactivate)
  // static async updateUserStatus(id: string, isActive: boolean): Promise<User> {
  //   return this.updateUser(id, { isActive })
  // }

  // Reset user password
  static async resetUserPassword(
    id: string,
    newPassword: string,
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // const { error } = await supabase
    //   .from('users')
    //   .update({
    //     password: hashedPassword,
    //     resetToken: null,
    //     resetTokenExpiry: null,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', id)

    // if (error) {
    //   console.error('Error resetting password:', error)
    //   throw new Error('Failed to reset password')
    // }
  }

  // Get active users count
  static async getActiveUsersCount(): Promise<number> {
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    // .eq('isActive', true)
    // .eq('isDeleted', false)

    if (error) {
      console.error("Error getting active users count:", error);
      throw new Error("Failed to get active users count");
    }

    return count || 0;
  }

  // Get users by status
  static async fetchUsersByStatus(isActive: boolean): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      // .eq('isActive', isActive)
      // .eq('isDeleted', false)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching users by status:", error);
      throw new Error("Failed to fetch users by status");
    }

    return data as User[];
  }
}
