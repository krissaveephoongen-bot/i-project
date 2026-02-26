import { supabase } from "./lib/supabaseClient";
import Link from "next/link";
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  AlertCircle,
  Users,
  FolderKanban,
  Clock,
  Target,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "./components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/Button";
import { Progress } from "./components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import FinancialChart from "./components/FinancialChart";
import TeamLoadChart from "./components/TeamLoadChart";

// --- DATA FETCHING FUNCTIONS (SERVER-SIDE) ---

async function getKpiData() {
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("budget, status");
  if (projectsError) throw projectsError;

  const totalValue = projects.reduce(
    (sum: number, p: any) => sum + (p.budget || 0),
    0,
  );

  const { count: activeIssues } = await supabase
    .from("risks")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "in_progress"]);

  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  ).toISOString();
  const lastDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).toISOString();
  const { data: milestones, error: milestonesError } = await supabase
    .from("milestones")
    .select("amount")
    .gte("due_date", firstDayOfMonth)
    .lte("due_date", lastDayOfMonth);
  if (milestonesError) throw milestonesError;

  const billingForecast = milestones.reduce(
    (sum: number, m: any) => sum + (m.amount || 0),
    0,
  );

  return {
    totalValue,
    activeIssues: activeIssues || 0,
    billingForecast,
    avgSpi: 0.98,
  };
}

async function getProjectsHealth() {
  const { data: projects, error } = await supabase.from("projects").select(`
      id,
      name,
      progress,
      status,
      users!projects_manager_id_fkey(name)
    `);

  if (error) {
    console.error("Error fetching project health:", error);
    return [];
  }

  const { data: risks, error: risksError } = await supabase
    .from("risks")
    .select("project_id, status")
    .in("status", ["open", "in_progress"]);
  if (risksError) throw risksError;

  const risksPerProject = risks.reduce(
    (acc: { [key: string]: number }, risk: any) => {
      acc[risk.project_id] = (acc[risk.project_id] || 0) + 1;
      return acc;
    },
    {},
  );

  return projects.map((p: any) => {
    const riskCount = risksPerProject[p.id] || 0;
    let risk_level = "Low";
    if (riskCount > 5) risk_level = "Critical";
    else if (riskCount > 3) risk_level = "High";
    else if (riskCount > 1) risk_level = "Medium";

    return {
      ...p,
      client: (p.users as any)?.name || "Unassigned",
      progress_plan: Math.min(100, p.progress + 5),
      progress_actual: p.progress,
      spi: Number((0.8 + Math.random() * 0.4).toFixed(2)),
      risk_level: risk_level,
    };
  });
}

async function getFinancialData() {
  const { data, error } = await supabase
    .from("financial_data")
    .select("*")
    .order("month", { ascending: true });
  if (error) {
    console.error("Error fetching financial data:", error);
    return [];
  }
  return data.map((d: any) => ({
    ...d,
    month: new Date(d.month).toLocaleDateString("en-US", { month: "short" }),
  }));
}

async function getTeamLoad() {
  const today = new Date();
  const dayOfWeek = today.getUTCDay();
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("time_entries")
    .select(`hours, date, users ( id, name )`)
    .gte("date", weekStart)
    .lte("date", weekEnd);

  if (error) {
    console.error("Error fetching team load:", error);
    return [];
  }

  const userHours: {
    [key: string]: {
      name: string;
      mon: number;
      tue: number;
      wed: number;
      thu: number;
      fri: number;
    };
  } = {};
  data.forEach((entry: any) => {
    const user = entry.users as any;
    if (!user) return;

    if (!userHours[user.id]) {
      userHours[user.id] = {
        name: user.name,
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
      };
    }
    const day = new Date(entry.date).getUTCDay();
    const dayMap: Array<"sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat"> =
      ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayKey = dayMap[day];

    if (dayKey && dayKey !== "sun" && dayKey !== "sat") {
      (userHours[user.id] as any)[dayKey] += entry.hours;
    }
  });

  return Object.values(userHours);
}

// --- UI COMPONENTS ---

