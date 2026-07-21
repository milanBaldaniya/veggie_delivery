import React, { useState } from 'react';
import { Card, DatePicker, Button, Space, Empty, Tag, List, Typography, App, Popconfirm, Row, Col, Statistic } from 'antd';
import { PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { ORDER_STATUS_META, BRAND } from '../utils/constants';
import { formatWeight } from '../utils/format';
import { useGetPackingQuery, useCloseDayMutation } from '../services/packingApi';

function printPacking(dateStr, byBuilding) {
  const sections = Object.entries(byBuilding)
    .map(([building, lists]) => {
      const cards = lists
        .map(
          (l) => `<div class="cust"><strong>${l.customerName || '—'}</strong> — Flat ${l.flat || '—'}${
            l.wing ? `, Wing ${l.wing}` : ''
          } <span class="muted">(#${l.shortId})</span>
          <ul>${l.items.map((i) => `<li>${i.emoji || ''} ${i.name} — ${formatWeight(i.grams)}</li>`).join('')}</ul></div>`
        )
        .join('');
      return `<h2>${building}</h2>${cards}`;
    })
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Packing — ${dateStr}</title>
    <style>*{font-family:-apple-system,Segoe UI,Roboto,Arial}body{padding:32px}
    h1{color:${BRAND.primary}}h2{border-bottom:2px solid ${BRAND.primary};padding-bottom:4px;margin-top:20px}
    .cust{margin:10px 0;padding:8px 12px;background:#f7f8fa;border-radius:8px}
    .muted{color:#888}ul{margin:6px 0}</style></head><body>
    <h1>🥦 Packing List — ${dayjs(dateStr).format('DD MMM YYYY')}</h1>${sections}
    <script>window.onload=()=>window.print()</script></body></html>`;
  const w = window.open('', '_blank', 'width=800,height=900');
  if (w) { w.document.write(html); w.document.close(); }
}

export default function Packing() {
  const { message } = App.useApp();
  const [date, setDate] = useState(dayjs());
  const dateStr = date.format('YYYY-MM-DD');
  const { data, isLoading, isFetching } = useGetPackingQuery(dateStr);
  const [closeDay, { isLoading: closing }] = useCloseDayMutation();

  const lists = data?.lists || [];
  const byBuilding = lists.reduce((acc, l) => {
    const key = l.building || 'Unknown';
    (acc[key] = acc[key] || []).push(l);
    return acc;
  }, {});

  const handleClose = async () => {
    try {
      const res = await closeDay({ date: date.toISOString() }).unwrap();
      message.success(res.message || 'Orders confirmed');
    } catch (err) {
      message.error(err?.data?.message || 'Could not close the day');
    }
  };

  return (
    <>
      <PageHeader
        title="Packing"
        subtitle="Customer-wise packing lists, grouped by society"
        extra={
          <Space wrap>
            <DatePicker value={date} onChange={(d) => setDate(d || dayjs())} allowClear={false} />
            <Popconfirm
              title="Confirm all pending orders for this day?"
              description="Simulates the 12 AM cutoff so packing can begin."
              onConfirm={handleClose}
            >
              <Button icon={<CheckCircleOutlined />} loading={closing}>
                Close day
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              disabled={!lists.length}
              onClick={() => printPacking(dateStr, byBuilding)}
            >
              Print
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Orders to pack" value={data?.count || 0} loading={isLoading} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Societies" value={Object.keys(byBuilding).length} loading={isLoading} />
          </Card>
        </Col>
      </Row>

      {isFetching && !lists.length ? (
        <Card loading />
      ) : lists.length === 0 ? (
        <Card>
          <Empty description={`No confirmed orders on ${date.format('DD MMM YYYY')}. Use "Close day" to confirm pending orders.`} />
        </Card>
      ) : (
        Object.entries(byBuilding).map(([building, group]) => (
          <Card
            key={building}
            title={<Space><Typography.Text strong>{building}</Typography.Text><Tag>{group.length}</Tag></Space>}
            style={{ marginBottom: 16 }}
          >
            <List
              dataSource={group}
              renderItem={(l) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{l.customerName || '—'}</span>
                        <Typography.Text type="secondary">
                          Flat {l.flat || '—'}{l.wing ? `, Wing ${l.wing}` : ''} · #{l.shortId}
                        </Typography.Text>
                        <Tag color={ORDER_STATUS_META[l.status]?.color}>{ORDER_STATUS_META[l.status]?.label}</Tag>
                      </Space>
                    }
                    description={
                      <Space wrap>
                        {l.items.map((i, idx) => (
                          <Tag key={idx}>
                            {i.emoji} {i.name} · {formatWeight(i.grams)}
                          </Tag>
                        ))}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        ))
      )}
    </>
  );
}
