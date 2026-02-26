import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { cn } from "@/lib/utils";

type ReportProps = {
  title?: string;
  progressActual?: number;
  progressPlan?: number;
  accountManager?: string;
  projectManager?: string;
  projectEngineer?: string;
  projectCo?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  durationDays?: number;
  elapsedDays?: number;
  projectValue?: number;
  projectType?: string;
  schedule?: Array<{
    description: string;
    amountIncVat: number;
    deliveryPlanDate?: string;
    deliveryActualDate?: string;
    invoiceDate?: string;
    planReceivedDate?: string;
    receiptDate?: string;
  }>;
  className?: string;
};

function formatThaiDate(input?: string | Date | null) {
  if (!input) return "-";
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    }).format(d);
  } catch {
    return String(input);
  }
}

export default function ProjectDetailReport(props: ReportProps) {
  const {
    title = "ชื่อโครงการ",
    progressActual = 0,
    progressPlan = 0,
    accountManager = "-",
    projectManager = "-",
    projectEngineer = "-",
    projectCo = "-",
    startDate,
    endDate,
    durationDays = 0,
    elapsedDays = 0,
    projectValue = 0,
    projectType = "-",
    schedule = [],
    className,
  } = props;

  return (
    <Card
      className={cn(
        "overflow-hidden shadow-sm border-slate-200 rounded-xl",
        className,
      )}
    >
      <CardHeader className="bg-cyan-100/60 border-b border-cyan-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-base md:text-lg text-slate-800">
              {title}
            </CardTitle>
          </div>
          <div className="text-right">
            <div className="text-4xl md:text-5xl font-semibold text-red-500 leading-none">
              {progressActual.toFixed(2)} %
            </div>
            <div className="text-sm text-blue-600 font-medium mt-1">
              แผนงาน {progressPlan.toFixed(2)} %
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="md:col-span-2 border-r border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="bg-white border-b border-slate-100">
                    <td className="p-3 w-48 text-slate-600 font-medium">
                      Account Manager
                    </td>
                    <td className="p-3 text-slate-900">{accountManager}</td>
                    <td className="p-3 w-48 text-slate-600 font-medium">
                      วันที่เริ่มต้นสัญญา
                    </td>
                    <td className="p-3 text-slate-900">
                      {formatThaiDate(startDate)}
                    </td>
                    <td className="p-3 w-44 text-slate-600 font-medium">
                      % Actual (Now)
                    </td>
                    <td className="p-3 text-red-600 font-semibold">
                      {progressActual.toFixed(2)} %
                    </td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <td className="p-3 text-slate-600 font-medium">
                      Project Manager
                    </td>
                    <td className="p-3 text-slate-900">{projectManager}</td>
                    <td className="p-3 text-slate-600 font-medium">
                      วันที่สิ้นสุดสัญญา
                    </td>
                    <td className="p-3 text-slate-900">
                      {formatThaiDate(endDate)}
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      % Planning
                    </td>
                    <td className="p-3 text-blue-700 font-semibold">
                      {progressPlan.toFixed(2)} %
                    </td>
                  </tr>
                  <tr className="bg-white border-b border-slate-100">
                    <td className="p-3 text-slate-600 font-medium">
                      Project Engineer
                    </td>
                    <td className="p-3 text-slate-900">{projectEngineer}</td>
                    <td className="p-3 text-slate-600 font-medium">
                      ระยะเวลาโครงการ
                    </td>
                    <td className="p-3 text-slate-900">{durationDays} วัน</td>
                    <td className="p-3 text-slate-600 font-medium">
                      มูลค่าโครงการ (รวม VAT)
                    </td>
                    <td className="p-3 text-slate-900">
                      ฿{projectValue.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-3 text-slate-600 font-medium">
                      Project Co
                    </td>
                    <td className="p-3 text-slate-900">{projectCo}</td>
                    <td className="p-3 text-slate-600 font-medium">
                      ดำเนินงานแล้ว
                    </td>
                    <td className="p-3 text-slate-900">{elapsedDays} วัน</td>
                    <td className="p-3 text-slate-600 font-medium">
                      ประเภทโครงการ
                    </td>
                    <td className="p-3 text-slate-900">{projectType}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="md:col-span-1 bg-slate-50/50 p-4 border-t md:border-t-0">
            <div className="text-slate-700 font-medium mb-2">หมายเหตุ</div>
            <div className="text-xs text-slate-500 leading-relaxed">
              ตารางนี้สรุปสถานะโครงการตามแผนงานและสัญญา
              รวมถึงการติดตามงวดงานและการชำระเงิน
            </div>
          </div>
        </div>

        <div className="mt-4 mb-2 bg-sky-100/80 px-4 py-2 text-slate-800 font-semibold text-sm border-y border-sky-200">
          รายละเอียดงวดงานและการชำระเงิน
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sky-50 text-slate-700 text-left border-b border-sky-100">
                <th className="p-3 font-semibold w-[30%]">รายละเอียด</th>
                <th className="p-3 font-semibold text-right w-[15%]">
                  จำนวนเงิน (รวม VAT)
                </th>
                <th className="p-3 font-semibold w-[13%]">แผนส่งมอบ</th>
                <th className="p-3 font-semibold w-[13%]">ส่งมอบจริง</th>
                <th className="p-3 font-semibold w-[13%]">วันวางบิล</th>
                <th className="p-3 font-semibold w-[13%]">แผนรับเงิน</th>
                <th className="p-3 font-semibold w-[13%]">รับเงินจริง</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    "border-b border-slate-100 transition-colors hover:bg-slate-50",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/30",
                  )}
                >
                  <td className="p-3 text-slate-900">{s.description}</td>
                  <td className="p-3 text-right text-slate-900 font-medium">
                    ฿{s.amountIncVat.toLocaleString()}
                  </td>
                  <td className="p-3 text-slate-600">
                    {formatThaiDate(s.deliveryPlanDate)}
                  </td>
                  <td className="p-3 text-slate-600">
                    {formatThaiDate(s.deliveryActualDate)}
                  </td>
                  <td className="p-3 text-slate-600">
                    {formatThaiDate(s.invoiceDate)}
                  </td>
                  <td className="p-3 text-slate-600">
                    {formatThaiDate(s.planReceivedDate)}
                  </td>
                  <td className="p-3 text-slate-600">
                    {formatThaiDate(s.receiptDate)}
                  </td>
                </tr>
              ))}
              {schedule.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-slate-500 py-8 italic"
                  >
                    ไม่พบข้อมูล Milestones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