function KpiCard({
  title,
  value,
  change,
  positive,
  subtext,
  icon: Icon,
  alert,
  variant = "default",
}: {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  subtext?: string;
  icon: React.ComponentType<any>;
  alert?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "destructive":
        return "border-red-200 bg-red-50";
      default:
        return "border-slate-200 bg-white";
    }
  };

  return (
    <Card className={getVariantStyles()}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              alert
                ? "bg-red-100"
                : variant === "success"
                  ? "bg-green-100"
                  : variant === "warning"
                    ? "bg-yellow-100"
                    : "bg-blue-100"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                alert
                  ? "text-red-600"
                  : variant === "success"
                    ? "text-green-600"
                    : variant === "warning"
                      ? "text-yellow-600"
                      : "text-blue-600"
              }`}
            />
          </div>
          {change && (
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {positive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {change}
            </span>
          )}
        </div>
        <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
        <p
          className={`text-2xl font-bold ${
            alert
              ? "text-red-700"
              : variant === "success"
                ? "text-green-700"
                : variant === "warning"
                  ? "text-yellow-700"
                  : "text-slate-900"
          }`}
        >
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}

const getRiskVariant = (
  risk: string,
): "default" | "secondary" | "destructive" => {
  switch (risk.toLowerCase()) {
    case "low":
      return "secondary";
    case "medium":
      return "default";
    case "high":
      return "destructive";
    case "critical":
      return "destructive";
    default:
      return "secondary";
  }
};

// --- MAIN PAGE COMPONENT (CLIENT) ---

function ExecutiveDashboardContent({
  kpiData,
  projects,
  financialData,
  teamLoadData,
}: {
  kpiData: any;
  projects: any[];
  financialData: any[];
  teamLoadData: any[];
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={t("dashboard.title")}
        breadcrumbs={[{ label: t("dashboard.title") }]}
      />

      <div className="container mx-auto px-6 py-8 pt-24">
        {/* Header Section - Responsive */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-6 sm:mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("dashboard.title")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("dashboard.welcome")}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 self-start"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t("reports.export")}</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>

        {/* KPI Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <KpiCard
            title={t("dashboard.kpis.totalValue")}
            value={`$${(kpiData.totalValue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
          />
          <KpiCard
            title={t("dashboard.kpis.avgSpi")}
            value={kpiData.avgSpi.toFixed(2)}
            alert={kpiData.avgSpi < 1.0}
            variant={kpiData.avgSpi < 1.0 ? "destructive" : "success"}
            icon={TrendingDown}
          />
          <KpiCard
            title={t("dashboard.kpis.activeIssues")}
            value={kpiData.activeIssues.toString()}
            alert={kpiData.activeIssues > 10}
            variant={kpiData.activeIssues > 10 ? "destructive" : "default"}
            icon={AlertTriangle}
          />
          <KpiCard
            title={t("dashboard.kpis.billingForecast")}
            value={`$${(kpiData.billingForecast / 1000000).toFixed(1)}M`}
            icon={Receipt}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Health Matrix */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.charts.portfolioHealth")}</CardTitle>
                <CardDescription>
                  Overview of project health, progress, and risk levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("projects.columns.name")}</TableHead>
                        <TableHead className="text-center">
                          {t("common.progress")}
                        </TableHead>
                        <TableHead className="text-center">SPI</TableHead>
                        <TableHead className="text-center">
                          {t("projects.columns.risk")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.slice(0, 5).map((project: any) => (
                        <TableRow
                          key={project.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${project.name}`}
                                />
                                <AvatarFallback>
                                  {project.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link
                                  href={`/projects/${project.id}`}
                                  className="font-medium hover:underline"
                                >
                                  {project.name}
                                </Link>
                                <div className="text-sm text-muted-foreground">
                                  {project.client}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={project.progress_actual}
                                className="w-16"
                              />
                              <span className="text-sm font-medium">
                                {project.progress_actual}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                project.spi >= 1 ? "default" : "destructive"
                              }
                            >
                              {project.spi >= 1 ? (
                                <ArrowUpRight className="w-3 h-3 mr-1" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 mr-1" />
                              )}
                              {project.spi.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={getRiskVariant(project.risk_level)}>
                              {project.risk_level}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Load Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.charts.teamLoad")}</CardTitle>
              <CardDescription>
                Current week team capacity utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamLoadChart data={teamLoadData} />
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.charts.financial")}</CardTitle>
            <CardDescription>Revenue and cost trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialChart data={financialData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT (SERVER) ---

export default async function ExecutiveDashboard() {
  const kpiData = await getKpiData();
  const projects = await getProjectsHealth();
  const financialData = await getFinancialData();
  const teamLoadData = await getTeamLoad();

  return (
    <ExecutiveDashboardContent
      kpiData={kpiData}
      projects={projects}
      financialData={financialData}
      teamLoadData={teamLoadData}
    />
  );
}
