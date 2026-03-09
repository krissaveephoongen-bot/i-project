"use client";

import { Search, ChevronRight, Home, Menu, Sparkles, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import NotificationCenter from "./NotificationCenter";
import { useSidebar } from "./SidebarContext";
import { buildBreadcrumbs } from "@/app/navigation/breadcrumbs";
import { createClient as createBrowserSupabase } from "@/utils/supabase/client";
import { useWalkthrough } from "./walkthrough/WalkthroughProvider";
import { Button } from "@/app/components/ui/button";

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ title, breadcrumbs }: HeaderProps) {
  const { t } = useTranslation();
  const { toggleMobile } = useSidebar();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname() || "/";
  const autoCrumbs = breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : buildBreadcrumbs(pathname, t);
  const [dynamicCrumbs, setDynamicCrumbs] = useState<{ label: string; href?: string }[] | null>(null);
  const { start } = useWalkthrough();

  // Back button logic: Show if not on root dashboard or root projects list (unless deep in hierarchy)
  const showBackButton = pathname !== "/" && pathname !== "/projects";

  useEffect(() => {
    setDynamicCrumbs(null);
    const supabase = createBrowserSupabase();
    const matchProject = pathname.match(/^\/projects\/([^/]+)/);
    const matchClient = pathname.match(/^\/clients\/([^/]+)/);
    const fetchName = async () => {
      if (matchProject) {
        const id = decodeURIComponent(matchProject[1]);
        const segs = pathname.split("/").filter(Boolean);
        const { data: pj } = await supabase.from("projects").select("name").eq("id", id).single();
        const crumbs: { label: string; href?: string }[] = [];
        if (pj?.name) {
          crumbs.push({ label: t("navigation.projects", "Projects"), href: "/projects" });
          crumbs.push({ label: pj.name, href: `/projects/${id}` });
        }
        if (segs[2]) {
          const section = segs[2];
          const sectionLabelMap: Record<string, string> = {
            overview: t("navigation.overview", "Overview"),
            milestones: t("navigation.milestones", "Milestones"),
            tasks: t("navigation.tasks", "Tasks"),
            documents: t("navigation.documents", "Documents"),
            budget: "Budget",
            "cost-sheet": "Cost Sheet",
            closure: "Closure",
            risks: "Risks",
            team: "Team",
          };
          const sLabel = sectionLabelMap[section] || section;
          crumbs.push({ label: sLabel, href: `/projects/${id}/${section}` });
          if (segs[3] && segs[3] !== "new") {
            const subId = decodeURIComponent(segs[3]);
            const tableMap: Record<string, { table: string; nameFields: string[] }> = {
              milestones: { table: "milestones", nameFields: ["title", "name"] },
              tasks: { table: "tasks", nameFields: ["title", "name"] },
              documents: { table: "documents", nameFields: ["title", "name"] },
              risks: { table: "risks", nameFields: ["title", "name"] },
            };
            const cfg = tableMap[section];
            if (cfg) {
              const { data: row } = await supabase.from(cfg.table).select(cfg.nameFields.join(",")).eq("id", subId).single();
              const disp = row?.title || row?.name;
              if (disp) crumbs.push({ label: disp });
            }
            if (segs[4] === "edit") {
              crumbs.push({ label: t("common.edit", "Edit") });
            }
          }
        }
        if (crumbs.length > 0) setDynamicCrumbs(crumbs);
        return;
      }
      if (matchClient) {
        const id = decodeURIComponent(matchClient[1]);
        const { data } = await supabase.from("clients").select("name").eq("id", id).single();
        if (data?.name) {
          setDynamicCrumbs([
            { label: t("navigation.clients", "Clients"), href: "/clients" },
            { label: data.name },
          ]);
        }
      }
    };
    fetchName();
  }, [pathname, t]);
  const crumbsToRender = dynamicCrumbs && dynamicCrumbs.length > 0 ? dynamicCrumbs : autoCrumbs;

  const handleStartTour = () => {
    const stepsFor = () => {
      if (pathname.startsWith("/tasks")) {
        return [
          {
            selector: "#tour-projects-sidebar",
            title: "เลือกโครงการ",
            content: "เริ่มจากเลือกโครงการทางซ้ายเพื่อดูงานเฉพาะของโครงการนั้น",
            placement: "right",
          },
          {
            selector: "#add-task-button",
            title: "เพิ่มงานใหม่",
            content: "กดปุ่มนี้เพื่อสร้างงานใหม่ในโครงการที่เลือก",
            placement: "bottom",
          },
          {
            selector: "#tasks-table",
            title: "รายการงาน",
            content: "บริเวณนี้แสดงงานทั้งหมดของโครงการที่เลือก พร้อมสถานะและผู้รับผิดชอบ",
            placement: "top",
          },
        ];
      }
      if (pathname === "/projects") {
        return [
          {
            selector: "#create-project-button",
            title: "สร้างโครงการใหม่",
            content: "เริ่มต้นด้วยการกดปุ่มนี้เพื่อสร้างโครงการใหม่",
            placement: "bottom",
          },
          {
            selector: "#projects-list-card",
            title: "รายชื่อโครงการ",
            content: "พื้นที่นี้ใช้ค้นหา กรอง และดูรายละเอียดของโครงการ",
            placement: "top",
          },
          {
            selector: "#export-projects-button",
            title: "ส่งออกข้อมูล",
            content: "ส่งออกรายชื่อโครงการเป็นไฟล์ CSV",
            placement: "left",
          },
        ];
      }
      if (/^\/projects\/[^/]+\/overview/.test(pathname) || /^\/projects\/[^/]+$/.test(pathname)) {
        return [
          {
            selector: "#project-detail-report",
            title: "สรุปโครงการ",
            content: "ดูข้อมูลสำคัญของโครงการ เช่นวันเริ่ม-สิ้นสุด และทีมงาน",
            placement: "bottom",
          },
          {
            selector: "#scurve-card",
            title: "กราฟ S-Curve",
            content: "เปรียบเทียบแผนกับผลงานจริงตลอดเส้นเวลา",
            placement: "top",
          },
          {
            selector: "#milestones-card",
            title: "ไมล์สโตน",
            content: "ติดตามความคืบหน้ารายไมล์สโตน",
            placement: "left",
          },
        ];
      }
      if (pathname.startsWith("/reports")) {
        return [
          {
            selector: "#reports-tabs",
            title: "รายงานรวม",
            content: "สลับแท็บเพื่อดูภาพรวม โครงการ การเงิน ทรัพยากร และอื่น ๆ",
            placement: "bottom",
          },
          {
            selector: "#reports-tab-projects",
            title: "รายงานโครงการ",
            content: "ดูสถานะโครงการและ KPI สำคัญ",
            placement: "bottom",
          },
        ];
      }
      if (pathname.startsWith("/timesheet")) {
        return [
          {
            selector: "#timesheet-tabs",
            title: "มุมมองไทม์ชีท",
            content: "สลับดูแบบรายเดือน รายสัปดาห์ และประวัติกิจกรรม",
            placement: "bottom",
          },
          {
            selector: "#timesheet-add-entry",
            title: "เพิ่มรายการเวลา",
            content: "บันทึกชั่วโมงการทำงานของคุณที่นี่",
            placement: "bottom",
          },
          {
            selector: "#timesheet-submit",
            title: "ส่งอนุมัติ",
            content: "เมื่อกรอกครบแล้ว กดส่งเพื่อรออนุมัติ",
            placement: "left",
          },
        ];
      }
      if (pathname.startsWith("/approvals/timesheets")) {
        return [
          {
            selector: "#approvals-timesheets-table",
            title: "รายการรออนุมัติ",
            content: "ตรวจสอบรายละเอียดและกดอนุมัติหรือปฏิเสธแต่ละรายการ",
            placement: "top",
          },
        ];
      }
      return [];
    };
    const steps = stepsFor().filter(s => typeof document !== "undefined" && document.querySelector(s.selector));
    if (steps.length) start(steps);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      router.push(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-[260px] h-[64px] bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 z-40"
      role="banner"
    >
      {/* Left: Mobile menu + Back + Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobile}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}

        {crumbsToRender && crumbsToRender.length > 0 ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <a
                  href="/"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label="หน้าแรก"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                </a>
              </li>
              {crumbsToRender.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  <ChevronRight
                    className="w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      className="text-foreground font-medium"
                      aria-current="page"
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <span className="text-foreground font-medium">{title}</span>
        )}
      </div>

      {/* Right: Search, Language, Notifications */}
      <div className="flex items-center gap-2 lg:gap-4">
        <button
          onClick={handleStartTour}
          className="hidden md:inline-flex items-center gap-1 px-3 py-2 text-xs rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"
        >
          <Sparkles className="w-3 h-3" />
          {t("navigation.tour", "แนะนำการใช้งาน")}
        </button>
        {/* Global Search - hidden on small screens */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t("navigation.search")}
            aria-label={t("navigation.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="w-48 lg:w-72 pl-10 pr-4 py-2 text-sm border border-input bg-background rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
          />
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter />
      </div>
    </header>
  );
}
