'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';

export const dynamic = 'force-dynamic';

export default function AdminHealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/health', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'health error');
        setData(json);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return (
    <div className="min-h-screen">
      <Header
        title="System Health"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Health' }
        ]}
      />
      <div className="pt-20 px-6 pb-6">
        {loading ? (
          <div className="text-center">Checking health...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Supabase Connection</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Status:</span>
                  <span className={`text-sm font-medium ${data?.supabase?.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {data?.supabase?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">URL Present:</span>
                  <span className="text-sm text-slate-600">{String(data?.supabase?.urlPresent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Key Present:</span>
                  <span className="text-sm text-slate-600">{String(data?.supabase?.keyPresent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">URL:</span>
                  <span className="text-sm text-slate-600 truncate max-w-xs">{String(data?.supabase?.url || '-')}</span>
                </div>
                {data?.supabase?.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-600">Error: {String(data?.supabase?.error)}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <a href="/api/health" className="text-[#2563EB] text-sm underline hover:text-blue-700">View JSON</a>
                <button
                  onClick={async ()=>{
                    try {
                      const r = await fetch('/api/admin/supabase-ping', { cache: 'no-store' });
                      const j = await r.json();
                      alert(`Supabase Ping: connected=${j.connected}, sample=${JSON.stringify(j.sample || [])}`);
                    } catch (e:any) {
                      alert(`Supabase Ping error: ${e?.message || e}`);
                    }
                  }}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs hover:bg-slate-200"
                >
                  Ping Supabase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
