
import { supabase } from '@/app/lib/supabaseClient';

// --- Types ---
export interface KpiData {
  totalValue: number;
  activeIssues: number;
  billingForecast: number;
  avgSpi: number;
}

export interface ProjectHealth {
  id: string;
  name: string;
  code?: string;
  progress_plan: number;
  progress_actual: number;
  spi: number;
  cpi: number;
  budget: number;
  risk_level: string;
  client: string;
}

export interface FinancialData {
  month: string;
  revenue: number;
  cost: number;
}

export interface TeamLoadData {
  id: string;
  name: string;
  hours: number;
}

export interface Contact {
  name: string;
  phone: string;
  email: string;
  position: string;
  management: boolean;
}

export interface SunburstNode {
  name: string;
  value: number;
  children: SunburstNode[];
  meta?: any;
}

// --- Dashboard Functions ---

export async function getDashboardKPI(): Promise<KpiData> {
  try {
    const { data: projRows, error: projError } = await supabase.from('projects').select('budget,remaining,spi');
    if (projError) console.error('Error fetching projects for KPI:', projError);

    const { data: riskRows, error: riskError } = await supabase.from('risks').select('id,status');
    if (riskError) console.error('Error fetching risks for KPI:', riskError);
    
    const totalValue = (projRows || []).reduce((s: number, p: any) => s + Number(p.budget || 0), 0);
    const billingForecast = (projRows || []).reduce((s: number, p: any) => s + Number(p.remaining || 0), 0);
    const activeIssues = (riskRows || []).filter((r: any) => String(r.status || '').toLowerCase() !== 'closed').length;
    const avgSpi = (projRows || []).length ? ((projRows || []).reduce((s: number, p: any) => s + Number(p.spi || 0), 0) / (projRows || []).length) : 1;
    
    return { totalValue, activeIssues, billingForecast, avgSpi };
  } catch (error) {
    console.error('Error fetching KPI:', error);
    return { totalValue: 0, activeIssues: 0, billingForecast: 0, avgSpi: 1 };
  }
}

export async function getDashboardProjects(): Promise<ProjectHealth[]> {
  try {
    const { data: rows, error } = await supabase.from('projects').select('*').order('id', { ascending: false });
    
    if (error) {
      console.error('Supabase error fetching projects:', error);
      return [];
    }

    const clientIds = (rows || [])
      .map((r: any) => r.clientId)
      .filter((v: any, i: number, a: any[]) => !!v && a.indexOf(v) === i);
      
    let clientMap: Record<string, string> = {};
    if (clientIds.length > 0) {
      const { data: clients } = await supabase.from('clients').select('id,name').in('id', clientIds);
      clientMap = Object.fromEntries((clients || []).map((r: any) => [r.id, r.name || '']));
    }
    
    return (rows || []).map((r: any) => {
      // Handle case-insensitivity of Postgres columns (unquoted identifiers are lowercase)
      const plan = Number(r.progressPlan ?? r.progressplan ?? r.progress_plan ?? 100);
      const actual = Number(r.progress ?? r.progressActual ?? r.progress_actual ?? 0);
      // Recalculate SPI if missing or 0 to ensure data consistency
      const calcSpi = plan > 0 ? actual / plan : 1;
      const spi = Number(r.spi ?? calcSpi);
      
      const budget = Number(r.budget || 0);
      const spent = Number(r.spent || 0);
      const ev = budget * (actual / 100);
      // Calculate CPI: EV / AC (Earned Value / Actual Cost)
      // If spent is 0: if EV > 0 -> infinite (cap at 2), else 1
      const calcCpi = spent > 0 ? ev / spent : (ev > 0 ? 2 : 1);
      const cpi = Number(calcCpi.toFixed(2));
      
      const risk = String(r.riskLevel ?? r.risklevel ?? r.risk_level ?? 'low');
      const clientId = r.clientId ?? r.clientid ?? r.client_id;
      const client = clientId ? (clientMap[clientId] || '') : '';
      
      return {
        id: r.id,
        name: r.name,
        code: r.code,
        progress_plan: plan,
        progress_actual: actual,
        spi: Number(spi.toFixed(2)),
        cpi,
        budget,
        risk_level: risk,
        client
      };
    });
  } catch (error) {
    console.error('Error fetching dashboard projects:', error);
    return [];
  }
}

