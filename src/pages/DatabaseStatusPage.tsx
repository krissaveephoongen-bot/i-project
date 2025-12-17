import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Statistic, Tag, Divider, Table, Empty, Spin, message } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useDatabaseStatus } from '../hooks/useDatabaseStatus';
import { getHealthCheck, testSimpleConnection, formatDateThai } from '../services/databaseService';
import type { ConnectionStatus } from '../services/databaseService';

export const DatabaseStatusPage: React.FC = () => {
  const { status, loading, error, refetch } = useDatabaseStatus(10000);
  const [loadingHealthCheck, setLoadingHealthCheck] = useState(false);
  const [loadingSimpleTest, setLoadingSimpleTest] = useState(false);
  const [healthCheckResult, setHealthCheckResult] = useState<any>(null);

  const handleRefresh = () => {
    refetch();
    message.info('กำลังรีเฟรช...');
  };

  const handleHealthCheck = async () => {
    setLoadingHealthCheck(true);
    try {
      const result = await getHealthCheck();
      setHealthCheckResult(result);
      if (result.success) {
        message.success('Health check สำเร็จ');
      } else {
        message.error(result.message || 'Health check ไม่สำเร็จ');
      }
    } catch (err) {
      message.error('เกิดข้อผิดพลาดในการ health check');
    } finally {
      setLoadingHealthCheck(false);
    }
  };

  const handleSimpleTest = async () => {
    setLoadingSimpleTest(true);
    try {
      const result = await testSimpleConnection();
      if (result.success) {
        message.success('การเชื่อมต่อสำเร็จ');
      } else {
        message.error(result.message || 'การเชื่อมต่อล้มเหลว');
      }
    } catch (err) {
      message.error('เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ');
    } finally {
      setLoadingSimpleTest(false);
    }
  };

  const statusData = [
    {
      key: 'status',
      label: 'สถานะการเชื่อมต่อ',
      value: status?.connected ? 'เชื่อมต่อ' : 'ไม่เชื่อมต่อ',
      icon: status?.connected ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    },
    {
      key: 'provider',
      label: 'ผู้ให้บริการ',
      value: status?.provider || '-',
    },
    {
      key: 'connectionDuration',
      label: 'ระยะเวลาการเชื่อมต่อ',
      value: status?.connectionDuration ? `${status.connectionDuration}ms` : '-',
    },
    {
      key: 'retryCount',
      label: 'จำนวนความพยายาม',
      value: status?.retryCount || 0,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <DatabaseOutlined />
            <span>สถานะฐานข้อมูล</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              loading={loadingHealthCheck}
              onClick={handleHealthCheck}
            >
              Health Check
            </Button>
            <Button
              loading={loadingSimpleTest}
              onClick={handleSimpleTest}
            >
              ทดสอบการเชื่อมต่อ
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              รีเฟรช
            </Button>
          </Space>
        }
      >
        {loading && !status ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ff4d4f' }}>
            <CloseCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <p>{error}</p>
          </div>
        ) : status ? (
          <>
            {/* Connection Status Cards */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="สถานะ"
                    value={status.connected ? 'เชื่อมต่อแล้ว' : 'ไม่เชื่อมต่อ'}
                    prefix={status.connected ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    valueStyle={{ color: status.connected ? '#52c41a' : '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="ผู้ให้บริการ"
                    value={status.provider || 'Unknown'}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="ระยะเวลาการเชื่อมต่อ"
                    value={status.connectionDuration ? `${status.connectionDuration}ms` : '-'}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="จำนวนความพยายาม"
                    value={status.retryCount || 0}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            {/* Detailed Information */}
            <h3>ข้อมูลรายละเอียด</h3>
            <Row gutter={16}>
              <Col span={24}>
                <Table
                  dataSource={[
                    {
                      key: 'lastSuccessfulConnection',
                      label: 'เชื่อมต่อครั้งล่าสุด',
                      value: formatDateThai(status.lastSuccessfulConnection),
                    },
                    {
                      key: 'lastConnectionAttempt',
                      label: 'พยายามครั้งล่าสุด',
                      value: formatDateThai(status.lastConnectionAttempt),
                    },
                    {
                      key: 'lastError',
                      label: 'ข้อผิดพลาดล่าสุด',
                      value: status.lastError ? (
                        <Tag color="error">{status.lastError}</Tag>
                      ) : (
                        <Tag color="success">ไม่มี</Tag>
                      ),
                    },
                  ]}
                  columns={[
                    {
                      title: 'ข้อมูล',
                      dataIndex: 'label',
                      key: 'label',
                      width: 200,
                    },
                    {
                      title: 'ค่า',
                      dataIndex: 'value',
                      key: 'value',
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              </Col>
            </Row>

            <Divider />

            {/* Health Check Result */}
            {healthCheckResult && (
              <>
                <h3>ผลลัพธ์ Health Check</h3>
                <Card
                  style={{
                    borderLeft: `4px solid ${healthCheckResult.data?.status === 'healthy' ? '#52c41a' : '#ff4d4f'}`,
                  }}
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <div style={{ marginBottom: '12px' }}>
                        <strong>สถานะ:</strong>{' '}
                        <Tag color={healthCheckResult.data?.status === 'healthy' ? 'green' : 'red'}>
                          {healthCheckResult.data?.status}
                        </Tag>
                      </div>
                      {healthCheckResult.data?.currentTime && (
                        <div style={{ marginBottom: '12px' }}>
                          <strong>เวลาปัจจุบัน:</strong> {healthCheckResult.data.currentTime}
                        </div>
                      )}
                      {healthCheckResult.data?.postgresVersion && (
                        <div style={{ marginBottom: '12px' }}>
                          <strong>PostgreSQL เวอร์ชัน:</strong> {healthCheckResult.data.postgresVersion}
                        </div>
                      )}
                      {healthCheckResult.data?.error && (
                        <div style={{ marginBottom: '12px', color: '#ff4d4f' }}>
                          <strong>ข้อผิดพลาด:</strong> {healthCheckResult.data.error}
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card>
              </>
            )}
          </>
        ) : (
          <Empty description="ไม่มีข้อมูล" />
        )}
      </Card>
    </div>
  );
};

export default DatabaseStatusPage;
