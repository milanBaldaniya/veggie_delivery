import React from 'react';
import { Row, Col, Card, Table, Tag, Empty, Progress, Typography, Space, Button, Statistic } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';
import { useGetDashboardQuery } from '../services/dashboardApi';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { ORDER_STATUS_META, BRAND } from '../utils/constants';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const { data, isLoading, isFetching, refetch } = useGetDashboardQuery();
  const t = data?.totals || {};
  const chartData = (data?.salesGraph || []).map((d) => ({ ...d, day: dayjs(d.date).format('DD MMM') }));
  const billing = data?.billing;
  const weeklyData = (billing?.weeklySummary || []).map((w) => ({
    label: `W${w.weekNumber}`,
    total: w.total,
    collected: w.collected,
  }));
  const activeWeekLabel = billing
    ? `Week ${billing.activeWeek.weekNumber} · ${dayjs(billing.activeWeek.periodStart).format('DD MMM')} – ${dayjs(billing.activeWeek.periodEnd).subtract(1, 'day').format('DD MMM')}`
    : '';

  const stats = [
    { title: 'Total Orders', value: t.totalOrders, icon: <ShoppingCartOutlined />, color: '#2E7D32' },
    { title: "Today's Orders", value: t.todayOrders, icon: <CalendarOutlined />, color: '#1677ff' },
    { title: 'Weekly Orders', value: t.weekOrders, icon: <CalendarOutlined />, color: '#722ed1' },
    { title: 'Monthly Orders', value: t.monthOrders, icon: <CalendarOutlined />, color: '#13c2c2' },
    { title: 'Revenue', value: t.revenue, prefix: '₹', icon: <DollarOutlined />, color: '#2E7D32' },
    { title: 'Pending Payments', value: t.pendingPayments, prefix: '₹', icon: <ClockCircleOutlined />, color: '#faad14' },
    { title: 'Total Users', value: t.totalUsers, icon: <UserOutlined />, color: '#1677ff' },
    { title: 'Buildings', value: t.totalBuildings, icon: <HomeOutlined />, color: '#eb2f96' },
    { title: 'Watchmen', value: t.totalWatchmen, icon: <TeamOutlined />, color: '#08979c' },
  ];

  const statusEntries = Object.entries(data?.orderStatusStats || {});
  const statusTotal = statusEntries.reduce((s, [, c]) => s + c, 0) || 1;

  const recentColumns = [
    {
      title: 'Order',
      dataIndex: 'id',
      render: (id) => <Typography.Text code>#{id.slice(-6).toUpperCase()}</Typography.Text>,
    },
    { title: 'Customer', dataIndex: ['deliveryAddress', 'name'], render: (v) => v || '—' },
    { title: 'Building', dataIndex: ['deliveryAddress', 'building'], render: (v) => v || '—' },
    {
      title: 'Items',
      dataIndex: 'items',
      render: (items) => items.length,
      align: 'center',
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      render: (v) => formatCurrency(v),
      align: 'right',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => {
        const m = ORDER_STATUS_META[s] || { label: s, color: 'default' };
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    {
      title: 'Placed',
      dataIndex: 'createdAt',
      render: (v) => dayjs(v).format('DD MMM, hh:mm A'),
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of orders, revenue and operations"
        extra={
          <Button icon={<ReloadOutlined />} onClick={refetch} loading={isFetching}>
            Refresh
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col xs={12} sm={12} md={8} lg={6} xl={6} xxl={4} key={s.title}>
            <StatCard {...s} loading={isLoading} />
          </Col>
        ))}
      </Row>

      {billing && (
        <Card
          title={`Weekly Billing — Active ${activeWeekLabel}`}
          style={{ marginTop: 16 }}
          loading={isLoading}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Statistic title="Pending Bills" value={billing.pendingBills} valueStyle={{ color: '#faad14' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="Paid Bills" value={billing.paidBills} valueStyle={{ color: '#2E7D32' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="Pending Amount" prefix="₹" value={billing.pendingAmount} valueStyle={{ color: '#cf1322' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="Collected Amount" prefix="₹" value={billing.collectedAmount} valueStyle={{ color: '#2E7D32' }} />
            </Col>
          </Row>

          {weeklyData.length > 0 && (
            <ResponsiveContainer width="100%" height={260} style={{ marginTop: 8 }}>
              <BarChart data={weeklyData} margin={{ top: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="total" name="Billed" fill={BRAND.primary} radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="collected" name="Collected" fill="#faad14" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Orders — last 7 days" loading={isLoading}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill={BRAND.primary} radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Revenue — last 7 days" loading={isLoading}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={BRAND.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={BRAND.primary}
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Order Status" loading={isLoading} style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={14}>
              {statusEntries.map(([status, count]) => {
                const m = ORDER_STATUS_META[status] || { label: status, color: 'default' };
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Tag color={m.color}>{m.label}</Tag>
                      <Typography.Text strong>{count}</Typography.Text>
                    </div>
                    <Progress
                      percent={Math.round((count / statusTotal) * 100)}
                      showInfo={false}
                      strokeColor={BRAND.primary}
                    />
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Recent Orders" loading={isLoading}>
            <Table
              rowKey="id"
              columns={recentColumns}
              dataSource={data?.recentOrders || []}
              pagination={false}
              size="small"
              scroll={{ x: 720 }}
              locale={{ emptyText: <Empty description="No orders yet" /> }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