export async function getDashboardFinancials(): Promise<FinancialData[]> {
  try {
    const { data } = await supabase
      .from('financial_data')
      .select('month,revenue,cost')
      .order('month', { ascending: true });
      
    return (data || []).map((r: any) => ({
      month: new Date(r.month).toLocaleString('en-US', { month: 'short' }),
      revenue: Number(r.revenue || 0),
      cost: Number(r.cost || 0),
    }));
  } catch (error) {
    console.error('Error fetching financials:', error);
    return [];
  }
}

export async function getDashboardTeamLoad(): Promise<TeamLoadData[]> {
  try {
    const { data: users } = await supabase.from('users').select('id,name');
    const { data: entries } = await supabase.from('timesheets').select('user_id,hours');
    
    const userMap = new Map<string, {name: string, hours: number}>();
    
    (users || []).forEach((u: any) => {
        userMap.set(u.id, { name: u.name, hours: 0 });
    });
    
    (entries || []).forEach((e: any) => {
        const uid = e.user_id || e.userId;
        if (userMap.has(uid)) {
            const u = userMap.get(uid)!;
            u.hours += Number(e.hours || 0);
        }
    });
    
    const result: TeamLoadData[] = [];
    userMap.forEach((val, key) => {
        result.push({ id: key, name: val.name, hours: val.hours });
    });
    
    return result.sort((a, b) => b.hours - a.hours);
  } catch (error) {
    console.error('Error fetching team load:', error);
    return [];
  }
}

// --- Help Functions ---

export async function getHelpContacts(): Promise<{ team: Contact[], stakeholders: Contact[] }> {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('name,full_name,phone,phone_number,email,position,role');
      
    const team = (users || []).map((u: any) => ({
      name: u.name || u.full_name || '',
      phone: u.phone || u.phone_number || '',
      email: u.email || '',
      position: u.position || u.role || '',
      management: ['admin', 'manager'].includes(String(u.role || '').toLowerCase())
    }));

    const { data: stakeholderRows } = await supabase
      .from('stakeholders') // Note: Assuming 'stakeholders' table exists, if not this will fail gracefully
      .select('name,full_name,phone,phone_number,email,position,title');
      
    // If stakeholders table fetch fails (e.g. table doesn't exist yet based on schema check), catch it
    // Actually, based on previous schema check, 'stakeholders' table was NOT in the list?
    // Let's check schema again? 'stakeholders' was missing in the list I got.
    // Ah, 'clients' exists. Maybe 'contacts'?
    // Previous code in api/help/contacts/route.ts queried 'stakeholders'.
    // If it fails, we return empty.
    
    const stakeholders = (stakeholderRows || []).map((s: any) => ({
      name: s.name || s.full_name || '',
      phone: s.phone || s.phone_number || '',
      email: s.email || '',
      position: s.position || s.title || '',
      management: false
    }));

    return { team, stakeholders };
  } catch (error) {
    // If table doesn't exist or other error
    console.error('Error fetching help contacts:', error);
    
    // Try to recover team at least
    try {
         const { data: users } = await supabase.from('users').select('name,email,role');
         const team = (users || []).map((u: any) => ({
            name: u.name,
            phone: '',
            email: u.email,
            position: u.role,
            management: ['admin', 'manager'].includes(String(u.role || '').toLowerCase())
         }));
         return { team, stakeholders: [] };
    } catch {
        return { team: [], stakeholders: [] };
    }
  }
}

