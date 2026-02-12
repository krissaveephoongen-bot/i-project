import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { cn } from '@/lib/utils';

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
  if (!input) return '-';
  try {
    const d = typeof input === 'string' ? new Date(input) : input;
    return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }).format(d);
  } catch {
    return String(input);
  }
}

export default function ProjectDetailReport(props: ReportProps) {
  const {
    title = 'จัดซื้อรถสานวนเคลื่อนที่ชนิด 6 ล้อ พร้อมอุปกรณ์ประกอบอาหาร กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช',
    progressActual = 60.05,
    progressPlan = 64.62,
    accountManager = 'คุณพรรชัย พรทรงจิตร์',
    projectManager = 'จักรกฤษณ์ ภูมิน',
    projectEngineer = '-',
    projectCo = 'ศศธร สุขูชะ',
    startDate,
    endDate,
    durationDays = 180,
    elapsedDays = 98,
    projectValue = 65637000,
    projectType = 'Contract',
    schedule = [
      {
        description: 'งวดที่ 1 : 100% หลังจากส่งมอบรถทั้งหมด 13 คัน',
        amountIncVat: 65637000,
        deliveryPlanDate: '2026-04-06',
      },
    ],
    className,
  } = props;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-cyan-100/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-base md:text-lg">{title}</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-4xl md:text-5xl font-semibold text-red-500 leading-none">{progressActual.toFixed(2)} %</div>
            <div className="text-sm text-blue-600">แผน {progressPlan.toFixed(2)} %</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="md:col-span-2 border-r border-slate-200">
            <Table className="text-sm">
              <TableBody>
                <TableRow className="bg-white">
                  <TableCell className="w-48 text-slate-600">Account Manager</TableCell>
                  <TableCell className="text-slate-900">{accountManager}</TableCell>
                  <TableCell className="w-48 text-slate-600">วันที่เริ่มต้นสัญญา</TableCell>
                  <TableCell className="text-slate-900">{formatThaiDate(startDate)}</TableCell>
                  <TableCell className="w-44 text-slate-600">% Actual (Now)</TableCell>
                  <TableCell className="text-red-600 font-semibold">{progressActual.toFixed(2)} %</TableCell>
                </TableRow>
                <TableRow className="bg-slate-50">
                  <TableCell className="text-slate-600">Project Manager</TableCell>
                  <TableCell className="text-slate-900">{projectManager}</TableCell>
                  <TableCell className="text-slate-600">วันที่สิ้นสุดสัญญา</TableCell>
                  <TableCell className="text-slate-900">{formatThaiDate(endDate)}</TableCell>
                  <TableCell className="text-slate-600">% Planning</TableCell>
                  <TableCell className="text-blue-700 font-semibold">{progressPlan.toFixed(2)} %</TableCell>
                </TableRow>
                <TableRow className="bg-white">
                  <TableCell className="text-slate-600">Project Engineer</TableCell>
                  <TableCell className="text-slate-900">{projectEngineer}</TableCell>
                  <TableCell className="text-slate-600">ระยะเวลาโครงการ</TableCell>
                  <TableCell className="text-slate-900">{durationDays} วัน</TableCell>
                  <TableCell className="text-slate-600">Project Value (Inc Vat)</TableCell>
                  <TableCell className="text-slate-900">฿{projectValue.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow className="bg-slate-50">
                  <TableCell className="text-slate-600">Project Co</TableCell>
                  <TableCell className="text-slate-900">{projectCo}</TableCell>
                  <TableCell className="text-slate-600">ดำเนินงานแล้ว</TableCell>
                  <TableCell className="text-slate-900">{elapsedDays} วัน</TableCell>
                  <TableCell className="text-slate-600">Project Type</TableCell>
                  <TableCell className="text-slate-900">{projectType}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="md:col-span-1">
            <div className="h-full p-4 bg-white border-t md:border-t-0">
              <div className="text-slate-700 font-medium mb-2">บันทึกย่อ</div>
              <div className="text-xs text-slate-600">
                ตารางนี้เป็นรูปแบบรายงานที่ใช้ในสไลด์ และถูกย้ายมาแสดงบนเว็บเพื่อการติดตามความคืบหน้าและสถานะการส่งมอบ/รับเงิน
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 bg-sky-200/60 px-4 py-2 text-slate-800 font-medium">
          จัดซื้อรถสานวนเคลื่อนที่ชนิดที่หนึ่ง 6 ล้อ พร้อมอุปกรณ์ประกอบอาหาร กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช
        </div>

        <Table className="text-sm">
          <TableHeader>
            <TableRow className="bg-sky-100">
              <TableHead className="w-[45%]">Description</TableHead>
              <TableHead className="w-[15%] text-right">Amount (Inc Vat)</TableHead>
              <TableHead className="w-[10%]">การส่งมอบงาน - Plan Date</TableHead>
              <TableHead className="w-[10%]">Actual Date</TableHead>
              <TableHead className="w-[10%]">การรับเงิน - Invoice Date</TableHead>
              <TableHead className="w-[10%]">Plan Received</TableHead>
              <TableHead className="w-[10%]">Receipt Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map((s, idx) => (
              <TableRow key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <TableCell className="text-slate-900">{s.description}</TableCell>
                <TableCell className="text-right text-slate-900">฿{s.amountIncVat.toLocaleString()}</TableCell>
                <TableCell className="text-slate-900">{formatThaiDate(s.deliveryPlanDate)}</TableCell>
                <TableCell className="text-slate-900">{formatThaiDate(s.deliveryActualDate)}</TableCell>
                <TableCell className="text-slate-900">{formatThaiDate(s.invoiceDate)}</TableCell>
                <TableCell className="text-slate-900">{formatThaiDate(s.planReceivedDate)}</TableCell>
                <TableCell className="text-slate-900">{formatThaiDate(s.receiptDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

