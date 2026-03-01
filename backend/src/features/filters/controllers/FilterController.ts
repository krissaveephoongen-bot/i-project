import { Request, Response } from "express";
import { getDbClient } from "@/shared/database";
import { sql } from "drizzle-orm";

export class FilterController {
  static async getFilterOptions(req: Request, res: Response) {
    try {
      const { db } = getDbClient();
      if (!db) {
        return res
          .status(500)
          .json({ error: "Database connection not available" });
      }

      // Get unique project statuses
      const projectStatuses = await db.execute(sql`
        SELECT DISTINCT status as value, 
               CASE 
                 WHEN status = 'todo' THEN 'To Do'
                 WHEN status = 'in_progress' THEN 'In Progress'
                 WHEN status = 'in_review' THEN 'In Review'
                 WHEN status = 'done' THEN 'Done'
                 WHEN status = 'pending' THEN 'Pending'
                 WHEN status = 'approved' THEN 'Approved'
                 WHEN status = 'rejected' THEN 'Rejected'
                 WHEN status = 'active' THEN 'Active'
                 WHEN status = 'inactive' THEN 'Inactive'
                 ELSE INITCAP(status)
               END as label
        FROM projects 
        WHERE status IS NOT NULL
        ORDER BY label
      `);

      // Get unique project categories
      const projectCategories = await db.execute(sql`
        SELECT DISTINCT category as value, 
               COALESCE(category, 'Uncategorized') as label
        FROM projects 
        WHERE category IS NOT NULL AND category != ''
        ORDER BY label
      `);

      // Get unique task statuses
      const taskStatuses = await db.execute(sql`
        SELECT DISTINCT status as value,
               CASE 
                 WHEN status = 'todo' THEN 'To Do'
                 WHEN status = 'in_progress' THEN 'In Progress'
                 WHEN status = 'in_review' THEN 'In Review'
                 WHEN status = 'done' THEN 'Done'
                 WHEN status = 'pending' THEN 'Pending'
                 WHEN status = 'approved' THEN 'Approved'
                 WHEN status = 'rejected' THEN 'Rejected'
                 WHEN status = 'active' THEN 'Active'
                 WHEN status = 'inactive' THEN 'Inactive'
                 ELSE INITCAP(status)
               END as label
        FROM tasks 
        WHERE status IS NOT NULL
        ORDER BY label
      `);

      // Get unique task priorities
      const taskPriorities = await db.execute(sql`
        SELECT DISTINCT priority as value,
               CASE 
                 WHEN priority = 'low' THEN 'Low'
                 WHEN priority = 'medium' THEN 'Medium'
                 WHEN priority = 'high' THEN 'High'
                 ELSE INITCAP(priority)
               END as label
        FROM tasks 
        WHERE priority IS NOT NULL
        ORDER BY 
          CASE priority 
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
            ELSE 4
          END
      `);

      // Get unique task categories
      const taskCategories = await db.execute(sql`
        SELECT DISTINCT category as value, 
               COALESCE(category, 'Uncategorized') as label
        FROM tasks 
        WHERE category IS NOT NULL AND category != ''
        ORDER BY label
      `);

      // Get expense categories
      const expenseCategories = await db.execute(sql`
        SELECT DISTINCT category as value,
               CASE 
                 WHEN category = 'travel' THEN 'Travel'
                 WHEN category = 'supplies' THEN 'Supplies'
                 WHEN category = 'equipment' THEN 'Equipment'
                 WHEN category = 'training' THEN 'Training'
                 WHEN category = 'other' THEN 'Other'
                 ELSE INITCAP(category)
               END as label
        FROM expenses 
        WHERE category IS NOT NULL
        ORDER BY label
      `);

      // Get expense statuses
      const expenseStatuses = await db.execute(sql`
        SELECT DISTINCT status as value,
               CASE 
                 WHEN status = 'pending' THEN 'Pending'
                 WHEN status = 'approved' THEN 'Approved'
                 WHEN status = 'rejected' THEN 'Rejected'
                 WHEN status = 'reimbursed' THEN 'Reimbursed'
                 ELSE INITCAP(status)
               END as label
        FROM expenses 
        WHERE status IS NOT NULL
        ORDER BY label
      `);

      // Get user roles
      const userRoles = await db.execute(sql`
        SELECT DISTINCT role as value,
               CASE 
                 WHEN role = 'admin' THEN 'Administrator'
                 WHEN role = 'manager' THEN 'Manager'
                 WHEN role = 'employee' THEN 'Employee'
                 ELSE INITCAP(role)
               END as label
        FROM users 
        WHERE role IS NOT NULL
        ORDER BY label
      `);

      // Get clients
      const clients = await db.execute(sql`
        SELECT id as value, name as label
        FROM clients 
        WHERE name IS NOT NULL
        ORDER BY label
      `);

      // Get users
      const users = await db.execute(sql`
        SELECT id as value, 
               CONCAT(first_name, ' ', last_name) as label
        FROM users 
        WHERE first_name IS NOT NULL AND last_name IS NOT NULL
        ORDER BY label
      `);

      const filterOptions = {
        projectStatuses: projectStatuses,
        projectCategories: projectCategories,
        taskStatuses: taskStatuses,
        taskPriorities: taskPriorities,
        taskCategories: taskCategories,
        expenseCategories: expenseCategories,
        expenseStatuses: expenseStatuses,
        userRoles: userRoles,
        clients: clients,
        users: users,
      };

      return res.json(filterOptions);
    } catch (error) {
      console.error("Error fetching filter options:", error);
      return res.status(500).json({ error: "Failed to fetch filter options" });
    }
  }
}