// --- Report Functions ---

function inferTimes(start: any, end: any, date: string, hours: number) {
  if (start && end) return { start, end };
  const startTime = `${date}T09:00:00.000Z`;
  const endDate = new Date(startTime);
  endDate.setHours(endDate.getHours() + Number(hours || 0));
  return { start: startTime, end: endDate.toISOString() };
}

export async function getSunburstData(
  year: number, 
  month: number, 
  focus: string = 'project', 
  mode: string = 'structure'
): Promise<{ root: SunburstNode }> {
  try {
    const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
    const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

    const { data: entries, error } = await supabase
      .from('timesheets')
      .select('id,date,hours,start_time,end_time,project_id,task_id,user_id')
      .gte('date', start)
      .lte('date', end);
      
    if (error) throw error;
    
    // Normalize snake_case to what logic expects or adjust logic
    const normalizedEntries = (entries || []).map((e: any) => ({
        ...e,
        startTime: e.start_time,
        endTime: e.end_time,
        projectId: e.project_id,
        taskId: e.task_id,
        userId: e.user_id
    }));
    
    const pids = Array.from(new Set(normalizedEntries.map((e: any) => e.projectId).filter(Boolean)));
    const tids = Array.from(new Set(normalizedEntries.map((e: any) => e.taskId).filter(Boolean)));
    const uids = Array.from(new Set(normalizedEntries.map((e: any) => e.userId).filter(Boolean)));
    
    const [{ data: projects }, { data: tasks }, { data: users }] = await Promise.all([
      supabase.from('projects').select('id,name,code').in('id', pids),
      supabase.from('tasks').select('id,title').in('id', tids),
      supabase.from('users').select('id,name').in('id', uids),
    ]);

    const safeName = (v: any, fallback: string) => (v && String(v)) || fallback;

    const root: SunburstNode = { name: 'Root', value: 0, children: [] };
    const level1 = new Map<string, SunburstNode>();
    const level2 = new Map<string, SunburstNode>();

    const pMap: Record<string, string> = {};
    for (const p of projects || []) pMap[p.id] = p.name || p.code || p.id;
    const tMap: Record<string, string> = {};
    for (const t of tasks || []) tMap[t.id] = t.title || t.id;
    const uMap: Record<string, string> = {};
    for (const u of users || []) uMap[u.id] = u.name || u.id;

    for (const r of normalizedEntries) {
      const { start: st, end: et } = inferTimes(r.startTime, r.endTime, r.date, r.hours);
      const proj = safeName(pMap[r.projectId], `Project ${r.projectId || ''}`);
      const task = safeName(tMap[r.taskId], `Task ${r.taskId || ''}`);
      const user = safeName(uMap[r.userId], `User ${r.userId || ''}`);

      const a = focus === 'staff' ? user : proj;
      const b = mode === 'worktype' ? task : (focus === 'staff' ? proj : task);
      const c = focus === 'staff' ? task : user;

      const keyA = a;
      const keyB = `${a}::${b}`;

      if (!level1.has(keyA)) {
        const nodeA = { name: a, value: 0, children: [] };
        level1.set(keyA, nodeA);
        root.children.push(nodeA);
      }
      const nodeA = level1.get(keyA)!;

      if (!level2.has(keyB)) {
        const nodeB = { name: b, value: 0, children: [] };
        level2.set(keyB, nodeB);
        nodeA.children.push(nodeB);
      }
      const nodeB = level2.get(keyB)!;

      const leaf = { name: c, value: Number(r.hours || 0), children: [], meta: { start: st, end: et, date: r.date } };
      nodeB.children.push(leaf);
      nodeB.value += leaf.value;
      nodeA.value += leaf.value;
      root.value += leaf.value;
    }

    return { root };
  } catch (error) {
    console.error('Error fetching sunburst data:', error);
    return { root: { name: 'No Data', value: 0, children: [] } };
  }
}
