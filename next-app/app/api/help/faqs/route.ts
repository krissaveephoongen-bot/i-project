import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    // Mock data for FAQs - in real app, this would come from database
    const faqs = [
      {
        id: "1",
        question: "How do I create a new project?",
        answer:
          'To create a new project, navigate to the Projects page and click the "Create Project" button. Fill in the required information including project name, description, start date, and budget. Click "Save" to create the project.',
        category: "projects",
        views: 245,
      },
      {
        id: "2",
        question: "How do I add team members to a project?",
        answer:
          'Go to the project details page and click on the "Team" tab. Click "Add Team Member" and search for the user you want to add. Select their role and permissions, then click "Add".',
        category: "team",
        views: 189,
      },
      {
        id: "3",
        question: "How do I track project progress?",
        answer:
          "You can track project progress through the Overview tab which shows overall progress, or through the Tasks tab for detailed task-level progress. The system automatically calculates progress based on completed tasks and milestones.",
        category: "tracking",
        views: 156,
      },
      {
        id: "4",
        question: "How do I generate reports?",
        answer:
          'Navigate to the Reports section and select the type of report you want to generate. You can filter by date range, project, and team members. Click "Generate Report" to create and download the report.',
        category: "reports",
        views: 134,
      },
      {
        id: "5",
        question: "What are the different user roles?",
        answer:
          "The system has three main roles: Admin (full system access), Manager (project management and team oversight), and Employee (assigned tasks and time tracking). Each role has different permissions and access levels.",
        category: "users",
        views: 198,
      },
      {
        id: "6",
        question: "How do I reset my password?",
        answer:
          'Click on your profile in the sidebar and select "Change Password". Enter your current password and new password, then confirm the change. You can also use the "Forgot Password" link on the login page.',
        category: "security",
        views: 87,
      },
      {
        id: "7",
        question: "How do I export project data?",
        answer:
          'Go to the project page and click the "Export" button. You can export to CSV, Excel, or PDF format. Select the data you want to include and click "Export".',
        category: "data",
        views: 76,
      },
      {
        id: "8",
        question: "What is the difference between tasks and milestones?",
        answer:
          "Tasks are individual work items that need to be completed, while milestones are major achievements or checkpoints in a project. Milestones typically represent the completion of multiple tasks.",
        category: "projects",
        views: 92,
      },
    ];

    return NextResponse.json(faqs, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}
