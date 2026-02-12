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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Database</h3>
              <p className={`text-sm font-medium ${data?.database?.connected ? 'text-green-600' : 'text-red-600'}`}>
                {data?.database?.connected ? 'Connected' : 'Disconnected'}
              </p>
              <div className="text-xs text-slate-600 mt-2">
                <p>URL Present: {String(data?.database?.urlPresent)}</p>
                <p>Direct URL Present: {String(data?.database?.directUrlPresent)}</p>
                <p>Host: {String(data?.database?.host || '-')}</p>
                <p>Port: {String(data?.database?.port || '-')}</p>
                {data?.database?.error && <p className="text-red-600">Error: {String(data?.database?.error)}</p>}
              </div>
              <div className="mt-2">
                <a href="/api/health" className="text-[#2563EB] text-sm underline">View JSON</a>
                <button
                  onClick={async ()=>{
                    try {
                      const r = await fetch('/api/admin/db-test', { cache: 'no-store' });
                      const j = await r.json();
                      alert(`DB Ping: connected=${j.connected}, projectsCount=${j.projectsCount ?? '-'}`);
                    } catch (e:any) {
                      alert(`DB Ping error: ${e?.message || e}`);
                    }
                  }}
                  className="ml-3 px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                >
                  Ping DB
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Supabase</h3>
              <p className={`text-sm font-medium ${data?.supabase?.connected ? 'text-green-600' : 'text-red-600'}`}>
                {data?.supabase?.connected ? 'Connected' : 'Disconnected'}
              </p>
              <div className="text-xs text-slate-600 mt-2">
                <p>URL Present: {String(data?.supabase?.urlPresent)}</p>
                <p>Key Present: {String(data?.supabase?.keyPresent)}</p>
                <p>URL: {String(data?.supabase?.url || '-')}</p>
                {data?.supabase?.error && <p className="text-red-600">Error: {String(data?.supabase?.error)}</p>}
              </div>
              <div className="mt-2">
                <a href="/api/health" className="text-[#2563EB] text-sm underline">View JSON</a>
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
                  className="ml-3 px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs"
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
