import React, { useState } from 'react';
import { Card, DatePicker, Button, Table, Row, Col, Statistic, Space, Empty, Typography } from 'antd';
import { PrinterOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { useGetDailyPurchaseQuery } from '../services/reportApi';
import { formatCurrency } from '../utils/format';
import { BRAND } from '../utils/constants';

function downloadCSV(rows, filename) {
  const header = ['Product', 'Quantity (kg)', 'Est. Cost (INR)', 'Orders'];
  const body = rows.map((r) => [r.name, r.totalKg, r.estimatedCost, r.orderCount]);
  const csv = [header, ...body].map((line) => line.join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printReport(date, rows, totalCost) {
  const body = rows
    .map(
      (r) => `<tr><td>${r.emoji || ''} ${r.name}</td><td class="r">${r.totalKg} kg</td>
      <td class="r">${formatCurrency(r.estimatedCost)}</td><td class="r">${r.orderCount}</td></tr>`
    )
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"/>
    <title>Daily Purchase — ${date}</title>
    <style>
      *{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}
      body{padding:32px;color:#1a1d1f}
      h1{color:${BRAND.primary};margin:0}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{text-align:left;padding:8px;border-bottom:1px solid #eee}
      th{color:#6b7280} .r{text-align:right}
      .total{margin-top:12px;font-weight:700;text-align:right;font-size:16px}
    </style></head><body>
    <h1>🥦 Daily Purchase Report</h1>
    <div style="color:#6b7280">${dayjs(date).format('DD MMMM YYYY')}</div>
    <table><thead><tr><th>Product</th><th class="r">Quantity</th><th class="r">Est. Cost</th><th class="r">Orders</th></tr></thead>
    <tbody>${body}</tbody></table>
    <div class="total">Total estimated cost: ${formatCurrency(totalCost)}</div>
    <script>window.onload=function(){window.print()}</script></body></html>`;
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export default function DailyPurchaseReport() {
  const [date, setDate] = useState(dayjs());
  const dateStr = date.format('YYYY-MM-DD');
  const { data, isLoading, isFetching, refetch } = useGetDailyPurchaseQuery(dateStr);

  const items = data?.items || [];

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      render: (n, r) => (
        <span style={{ fontWeight: 600 }}>
          <span style={{ marginRight: 8 }}>{r.emoji}</span>
          {n}
        </span>
      ),
    },
    {
      title: 'Quantity Required',
      dataIndex: 'totalKg',
      align: 'right',
      render: (v) => <Typography.Text strong>{v} kg</Typography.Text>,
      sorter: (a, b) => a.totalKg - b.totalKg,
    },
    {
      title: 'Est. Cost',
      dataIndex: 'estimatedCost',
      align: 'right',
      render: (v) => formatCurrency(v),
      sorter: (a, b) => a.estimatedCost - b.estimatedCost,
    },
    { title: 'In Orders', dataIndex: 'orderCount', align: 'center' },
  ];

  return (
    <>
      <PageHeader
        title="Daily Purchase Report"
        subtitle="Total quantity to buy from the market for the selected day"
        extra={
          <Space wrap>
            <DatePicker value={date} onChange={(d) => setDate(d || dayjs())} allowClear={false} />
            <Button icon={<ReloadOutlined />} onClick={refetch} loading={isFetching} />
            <Button
              icon={<DownloadOutlined />}
              disabled={!items.length}
              onClick={() => downloadCSV(items, `daily-purchase-${dateStr}.csv`)}
            >
              Export CSV
            </Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              disabled={!items.length}
              onClick={() => printReport(dateStr, items, data?.totalEstimatedCost || 0)}
            >
              Print / PDF
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={8}>
          <Card>
            <Statistic title="Products to buy" value={data?.totalProducts || 0} loading={isLoading} />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="Estimated cost"
              value={data?.totalEstimatedCost || 0}
              prefix="₹"
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          rowKey="productId"
          columns={columns}
          dataSource={items}
          loading={isLoading || isFetching}
          pagination={false}
          scroll={{ x: 560 }}
          locale={{
            emptyText: <Empty description={`No orders on ${date.format('DD MMM YYYY')}`} />,
          }}
        />
      </Card>
    </>
  );
}
