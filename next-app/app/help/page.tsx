import { getHelpContacts } from '@/app/lib/data-service';

export const dynamic = 'force-dynamic';

export default async function HelpPage() {
  const { team, stakeholders } = await getHelpContacts();
  
  const Cell = ({ v }: { v: any }) => <span className="text-sm text-slate-700">{v || '-'}</span>;
  const Table = ({ rows }: { rows: Array<any> }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">ชื่อ-นามสกุล</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">เบอร์โทร</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Email</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">ตำแหน่ง</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Management</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3"><Cell v={r.name} /></td>
              <td className="py-2 px-3"><Cell v={r.phone} /></td>
              <td className="py-2 px-3"><Cell v={r.email} /></td>
              <td className="py-2 px-3"><Cell v={r.position} /></td>
              <td className="py-2 px-3"><Cell v={r.management ? 'Yes' : 'No'} /></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="py-3 px-3 text-sm text-slate-500" colSpan={5}>No contacts</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  return (
    <div className="min-h-screen">
      <div className="pt-20 px-6 pb-6 max-w-5xl">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Help & Support</h1>
        <div className="grid gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-3">Team Contacts</h2>
            <Table rows={team} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-3">Stakeholder Contacts</h2>
            <Table rows={stakeholders} />
          </div>
        </div>
      </div>
    </div>
  );
}
