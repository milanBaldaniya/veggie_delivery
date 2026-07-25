import React, { useState } from 'react';
import {
  Table,
  Card,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Button,
  Popconfirm,
  Drawer,
  Descriptions,
  Typography,
  App,
  Row,
  Col,
  Dropdown,
} from 'antd';
import { SearchOutlined, PrinterOutlined, EyeOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import useDebounce from '../hooks/useDebounce';
import { ORDER_STATUS_META, ORDER_STATUS_OPTIONS, ORDER_STATUS_TRANSITIONS } from '../utils/constants';
import { formatCurrency, formatWeight, formatDateTime, formatAddress } from '../utils/format';
import { printInvoice } from '../utils/printInvoice';
import {
  useGetOrdersQuery,
  useGetOrderBuildingsQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} from '../services/orderApi';

const { RangePicker } = DatePicker;

function StatusTag({ status }) {
  const m = ORDER_STATUS_META[status] || { label: status, color: 'default' };
  return <Tag color={m.color}>{m.label}</Tag>;
}

// A colored pill matching StatusTag that opens a menu of allowed next
// statuses — reads as "this order's status, and you can change it" instead
// of a plain gray Select sitting oddly next to the colored Status column.
// Falls back to a plain tag once nothing's left to transition to (DELIVERED,
// CANCELLED) since a dropdown with no options is just a dead click target.
function StatusPickerTag({ status, onChange, disabled }) {
  const meta = ORDER_STATUS_META[status] || { label: status, color: 'default' };
  const items = statusOptionsFor(status)
    .filter((o) => !o.disabled)
    .map((o) => ({ key: o.value, label: o.label }));

  if (items.length === 0) {
    return <Tag color={meta.color}>{meta.label}</Tag>;
  }

  return (
    <Dropdown
      trigger={['click']}
      disabled={disabled}
      menu={{ items, onClick: ({ key }) => onChange(key) }}
    >
      <Tag color={meta.color} style={{ cursor: 'pointer' }}>
        {meta.label} <DownOutlined style={{ fontSize: 9 }} />
      </Tag>
    </Dropdown>
  );
}

function statusOptionsFor(current) {
  const allowed = [current, ...(ORDER_STATUS_TRANSITIONS[current] || [])];
  return ORDER_STATUS_OPTIONS.filter((o) => allowed.includes(o.value)).map((o) => ({
    ...o,
    disabled: o.value === current,
  }));
}

export default function Orders() {
  const { message } = App.useApp();
  const [filters, setFilters] = useState({ status: undefined, building: undefined, from: undefined, to: undefined });
  const [searchText, setSearchText] = useState('');
  const search = useDebounce(searchText, 400);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState(null);

  const queryArgs = { page, limit, search: search || undefined, ...filters };
  const { data, isLoading, isFetching } = useGetOrdersQuery(queryArgs);
  const { data: buildings = [] } = useGetOrderBuildingsQuery();
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const orders = data?.orders || [];
  const total = data?.meta?.total || 0;

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id).unwrap();
      message.success('Order deleted');
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      message.error(err?.data?.message || 'Could not delete order');
    }
  };

  const setFilter = (patch) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  };

  const handleStatusChange = async (order, status) => {
    try {
      await updateStatus({ id: order.id, status }).unwrap();
      message.success(`Order marked ${ORDER_STATUS_META[status]?.label || status}`);
      if (selected?.id === order.id) setSelected({ ...selected, status });
    } catch (err) {
      message.error(err?.data?.message || 'Could not update status');
    }
  };

  const columns = [
    {
      title: 'Order',
      dataIndex: 'id',
      render: (id) => <Typography.Text code>#{id.slice(-6).toUpperCase()}</Typography.Text>,
    },
    { title: 'Customer', dataIndex: ['deliveryAddress', 'name'], render: (v) => v || '—' },
    { title: 'Building', dataIndex: ['deliveryAddress', 'building'], render: (v) => v || '—' },
    { title: 'Items', dataIndex: 'items', align: 'center', render: (i) => i.length },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      align: 'right',
      render: (v) => formatCurrency(v),
    },
    { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} /> },
    { title: 'Placed', dataIndex: 'createdAt', render: (v) => formatDateTime(v) },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space>
          <StatusPickerTag
            status={r.status}
            disabled={updatingStatus}
            onChange={(status) => handleStatusChange(r, status)}
          />
          <Button size="small" icon={<EyeOutlined />} onClick={() => setSelected(r)} />
          <Popconfirm
            title="Delete this order?"
            description="This can't be undone. The customer's weekly bill will be recalculated."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Orders" subtitle="View, filter and progress customer orders" />

      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={7}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by customer name / phone"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={6} md={5} lg={4}>
            <Select
              allowClear
              placeholder="Status"
              style={{ width: '100%' }}
              options={ORDER_STATUS_OPTIONS}
              value={filters.status}
              onChange={(v) => setFilter({ status: v })}
            />
          </Col>
          <Col xs={12} sm={6} md={5} lg={5}>
            <Select
              allowClear
              showSearch
              placeholder="Building"
              style={{ width: '100%' }}
              options={buildings.map((b) => ({ value: b, label: b }))}
              value={filters.building}
              onChange={(v) => setFilter({ building: v })}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(range) =>
                setFilter({
                  from: range?.[0]?.startOf('day').toISOString(),
                  to: range?.[1]?.endOf('day').toISOString(),
                })
              }
            />
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={isLoading || isFetching}
          scroll={{ x: 980 }}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showTotal: (t) => `${t} orders`,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
        />
      </Card>

      <Drawer
        title={selected ? `Order #${selected.id.slice(-6).toUpperCase()}` : ''}
        width={480}
        open={!!selected}
        onClose={() => setSelected(null)}
        extra={
          selected && (
            <Space>
              <Button icon={<PrinterOutlined />} onClick={() => printInvoice(selected)}>
                Print Invoice
              </Button>
              <Popconfirm
                title="Delete this order?"
                description="This can't be undone. The customer's weekly bill will be recalculated."
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(selected.id)}
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )
        }
      >
        {selected && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Status">
                <StatusTag status={selected.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Placed">{formatDateTime(selected.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Customer">{selected.deliveryAddress?.name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selected.deliveryAddress?.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Address">{formatAddress(selected.deliveryAddress)}</Descriptions.Item>
            </Descriptions>

            <Typography.Text strong>Change status</Typography.Text>
            <Select
              style={{ width: '100%', margin: '8px 0 16px' }}
              value={selected.status}
              loading={updatingStatus}
              options={statusOptionsFor(selected.status)}
              onChange={(v) => handleStatusChange(selected, v)}
            />

            <Table
              rowKey="productId"
              size="small"
              pagination={false}
              dataSource={selected.items}
              columns={[
                {
                  title: 'Item',
                  dataIndex: 'name',
                  render: (n, r) => `${r.emoji || ''} ${n}`,
                },
                { title: 'Weight', dataIndex: 'grams', align: 'right', render: (g) => formatWeight(g) },
                {
                  title: 'Amount',
                  dataIndex: 'lineTotal',
                  align: 'right',
                  render: (v) => formatCurrency(v),
                },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <strong>{formatCurrency(selected.totalAmount)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </>
        )}
      </Drawer>
    </>
  );
}
