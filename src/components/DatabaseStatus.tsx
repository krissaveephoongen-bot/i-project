import React from 'react';
import { Badge, Tooltip, Space, Spin } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useDatabaseStatus } from '../hooks/useDatabaseStatus';
import { formatDateThai } from '../services/databaseService';
import type { ConnectionStatus } from '../services/databaseService';

export const DatabaseStatus: React.FC = () => {
  const { status, loading, error } = useDatabaseStatus(30000);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Spin size="small" />
        <span style={{ fontSize: '12px' }}>กำลังตรวจสอบ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Tooltip title={`ข้อผิดพลาด: ${error}`}>
        <Badge
          icon={<CloseCircleOutlined />}
          status="error"
          text={<span style={{ fontSize: '12px', color: '#ff4d4f' }}>ไม่สามารถเชื่อมต่อ</span>}
        />
      </Tooltip>
    );
  }

  if (!status) {
    return null;
  }

  const isConnected = status.connected;
  const statusIcon = isConnected ? (
    <CheckCircleOutlined style={{ color: '#52c41a' }} />
  ) : (
    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
  );

  const statusText = isConnected ? 'เชื่อมต่อ' : 'ไม่เชื่อมต่อ';
  const statusColor = isConnected ? 'success' : 'warning';

  const tooltipContent = (
    <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
      <div><strong>สถานะ:</strong> {status.connected ? '✓ เชื่อมต่อ' : '✗ ไม่เชื่อมต่อ'}</div>
      <div><strong>ผู้ให้บริการ:</strong> {status.provider || 'Unknown'}</div>
      {status.lastSuccessfulConnection && (
        <div>
          <strong>เชื่อมต่อครั้งล่าสุด:</strong> {formatDateThai(status.lastSuccessfulConnection)}
        </div>
      )}
      {status.connectionDuration && (
        <div>
          <strong>ระยะเวลาการเชื่อมต่อ:</strong> {status.connectionDuration}ms
        </div>
      )}
      {status.retryCount && status.retryCount > 0 && (
        <div>
          <strong>จำนวนความพยายาม:</strong> {status.retryCount}
        </div>
      )}
      {status.lastConnectionAttempt && (
        <div>
          <strong>พยายามครั้งล่าสุด:</strong> {formatDateThai(status.lastConnectionAttempt)}
        </div>
      )}
      {status.lastError && (
        <div style={{ color: '#ff7875', marginTop: '8px' }}>
          <strong>ข้อผิดพลาดล่าสุด:</strong> {status.lastError}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent}>
      <Badge
        icon={statusIcon}
        status={statusColor}
        text={
          <Space size={4} style={{ fontSize: '12px' }}>
            <DatabaseOutlined />
            <span>{statusText}</span>
          </Space>
        }
      />
    </Tooltip>
  );
};

export default DatabaseStatus;
