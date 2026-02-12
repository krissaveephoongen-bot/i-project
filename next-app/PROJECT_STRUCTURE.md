# Project Structure & Features Documentation

## 1. Menu List (Navigation)
Based on the Sidebar configuration:

*   **Dashboard** (`/dashboard`)
*   **Projects** (`/projects`)
*   **Tasks** (`/tasks`)
*   **Timesheet** (`/timesheet`)
*   **Approvals**
    *   Timesheets (`/approvals/timesheets`)
    *   Expenses (`/approvals/expenses`)
*   **Sales** (`/sales`)
*   **Reports**
    *   Financial (`/reports/financial`)
    *   Utilization (`/reports/utilization`)
    *   Project Insights (`/reports/insights`)
*   **Settings**
    *   Users (`/users`)
    *   Clients (`/clients`)
*   **Help & Support** (`/help`)

---

## 2. Page Features & Display List

### 🏠 **Dashboard** (`/dashboard`)
*   **Features:**
    *   Real-time Project Health Monitoring.
    *   Financial Overview (Budget vs Actual).
    *   Weekly Performance Tracking (SPI, Progress).
    *   Resource Workload Visualization.
*   **Display List:**
    *   **KPI Cards:** Total Projects, Active Projects, Critical Risks, Team Utilization.
    *   **Project Health Table:** List of active projects with Status, Progress Bar, SPI, and CPI.
    *   **Financial Chart:** Monthly Revenue vs Cost trend.
    *   **Weekly Performance Table:** Actual vs Plan progress, SPI, and Weekly Delta (%).
    *   **Team Load Chart:** Workload distribution across team members.

### 📂 **Projects List** (`/projects`)
*   **Features:**
    *   List all projects with filtering and sorting.
    *   Create New Project (Modal).
    *   Quick actions (Edit, Delete).
*   **Display List:**
    *   **Data Table:** Project Name, Client, Status (Badge), Progress (%), Budget, Start/End Date.
    *   **Filters:** Search bar, Status dropdown, Project Manager dropdown.

### 📝 **Tasks** (`/tasks`)
*   **Features:**
    *   Task Management (CRUD).
    *   Filtering by Status, Priority, Project, Assignee.
*   **Display List:**
    *   **Task Table:** Title, Project, Assigned To, Status (Badge), Priority (Icon), Due Date.
    *   **Actions:** Edit Task, Delete Task.

### ⏱️ **Timesheet** (`/timesheet`)
*   **Features:**
    *   Daily/Weekly Time Logging.
    *   Support for Project and Non-Project work types.
    *   Real-time Utilization calculation.
*   **Display List:**
    *   **Timesheet Table:** Date, Project/Activity, Task, Hours, Billable Status.
    *   **Summary Cards:** Total Hours, Billable Hours, Utilization %.

### ✅ **Approvals**
#### Timesheets (`/approvals/timesheets`)
*   **Features:**
    *   Manager approval workflow for time entries.
    *   Batch Approve/Reject.
*   **Display List:**
    *   **Pending Requests Table:** Employee Name, Project, Date, Hours, Notes.
    *   **Actions:** Approve Button, Reject Button.

#### Expenses (`/approvals/expenses`)
*   **Features:**
    *   Expense claim approval.
*   **Display List:**
    *   **Expense Requests Table:** Employee, Project, Category, Amount, Receipt Attachment.

### 💼 **Sales** (`/sales`)
*   **Features:**
    *   Sales Pipeline Management (Kanban/List).
    *   Deal Tracking (Stages: Lead -> Won/Lost).
    *   Pipeline Configuration (CRUD Stages).
*   **Display List:**
    *   **Deals Table/Board:** Deal Name, Client, Value, Stage, Probability, Owner.
    *   **Pipeline Settings:** Manage Stages and Probabilities.

### 📊 **Reports**
#### Financial (`/reports/financial`)
*   **Features:**
    *   Deep dive into project financials.
    *   Profit & Loss analysis.
*   **Display List:**
    *   **KPI Cards:** Total Revenue, Total Cost, Net Profit, Margin %.
    *   **Financial Trend Chart:** Monthly breakdown.
    *   **Project Breakdown Table:** Detailed financial performance per project.

#### Utilization (`/reports/utilization`)
*   **Features:**
    *   Resource efficiency tracking.
    *   Billable vs Non-Billable analysis.
*   **Display List:**
    *   **Utilization Chart:** Billable vs Non-Billable hours per person.
    *   **Summary Stats:** Total Hours, Billable Ratio, Top Performers.
    *   **Detailed Table:** Breakdown by employee.

### ⚙️ **Settings**
#### Users (`/users`)
*   **Features:**
    *   User Management (CRUD).
    *   Role Assignment (Admin, Manager, User).
*   **Display List:**
    *   **User Table:** Name, Email, Role, Department, Status.

#### Clients (`/clients`)
*   **Features:**
    *   Client Management (CRUD).
*   **Display List:**
    *   **Client Table:** Company Name, Contact Person, Email, Status.

### ❓ **Help & Support** (`/help`)
*   **Features:**
    *   Internal Contact Directory.
    *   External Stakeholder Management (CRUD).
*   **Display List:**
    *   **Team Contacts:** Internal team members list.
    *   **Stakeholder Contacts:** External partners/sponsors list (Name, Role, Org, Contact Info).
