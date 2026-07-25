import React, { useState } from 'react';
import { Card, DatePicker, Button, Space, Empty, Tag, Typography, App, Popconfirm, Row, Col } from 'antd';
import { PrinterOutlined, CheckCircleOutlined, ShoppingCartOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
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
          <StatCard
            title="Orders to pack"
            value={data?.count || 0}
            icon={<ShoppingCartOutlined />}
            color="#2E7D32"
            loading={isLoading}
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Societies"
            value={Object.keys(byBuilding).length}
            icon={<HomeOutlined />}
            color="#1677ff"
            loading={isLoading}
          />
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
          <Card key={building} styles={{ body: { padding: 0 } }} style={{ marginBottom: 16 }}>
            <div style={styles.buildingHeader}>
              <Space size={10}>
                <HomeOutlined style={{ color: BRAND.primary, fontSize: 16 }} />
                <Typography.Text strong style={{ fontSize: 15 }}>
                  {building}
                </Typography.Text>
              </Space>
              <Tag>{group.length} order{group.length > 1 ? 's' : ''}</Tag>
            </div>

            <div style={styles.orderList}>
              {group.map((l, idx) => (
                <div
                  key={l.orderId}
                  style={{
                    ...styles.orderRow,
                    borderBottom: idx === group.length - 1 ? 'none' : '1px solid #f0f0f0',
                  }}
                >
                  <div style={styles.orderTop}>
                    <div style={styles.orderTopLeft}>
                      <Typography.Text strong>{l.customerName || '—'}</Typography.Text>
                      <Typography.Text type="secondary" style={styles.orderMeta}>
                        Flat {l.flat || '—'}
                        {l.wing ? `, Wing ${l.wing}` : ''} · #{l.shortId}
                      </Typography.Text>
                    </div>
                    <Tag color={ORDER_STATUS_META[l.status]?.color} style={{ marginInlineEnd: 0, flexShrink: 0 }}>
                      {ORDER_STATUS_META[l.status]?.label}
                    </Tag>
                  </div>
                  <Space size={[8, 8]} wrap style={styles.itemTags}>
                    {l.items.map((i, itemIdx) => (
                      <Tag key={itemIdx} bordered={false} style={styles.itemTag}>
                        {i.emoji} {i.name} · {formatWeight(i.grams)}
                      </Tag>
                    ))}
                  </Space>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </>
  );
}

const styles = {
  buildingHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid #f0f0f0',
  },
  orderList: { padding: '0 20px' },
  orderRow: { padding: '14px 0' },
  orderTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderTopLeft: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  orderMeta: { fontSize: 13 },
  itemTags: { marginTop: 10 },
  itemTag: { background: '#f5f5f5', color: 'rgba(0, 0, 0, 0.75)' },
};
