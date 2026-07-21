import React, { useState } from 'react';
import { Card, Tabs, DatePicker, Space, Button, Table, Row, Col, Statistic } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { formatCurrency } from '../utils/format';
import { BRAND } from '../utils/constants';
import {
  useGetSalesReportQuery,
  useGetBuildingWiseSalesQuery,
  useGetProductConsumptionQuery,
  useGetProfitLossQuery,
} from '../services/reportApi';

const { RangePicker } = DatePicker;

function downloadCSV(header, rows, filename) {
  const csv = [header, ...rows].map((line) => line.join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function SalesTab({ range }) {
  const { data, isFetching } = useGetSalesReportQuery(range);
  const rows = data?.rows || [];
  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card><Statistic title="Total orders" value={data?.totals?.orders || 0} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Total revenue" value={data?.totals?.revenue || 0} prefix="₹" /></Card>
        </Col>
      </Row>
      <Card
        title="Daily revenue"
        style={{ marginBottom: 16 }}
        extra={
          <Button
            icon={<DownloadOutlined />}
            disabled={!rows.length}
            onClick={() => downloadCSV(['Date', 'Orders', 'Revenue'], rows.map((r) => [r.date, r.orders, r.revenue]), 'sales.csv')}
          >
            CSV
          </Button>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(v, n) => (n === 'revenue' ? formatCurrency(v) : v)} />
            <Bar dataKey="revenue" fill={BRAND.primary} radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Table
        rowKey="date"
        loading={isFetching}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 400 }}
        columns={[
          { title: 'Date', dataIndex: 'date' },
          { title: 'Orders', dataIndex: 'orders', align: 'center' },
          { title: 'Revenue', dataIndex: 'revenue', align: 'right', render: (v) => formatCurrency(v) },
        ]}
      />
    </>
  );
}

function BuildingTab({ range }) {
  const { data: rows = [], isFetching } = useGetBuildingWiseSalesQuery(range);
  return (
    <Table
      rowKey="building"
      loading={isFetching}
      dataSource={rows}
      pagination={false}
      scroll={{ x: 400 }}
      title={() => (
        <Button
          icon={<DownloadOutlined />}
          disabled={!rows.length}
          onClick={() => downloadCSV(['Building', 'Orders', 'Revenue'], rows.map((r) => [r.building, r.orders, r.revenue]), 'building-sales.csv')}
        >
          Export CSV
        </Button>
      )}
      columns={[
        { title: 'Society', dataIndex: 'building' },
        { title: 'Orders', dataIndex: 'orders', align: 'center' },
        { title: 'Revenue', dataIndex: 'revenue', align: 'right', render: (v) => formatCurrency(v) },
      ]}
    />
  );
}

function ProductTab({ range }) {
  const { data: rows = [], isFetching } = useGetProductConsumptionQuery(range);
  return (
    <Table
      rowKey="name"
      loading={isFetching}
      dataSource={rows}
      pagination={false}
      scroll={{ x: 400 }}
      title={() => (
        <Button
          icon={<DownloadOutlined />}
          disabled={!rows.length}
          onClick={() => downloadCSV(['Product', 'Kg', 'Revenue'], rows.map((r) => [r.name, r.totalKg, r.revenue]), 'product-consumption.csv')}
        >
          Export CSV
        </Button>
      )}
      columns={[
        { title: 'Product', dataIndex: 'name', render: (n, r) => `${r.emoji || ''} ${n}` },
        { title: 'Quantity', dataIndex: 'totalKg', align: 'right', render: (v) => `${v} kg` },
        { title: 'Revenue', dataIndex: 'revenue', align: 'right', render: (v) => formatCurrency(v) },
      ]}
    />
  );
}

function ProfitLossTab({ range }) {
  const { data } = useGetProfitLossQuery(range);
  const profit = data?.profit || 0;
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}><Card><Statistic title="Revenue" value={data?.revenue || 0} prefix="₹" valueStyle={{ color: '#2E7D32' }} /></Card></Col>
      <Col xs={24} md={8}><Card><Statistic title="Expenses" value={data?.expenses || 0} prefix="₹" valueStyle={{ color: '#cf1322' }} /></Card></Col>
      <Col xs={24} md={8}><Card><Statistic title={profit >= 0 ? 'Profit' : 'Loss'} value={Math.abs(profit)} prefix="₹" valueStyle={{ color: profit >= 0 ? '#2E7D32' : '#cf1322' }} /></Card></Col>
      <Col xs={24}>
        <Card title="Expense breakdown">
          <Table
            rowKey="category"
            pagination={false}
            dataSource={data?.expenseByCategory || []}
            columns={[
              { title: 'Category', dataIndex: 'category' },
              { title: 'Amount', dataIndex: 'total', align: 'right', render: (v) => formatCurrency(v) },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default function Reports() {
  const [range, setRange] = useState({});

  const onRange = (r) =>
    setRange({
      from: r?.[0]?.startOf('day').toISOString(),
      to: r?.[1]?.endOf('day').toISOString(),
    });

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Sales, building-wise, product consumption and profit & loss"
        extra={<RangePicker onChange={onRange} />}
      />
      <Card>
        <Tabs
          defaultActiveKey="sales"
          items={[
            { key: 'sales', label: 'Sales', children: <SalesTab range={range} /> },
            { key: 'building', label: 'Building-wise', children: <BuildingTab range={range} /> },
            { key: 'product', label: 'Product Consumption', children: <ProductTab range={range} /> },
            { key: 'pl', label: 'Profit & Loss', children: <ProfitLossTab range={range} /> },
          ]}
        />
      </Card>
    </>
  );
}
