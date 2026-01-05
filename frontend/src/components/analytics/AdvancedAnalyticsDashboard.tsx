import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Progress,
  Statistic,
  Table,
  Tag,
  Alert,
  Tabs,
  Select,
  DatePicker,
  Space,
  Button,
  Tooltip,
  Badge,
  Avatar,
  List,
  Typography
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  BulbOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import {
  Line,
  Bar,
  Pie,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import {
  useProjectHealthScores,
  usePredictiveInsights,
  useResourceBottlenecks,
  useProjectRiskAssessment,
  useTeamProductivityInsights,
  usePredictiveCompletion,
  useSmartRecommendations,
  useAnomalyDetection,
  useIntelligentSearch
} from '../../hooks/use-advanced-analytics';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface AdvancedAnalyticsDashboardProps {
  projectId?: string;
  userId?: string;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  projectId,
  userId
}) => {
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [selectedMetric, setSelectedMetric] = useState('health_score');

  // Advanced analytics hooks
  const { data: healthScores, isLoading: healthLoading } = useProjectHealthScores(projectId);
  const { data: predictiveInsights } = usePredictiveInsights('project', projectId);
  const { data: bottlenecks, isLoading: bottlenecksLoading } = useResourceBottlenecks(60);
  const { data: riskAssessment } = useProjectRiskAssessment();
  const { data: productivityInsights } = useTeamProductivityInsights();
  const { data: predictiveCompletion } = usePredictiveCompletion();
  const { data: recommendations } = useSmartRecommendations('project', projectId || '');
  const { data: anomalies } = useAnomalyDetection('project_health', projectId);
  const { search, isSearching, searchResults } = useIntelligentSearch();

  // Process data for visualizations
  const healthScoreTrend = useMemo(() => {
    if (!healthScores) return [];

    return healthScores.map(score => ({
      date: dayjs(score.calculatedAt).format('MMM DD'),
      healthScore: score.healthScore,
      riskLevel: score.riskLevel,
      projectName: score.projectName || 'Unknown Project'
    }));
  }, [healthScores]);

  const riskDistribution = useMemo(() => {
    if (!riskAssessment) return [];

    const riskCounts = riskAssessment.reduce((acc, project) => {
      acc[project.risk_level] = (acc[project.risk_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(riskCounts).map(([risk, count]) => ({
      risk: risk.charAt(0).toUpperCase() + risk.slice(1),
      count,
      color: risk === 'critical' ? '#ff4d4f' : risk === 'high' ? '#faad14' : risk === 'medium' ? '#1890ff' : '#52c41a'
    }));
  }, [riskAssessment]);

  const productivityMetrics = useMemo(() => {
    if (!productivityInsights) return [];

    return productivityInsights.map(user => ({
      name: user.name,
      completionRate: user.completion_rate,
      totalHours: user.total_hours_logged,
      activeTasks: user.active_tasks,
      department: user.department
    }));
  }, [productivityInsights]);

  const predictiveAccuracy = useMemo(() => {
    if (!predictiveCompletion) return { accuracy: 0, confidence: 0 };

    const accurate = predictiveCompletion.filter(p =>
      Math.abs(dayjs(p.predicted_completion_date).diff(dayjs(p.end_date), 'days')) < 7
    ).length;

    return {
      accuracy: predictiveCompletion.length > 0 ? (accurate / predictiveCompletion.length) * 100 : 0,
      confidence: predictiveCompletion.reduce((sum, p) => sum + p.prediction_confidence, 0) / predictiveCompletion.length
    };
  }, [predictiveCompletion]);

  const bottleneckColumns = [
    {
      title: 'Team Member',
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Bottleneck Type',
      dataIndex: 'bottleneckType',
      key: 'bottleneckType',
      render: (type: string) => {
        const colors = {
          overloaded: 'red',
          underutilized: 'orange',
          skill_gap: 'blue'
        };
        return <Tag color={colors[type as keyof typeof colors] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: 'Severity',
      dataIndex: 'severityScore',
      key: 'severityScore',
      render: (score: number) => (
        <Progress
          percent={score}
          size="small"
          status={score > 80 ? 'exception' : score > 60 ? 'warning' : 'success'}
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: 'Recommendations',
      dataIndex: 'recommendations',
      key: 'recommendations',
      render: (recs: string[]) => (
        <List
          size="small"
          dataSource={recs.slice(0, 2)}
          renderItem={item => <List.Item style={{ padding: '2px 0' }}>{item}</List.Item>}
        />
      ),
    },
  ];

  const anomalyColumns = [
    {
      title: 'Metric',
      dataIndex: 'metricType',
      key: 'metricType',
    },
    {
      title: 'Anomaly Score',
      dataIndex: 'anomalyScore',
      key: 'anomalyScore',
      render: (score: number) => (
        <Badge
          count={`${score.toFixed(1)}σ`}
          style={{
            backgroundColor: score > 3 ? '#ff4d4f' : score > 2 ? '#faad14' : '#52c41a'
          }}
        />
      ),
    },
    {
      title: 'Detected At',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      render: (date: string) => dayjs(date).format('MMM DD, HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'red' : 'green'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>
              <RobotOutlined className="mr-2" />
              Advanced Analytics Dashboard
            </Title>
            <Text type="secondary">
              AI-powered insights and predictive analytics for project management
            </Text>
          </Col>
          <Col>
            <Space>
              <RangePicker
                value={timeRange}
                onChange={(dates) => dates && setTimeRange(dates)}
                format="MMM DD, YYYY"
              />
              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                style={{ width: 150 }}
              >
                <Option value="health_score">Health Score</Option>
                <Option value="risk_level">Risk Level</Option>
                <Option value="productivity">Productivity</Option>
                <Option value="completion">Completion Rate</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Predictive Accuracy"
              value={predictiveAccuracy.accuracy}
              precision={1}
              suffix="%"
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: predictiveAccuracy.accuracy > 80 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Anomalies"
              value={anomalies?.length || 0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: (anomalies?.length || 0) > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Resource Bottlenecks"
              value={bottlenecks?.length || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: (bottlenecks?.length || 0) > 2 ? '#ff4d4f' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="AI Recommendations"
              value={recommendations?.length || 0}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultActiveKey="overview" type="card">
        <Tabs.TabPane
          tab={
            <span>
              <BarChartOutlined />
              Overview
            </span>
          }
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Project Health Trend" loading={healthLoading}>
                <ResponsiveContainer width="100%" height={300}>
                  <Line
                    data={healthScoreTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="healthScore"
                      stroke="#1890ff"
                      strokeWidth={2}
                      name="Health Score"
                    />
                  </Line>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Risk Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ risk, percent }) => `${risk} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <WarningOutlined />
              Resource Optimization
            </span>
          }
          key="resources"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title="Resource Bottlenecks" loading={bottlenecksLoading}>
                <Table
                  columns={bottleneckColumns}
                  dataSource={bottlenecks}
                  rowKey="userId"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mt-6">
            <Col xs={24} lg={12}>
              <Card title="Team Productivity Insights">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={productivityMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="completionRate" fill="#1890ff" name="Completion Rate %" />
                    <Line yAxisId="right" type="monotone" dataKey="activeTasks" stroke="#52c41a" name="Active Tasks" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Predictive Completion Timeline">
                <List
                  dataSource={predictiveCompletion?.slice(0, 5) || []}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<ClockCircleOutlined />} />}
                        title={item.name}
                        description={
                          <Space direction="vertical" size="small">
                            <Text>Predicted: {dayjs(item.predicted_completion_date).format('MMM DD, YYYY')}</Text>
                            <Progress
                              percent={item.prediction_confidence}
                              size="small"
                              format={(percent) => `${percent}% confidence`}
                            />
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <ThunderboltOutlined />
              AI Insights
            </span>
          }
          key="insights"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Smart Recommendations">
                <List
                  dataSource={recommendations || []}
                  renderItem={(rec, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<BulbOutlined />} style={{ backgroundColor: '#1890ff' }} />}>
                        title={`Recommendation ${index + 1}`}
                        description={rec.description}
                      </List.Item.Meta>
                      <Tag color={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'orange' : 'green'}>
                        {rec.priority} priority
                      </Tag>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Anomaly Detection">
                <Table
                  columns={anomalyColumns}
                  dataSource={anomalies}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <ExperimentOutlined />
              Predictive Analytics
            </span>
          }
          key="predictions"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Alert
                message="Predictive Analytics"
                description="AI-powered predictions for project completion, resource needs, and risk assessment."
                type="info"
                showIcon
                className="mb-6"
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Prediction Confidence Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <Scatter
                    data={predictiveCompletion?.map(p => ({
                      x: p.prediction_confidence,
                      y: Math.abs(dayjs(p.predicted_completion_date).diff(dayjs(p.end_date), 'days')),
                      name: p.name
                    })) || []}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name="Confidence %" domain={[0, 100]} />
                    <YAxis type="number" dataKey="y" name="Days Error" />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Predictions" dataKey="y" fill="#1890ff" />
                  </Scatter>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Predictive Insights">
                <List
                  dataSource={predictiveInsights || []}
                  renderItem={(insight) => (
                    <List.Item>
                      <List.Item.Meta
                        title={insight.predictionType}
                        description={
                          <Space direction="vertical" size="small">
                            <Text>{insight.predictionData.description}</Text>
                            <Progress
                              percent={insight.confidenceScore}
                              size="small"
                              format={(percent) => `${percent}% confidence`}
                            />
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;