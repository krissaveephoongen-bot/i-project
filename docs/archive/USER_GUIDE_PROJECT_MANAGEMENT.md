# Project Management Tool - User Guide

Complete walkthrough for using the Project Management Tool with timesheet tracking.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Task Management](#task-management)
4. [Timesheet](#timesheet)
5. [Approvals (Managers)](#approvals-managers)
6. [Tips & Tricks](#tips--tricks)
7. [FAQ](#faq)

## Getting Started

### Logging In
1. Open the application in your browser
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to the Dashboard

### Navigating the Application
The main menu has four tabs:
- **Dashboard** - Overview of projects and work
- **Task Management** - Manage tasks and track progress
- **Timesheet** - Log hours and submit timesheets
- **Approvals** - Review and approve timesheets (managers only)

## Dashboard

The Dashboard provides a high-level overview of your work.

### Dashboard Sections

#### 1. Key Metrics
Shows:
- **Total Projects**: Number of active projects
- **Active Projects**: Projects currently in progress
- **Average Progress**: Overall completion percentage
- **Team Members**: Total people across projects

#### 2. Budget Overview
Shows:
- Total project budget across all projects
- Amount spent to date
- Remaining budget
- Budget utilization percentage

#### 3. Hours Summary
Shows:
- Allocated hours for all tasks
- Hours logged in timesheets
- Variance between allocated and logged

#### 4. Projects Table
Shows all projects with:
- Project name and status
- Overall progress bar
- Task completion (completed/total)
- Team member count
- Budget spent vs total budget

#### 5. My Tasks Table
Shows your assigned tasks with:
- Task title
- Current status
- Progress percentage
- Due date
- Hours spent vs estimated

### Using the Dashboard
1. Click on a project name to see details
2. Use status filter to find specific projects
3. Check budget section to monitor spending
4. Review task list to prioritize work
5. Look at team section to see who's assigned

## Task Management

Manage all project tasks in one place.

### Creating a Task

1. **Select Project**
   - Use dropdown at top to select project
   - Only enabled after project selection

2. **Click "Add Task"**
   - Opens task creation modal

3. **Fill in Details**
   - **Task Title**: Brief name for the task (required)
   - **Description**: Detailed description (optional)
   - **Status**: Choose from TODO, In Progress, In Review, Done, Blocked
   - **Priority**: Low, Medium, High, Urgent
   - **Assignee**: Who will do this work
   - **Due Date**: When task should be complete
   - **Estimated Hours**: How many hours expected
   - **Progress**: Current completion percentage

4. **Optional Fields**
   - **Planned Start Date**: When work should begin
   - **Planned End Date**: Deadline for work
   - **Progress Weight**: Importance for S-curve calculation

5. **Click "OK"** to create

### Viewing Tasks

The Task Management tab shows all tasks in a table:
- **Task** - Click to view details
- **Status** - Color-coded (blue=todo, orange=progress, green=done, red=blocked)
- **Priority** - High priority tasks shown in red
- **Assignee** - Person responsible for task
- **Progress** - Visual bar showing completion
- **Hours** - Actual vs estimated hours
- **Due Date** - When task is due

### Editing a Task

1. Find the task in the table
2. Click the **Edit** button (pencil icon)
3. Update desired fields
4. Click "OK" to save

### Deleting a Task

1. Find the task in the table
2. Click the **Delete** button (trash icon)
3. Confirm deletion

### Viewing Task Details

Click on task title to open detail view showing:
- Full description
- Current progress
- Time tracking
- Team comments
- Status history

### Tracking Task Progress

1. Open Task Management
2. Find your task
3. Click to open details
4. **Details Tab** shows:
   - Task information
   - Progress percentage (0-100%)
   - Status
   - Hours data

5. **Timesheet Tab** shows:
   - Time logged for this task
   - Weekly summary
   - Submit hours for approval

### Task Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| **TODO** | Not started | Assign and plan work |
| **IN_PROGRESS** | Currently working | Log time daily |
| **IN_REVIEW** | Waiting for feedback | Wait for approval |
| **DONE** | Completed | No more work needed |
| **BLOCKED** | Waiting on something | Document blocker |

## Timesheet

Log your working hours and submit timesheets for approval.

### Daily Time Logging

1. **Go to Timesheet Tab**
2. **Select Date**
   - Click date picker
   - Choose date you worked
3. **Enter Hours**
   - Input hours worked (0.5 to 24 hours)
   - Use 0.5 increments (0.5, 1, 1.5, etc.)
4. **Add Description** (optional)
   - What work did you do?
   - Which task were you working on?
5. **Click "Add Entry"**
   - Entry saved as DRAFT

### Weekly Summary

The timesheet shows a summary for the current week:
- **Total Hours**: Sum of all entries this week
- **Draft Hours**: Hours not yet submitted
- **Submitted**: Count of submitted entries
- **Approved**: Count of approved entries

### Weekly Table

Shows all your entries for the week:
- **Date**: Day worked
- **Hours**: Hours logged
- **Description**: What you worked on
- **Status**: DRAFT, SUBMITTED, APPROVED, REJECTED
- **Actions**: Edit or delete (draft only)

### Editing an Entry

1. Find entry in weekly table
2. Entry must be in DRAFT status
3. Click "Edit"
4. Change date, hours, or description
5. Click "Update Entry"

### Deleting an Entry

1. Find entry in weekly table
2. Entry must be in DRAFT status
3. Click delete (trash icon)
4. Confirm deletion

### Submitting Timesheet

1. **Log all hours for the week**
2. **Review draft hours**
   - Check for accuracy
   - Verify descriptions
3. **Click "Submit Week for Approval"**
   - All DRAFT entries become SUBMITTED
   - Manager receives notification
4. **Wait for approval**
   - Manager reviews and approves/rejects
   - You'll receive notification

### Timesheet Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| **DRAFT** | Saved but not submitted | Edit or add more entries |
| **SUBMITTED** | Waiting for manager approval | Wait for response |
| **APPROVED** | Manager approved | Hours counted toward project |
| **REJECTED** | Manager rejected | Fix issues and resubmit |

### Tips for Timesheet Entry
- Log time daily, don't wait until week's end
- Be specific in descriptions
- Include task references
- Keep hours accurate (not rounded)
- Submit before deadline
- If rejected, fix and resubmit promptly

## Approvals (Managers)

Managers approve timesheets from their team members.

### Accessing Approvals

1. Click **Approvals** tab
   - Only visible if you're a manager
2. Shows pending timesheet entries

### Approval Dashboard

Shows summary:
- **Pending Approval**: Count of entries to review
- **Total Hours**: Hours across all entries
- **Avg Hours/Entry**: Average hours per entry

### Reviewing Entries

The approval table shows:
- **Employee**: Who submitted the entry
- **Project**: Which project they worked on
- **Date**: Date of work
- **Hours**: How many hours logged
- **Description**: What they did
- **Status**: Current status (SUBMITTED, APPROVED, REJECTED)
- **Actions**: Approve or reject buttons

### Approving an Entry

1. Find entry to review
2. Click **Approve** button (✓ icon)
3. Confirm approval
4. Entry status changes to APPROVED
5. Employee receives notification

### Rejecting an Entry

1. Find entry to review
2. Click **Reject** button (✗ icon)
3. Rejection modal opens
4. Enter reason for rejection:
   - What's wrong?
   - What needs to be fixed?
   - Any additional notes?
5. Click "OK"
6. Entry status changes to REJECTED
7. Employee receives notification with reason

### Best Practices for Managers

- **Review Timely**: Check pending entries regularly
- **Be Specific**: Give clear feedback if rejecting
- **Bulk Review**: Batch similar entries
- **Consistency**: Apply same standards to all employees
- **Documentation**: Keep records of rejections
- **Support**: Help employees understand requirements
- **Trends**: Watch for unusual hours patterns

## Tips & Tricks

### Productivity Tips
1. **Log time daily** - Don't wait until Friday
2. **Be descriptive** - Help others understand your work
3. **Link to tasks** - Associate time with specific tasks
4. **Use priorities** - Focus on high-priority tasks first
5. **Review progress** - Check task dashboard weekly

### Task Management
1. **Use filters** - Find tasks by status or assignee
2. **Set realistic estimates** - Based on historical data
3. **Update progress regularly** - Keep team informed
4. **Comment on tasks** - Communicate with team
5. **Group related tasks** - Use parent/subtask relationships

### Timesheet
1. **Use templates** - For recurring work
2. **Batch entry** - Log multiple days at once
3. **Set reminders** - Remember to log time
4. **Keep descriptions** - Brief but descriptive
5. **Review before submitting** - Catch errors early

### Manager Tips
1. **Set clear deadlines** - When timesheets are due
2. **Review consistently** - Same day/time each week
3. **Provide feedback** - Even for approvals
4. **Track patterns** - Understand team capacity
5. **Plan workload** - Based on actual hours

## FAQ

### Tasks

**Q: Can I see tasks assigned to others?**
A: Yes, in Task Management view all project tasks. Your assigned tasks are highlighted.

**Q: How do I update task progress?**
A: Click task to open details, then update progress percentage or status.

**Q: What's the difference between estimated and actual hours?**
A: Estimated is planned effort, actual is hours logged via timesheet.

**Q: Can I create subtasks?**
A: Yes, in task details you can add child tasks.

### Timesheet

**Q: Can I edit a submitted timesheet?**
A: No, only DRAFT entries can be edited. If rejected, it becomes DRAFT again.

**Q: What if I forget to log time?**
A: You can add entries for past dates (check with your manager on policy).

**Q: How do I add time to a task?**
A: Log timesheet entry and select the task from dropdown.

**Q: Can I track time outside work hours?**
A: Yes, you can log any date, but check company policy on hours.

**Q: What if hours exceed 24 in a day?**
A: System allows up to 24 hours per day per project.

### Approvals

**Q: How long do approvals take?**
A: Depends on your manager, typically 1-2 business days.

**Q: What if my timesheet is rejected?**
A: Manager provides reason. Fix issues and resubmit.

**Q: Can I approve my own timesheet?**
A: No, another manager must approve.

**Q: How do I see rejection reasons?**
A: Check the REJECTED entry for reason in timesheet table.

### General

**Q: How do I change my profile?**
A: Click profile icon > Settings > Edit Profile

**Q: Can I access on mobile?**
A: Yes, responsive design works on tablets and phones.

**Q: How do I export reports?**
A: Use Export button in Dashboard (if available).

**Q: What timezone is used?**
A: Based on your user profile settings.

**Q: Can I see others' timesheets?**
A: Managers can see team timesheets, others see only their own.

## Support

If you encounter issues:

1. **Check this guide** - Common questions answered above
2. **Contact your manager** - For account or access issues
3. **Email support** - For technical problems
4. **Check system status** - May be maintenance window

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate between fields |
| `Enter` | Submit form |
| `Escape` | Close modal/drawer |
| `Ctrl+K` | Search (if available) |

## Tips for Best Results

1. **Consistency** - Log time the same way each day
2. **Accuracy** - Be honest about hours worked
3. **Timeliness** - Submit timesheet on time
4. **Communication** - Discuss blockers early
5. **Feedback** - Provide regular updates to team

---

**Need more help?** Contact your manager or project administrator.
