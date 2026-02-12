'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Download, Eye, AlertTriangle, Shield, User, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/Dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { AuditEventType, AuditSeverity, AUDIT_EVENT_LABELS, AUDIT_SEVERITY_COLORS } from '../lib/audit';
import { useParams } from 'next/navigation';

interface AuditLogRow {
  id: string;
  created_at: string;
  event_type: string;
  severity: string;
  user_id: string;
  details: string;
  ip_address?: string;
  user_agent?: string;
  user_name?: string;
  user_email?: string;
}

export default function AuditLogViewer() {
  const { t } = useTranslation();
  const params = useParams() as { id?: string };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [rows, setRows] = useState<AuditLogRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const id = params?.id || '';
        const url = id ? `/api/audit/logs?projectId=${id}` : '/api/audit/logs';
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        setRows(json || []);
      } catch {
        setRows([]);
      }
    };
    load();
  }, [params?.id]);

  const filteredLogs = useMemo(() => {
    return rows.filter(log => {
      const matchesSearch = !searchTerm || 
        (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_email || log.user_id || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEvent = !selectedEvent || log.event_type === selectedEvent;
      const matchesSeverity = !selectedSeverity || log.severity === selectedSeverity;
      const matchesUser = !selectedUser || (log.user_email || log.user_id) === selectedUser;
      
      return matchesSearch && matchesEvent && matchesSeverity && matchesUser;
    });
  }, [searchTerm, selectedEvent, selectedSeverity, selectedUser]);

  const getSeverityBadge = (severity: AuditSeverity) => {
    const variant = severity === AuditSeverity.CRITICAL ? 'destructive' : 
                   severity === AuditSeverity.HIGH ? 'destructive' : 
                   severity === AuditSeverity.MEDIUM ? 'secondary' : 'default';
    return <Badge variant={variant}>{severity}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('audit.title')}</CardTitle>
          <CardDescription>
            {t('audit.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder={t('audit.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('audit.filter.event')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('audit.filter.allEvents')}</SelectItem>
                  {Object.values(AuditEventType).map((event) => (
                    <SelectItem key={event} value={event}>
                      {AUDIT_EVENT_LABELS[event]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('audit.filter.severity')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('audit.filter.allSeverities')}</SelectItem>
                  {Object.values(AuditSeverity).map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder={t('audit.filter.user')}
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('audit.columns.timestamp')}</TableHead>
                  <TableHead>{t('audit.columns.event')}</TableHead>
                  <TableHead>{t('audit.columns.severity')}</TableHead>
                  <TableHead>{t('audit.columns.user')}</TableHead>
                  <TableHead>{t('audit.columns.details')}</TableHead>
                  <TableHead>{t('audit.columns.ip')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(log.created_at), 'PPppp HH:mm:ss')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {AUDIT_EVENT_LABELS[log.event_type as AuditEventType] || log.event_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(log.severity as AuditSeverity)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {(log.user_email || log.user_id || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{log.user_email || log.user_id}</div>
                          <div className="text-sm text-muted-foreground">
                            {log.ip_address}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm truncate" title={log.details}>
                        {log.details}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {log.user_agent}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
