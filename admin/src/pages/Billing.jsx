import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  App,
  Row,
  Col,
  Statistic,
  Typography,
  Descriptions,
  Popconfirm,
} from 'antd';
import { CheckCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { PAYMENT_STATUS_META, BILL_PERIOD_OPTIONS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/format';
import {
  useGetBillsQuery,
  useGetBillQuery,
  useGenerateBillsMutation,
  useMarkBillPaidMutation,
} from '../services/billingApi';

const formatQty = (grams) => `${((Number(grams) || 0) / 1000).toFixed(2)} kg`;

function weekLabel(bill) {
  return bill.weekNumber ? `Week ${bill.weekNumber}` : bill.periodType;
}

export default function Billing() {
  const { message } = App.useApp();
  const [filters, setFilters] = useState({ periodType: undefined, status: undefined, search: undefined });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isFetching } = useGetBillsQuery({ page, limit, ...filters });
  const [generateBills, { isLoading: generating }] = useGenerateBillsMutation();
  const [markPaid, { isLoading: marking }] = useMarkBillPaidMutation();

  const [genOpen, setGenOpen] = useState(false);
  const [payFor, setPayFor] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [genForm] = Form.useForm();
  const [payForm] = Form.useForm();

  const { data: detail, isFetching: detailLoading } = useGetBillQuery(viewId, { skip: !viewId });

  const bills = data?.bills || [];
  const totals = data?.totals || {};

  const submitGenerate = async () => {
    const values = await genForm.validateFields();
    try {
      const res = await generateBills({
        periodType: values.periodType,
        date: values.date?.toISOString(),
      }).unwrap();
      message.success(res.message || 'Bills synced');
      setGenOpen(false);
    } catch (err) {
      message.error(err?.data?.message || 'Could not generate bills');
    }
  };

  const submitMarkPaid = async () => {
    const values = await payForm.validateFields();
    try {
      await markPaid({
        id: payFor.id,
        collectedAt: values.collectedAt?.toISOString(),
        notes: values.notes || undefined,
      }).unwrap();
      message.success('Bill marked as paid');
      setPayFor(null);
      payForm.resetFields();
    } catch (err) {
      message.error(err?.data?.message || 'Could not mark as paid');
    }
  };

  const columns = [
    { title: 'Customer', dataIndex: 'customerName', render: (v) => v || '—' },
    { title: 'Building', dataIndex: 'building', render: (v) => v || '—' },
    { title: 'Week', key: 'week', render: (_, r) => <Tag color="blue">{weekLabel(r)}</Tag> },
    {
      title: 'Period',
      dataIndex: 'periodStart',
      render: (v, r) => `${formatDate(v)} – ${formatDate(dayjs(r.periodEnd).subtract(1, 'day'))}`,
    },
    { title: 'Orders', dataIndex: 'orderCount', align: 'center' },
    { title: 'Qty', dataIndex: 'totalQuantityGrams', align: 'right', render: (v) => formatQty(v) },
    { title: 'Total', dataIndex: 'totalAmount', align: 'right', render: (v) => formatCurrency(v) },
    { title: 'Balance', dataIndex: 'balance', align: 'right', render: (v) => <strong>{formatCurrency(v)}</strong> },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <Tag color={PAYMENT_STATUS_META[s]?.color}>{PAYMENT_STATUS_META[s]?.label}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewId(r.id)}>
            View
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={r.status === 'PAID'}
            onClick={() => setPayFor(r)}
          >
            Mark Paid
          </Button>
        </Space>
      ),
    },
  ];

  const orderColumns = [
    { title: 'Date', dataIndex: 'placedAt', render: (v) => dayjs(v).format('DD MMM, hh:mm A') },
    { title: 'Qty', dataIndex: 'quantityGrams', align: 'right', render: (v) => formatQty(v) },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v) => formatCurrency(v) },
  ];

  return (
    <>
      <PageHeader
        title="Weekly Billing"
        subtitle="Offline weekly bill collection"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => setGenOpen(true)}>
            Sync Bills
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Pending amount" value={totals.pendingAmount || 0} prefix="₹" valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Collected amount" value={totals.collectedAmount || 0} prefix="₹" valueStyle={{ color: '#2E7D32' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Pending bills" value={totals.pendingCount || 0} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Paid bills" value={totals.paidCount || 0} valueStyle={{ color: '#2E7D32' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Search customer / building / week"
            style={{ width: 260 }}
            onSearch={(v) => {
              setPage(1);
              setFilters((f) => ({ ...f, search: v || undefined }));
            }}
          />
          <Select
            allowClear
            placeholder="Period"
            style={{ width: 150 }}
            options={BILL_PERIOD_OPTIONS}
            value={filters.periodType}
            onChange={(v) => {
              setPage(1);
              setFilters((f) => ({ ...f, periodType: v }));
            }}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 150 }}
            options={Object.entries(PAYMENT_STATUS_META).map(([value, m]) => ({ value, label: m.label }))}
            value={filters.status}
            onChange={(v) => {
              setPage(1);
              setFilters((f) => ({ ...f, status: v }));
            }}
          />
        </Space>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={bills}
          loading={isLoading || isFetching}
          scroll={{ x: 1120 }}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta?.total || 0,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
        />
      </Card>

      <Modal
        title="Sync Bills"
        open={genOpen}
        onOk={submitGenerate}
        confirmLoading={generating}
        onCancel={() => setGenOpen(false)}
        okText="Sync"
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary">
          Weekly bills accrue automatically as orders are placed — this resyncs a period as a safety net (and
          generates monthly bills). Recorded payments are kept.
        </Typography.Paragraph>
        <Form form={genForm} layout="vertical" initialValues={{ periodType: 'WEEKLY', date: dayjs() }}>
          <Form.Item name="periodType" label="Period" rules={[{ required: true }]}>
            <Select options={BILL_PERIOD_OPTIONS} />
          </Form.Item>
          <Form.Item name="date" label="Reference date" tooltip="Any date within the target period">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={payFor ? `Mark as paid — ${payFor.customerName || ''}` : ''}
        open={!!payFor}
        onOk={submitMarkPaid}
        confirmLoading={marking}
        onCancel={() => {
          setPayFor(null);
          payForm.resetFields();
        }}
        okText="Mark as paid"
        destroyOnHidden
      >
        {payFor && (
          <Form form={payForm} layout="vertical" initialValues={{ collectedAt: dayjs() }} style={{ marginTop: 16 }}>
            <p>
              Outstanding balance: <strong>{formatCurrency(payFor.balance)}</strong> will be recorded as collected.
            </p>
            <Form.Item name="collectedAt" label="Collection date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="notes" label="Notes (optional)">
              <Input.TextArea rows={2} maxLength={500} placeholder="e.g. collected by delivery staff" />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Drawer
        title={detail ? `${weekLabel(detail)} — ${detail.customerName || ''}` : 'Bill details'}
        open={!!viewId}
        onClose={() => setViewId(null)}
        width={520}
        loading={detailLoading}
      >
        {detail && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Building">{detail.building || '—'}</Descriptions.Item>
              <Descriptions.Item label="Period">
                {formatDate(detail.periodStart)} – {formatDate(dayjs(detail.periodEnd).subtract(1, 'day'))}
              </Descriptions.Item>
              <Descriptions.Item label="Total orders">{detail.orderCount}</Descriptions.Item>
              <Descriptions.Item label="Total quantity">{formatQty(detail.totalQuantityGrams)}</Descriptions.Item>
              <Descriptions.Item label="Grand total">{formatCurrency(detail.totalAmount)}</Descriptions.Item>
              <Descriptions.Item label="Paid">{formatCurrency(detail.paidAmount)}</Descriptions.Item>
              <Descriptions.Item label="Balance">{formatCurrency(detail.balance)}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={PAYMENT_STATUS_META[detail.status]?.color}>
                  {PAYMENT_STATUS_META[detail.status]?.label}
                </Tag>
              </Descriptions.Item>
              {detail.paymentCollectedAt && (
                <Descriptions.Item label="Collected on">{formatDate(detail.paymentCollectedAt)}</Descriptions.Item>
              )}
              {detail.notes && <Descriptions.Item label="Notes">{detail.notes}</Descriptions.Item>}
            </Descriptions>

            <div>
              <Typography.Text strong>Orders ({detail.orders?.length || 0})</Typography.Text>
              <Table
                rowKey={(r) => String(r.order)}
                columns={orderColumns}
                dataSource={detail.orders || []}
                size="small"
                pagination={false}
                style={{ marginTop: 8 }}
              />
            </div>

            {detail.status !== 'PAID' && (
              <Popconfirm
                title="Mark this bill as paid?"
                description={`${formatCurrency(detail.balance)} will be recorded as collected.`}
                okText="Mark paid"
                onConfirm={async () => {
                  try {
                    await markPaid({ id: detail.id }).unwrap();
                    message.success('Bill marked as paid');
                  } catch (err) {
                    message.error(err?.data?.message || 'Could not mark as paid');
                  }
                }}
              >
                <Button type="primary" icon={<CheckCircleOutlined />} block>
                  Mark as Paid
                </Button>
              </Popconfirm>
            )}
          </Space>
        )}
      </Drawer>
    </>
  );
}
