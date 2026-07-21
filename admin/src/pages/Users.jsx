import React, { useState } from 'react';
import {
  Table,
  Card,
  Input,
  Select,
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
} from 'antd';
import { SearchOutlined, EyeOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import useDebounce from '../hooks/useDebounce';
import { USER_STATUS_META, ORDER_STATUS_META, PAYMENT_STATUS_META } from '../utils/constants';
import { formatCurrency, formatAddress, formatDate, formatDateTime } from '../utils/format';
import { useGetUsersQuery, useGetUserQuery, useSetUserStatusMutation } from '../services/userApi';

export default function Users() {
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState('');
  const search = useDebounce(searchText, 400);
  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [detailId, setDetailId] = useState(null);

  const { data, isLoading, isFetching } = useGetUsersQuery({ page, limit, search: search || undefined, status });
  const [setUserStatus] = useSetUserStatusMutation();
  const { data: detail, isFetching: detailLoading } = useGetUserQuery(detailId, { skip: !detailId });

  const users = data?.users || [];

  const toggleBlock = async (u) => {
    const next = u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await setUserStatus({ id: u.id, status: next }).unwrap();
      message.success(next === 'ACTIVE' ? 'User unblocked' : 'User blocked');
    } catch {
      message.error('Could not update user');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', render: (v) => v || '—' },
    { title: 'Phone', dataIndex: 'phone', render: (v) => v || '—' },
    { title: 'Building', dataIndex: ['address', 'building'], render: (v) => v || '—' },
    { title: 'Flat', dataIndex: ['address', 'flat'], render: (v) => v || '—' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => {
        const m = USER_STATUS_META[s] || { label: s, color: 'default' };
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, u) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailId(u.id)}>
            View
          </Button>
          <Popconfirm
            title={u.status === 'ACTIVE' ? 'Block this user?' : 'Unblock this user?'}
            onConfirm={() => toggleBlock(u)}
          >
            <Button
              size="small"
              danger={u.status === 'ACTIVE'}
              icon={u.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
            >
              {u.status === 'ACTIVE' ? 'Block' : 'Unblock'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Users" subtitle="Customer directory, order & billing history" />

      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={14} md={10}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by name or phone"
              value={searchText}
              onChange={(e) => {
                setPage(1);
                setSearchText(e.target.value);
              }}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              allowClear
              placeholder="Status"
              style={{ width: '100%' }}
              value={status}
              onChange={(v) => {
                setPage(1);
                setStatus(v);
              }}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'DISABLED', label: 'Blocked' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={isLoading || isFetching}
          scroll={{ x: 720 }}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta?.total || 0,
            showSizeChanger: true,
            showTotal: (t) => `${t} users`,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
        />
      </Card>

      <Drawer
        title="Customer details"
        width={520}
        open={!!detailId}
        onClose={() => setDetailId(null)}
        loading={detailLoading}
      >
        {detail && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Name">{detail.user.name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{detail.user.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Address">{formatAddress(detail.user.address)}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={USER_STATUS_META[detail.user.status]?.color}>
                  {USER_STATUS_META[detail.user.status]?.label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5}>Order history ({detail.orders.length})</Typography.Title>
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={detail.orders}
              columns={[
                { title: 'Order', dataIndex: 'id', render: (id) => `#${id.slice(-6).toUpperCase()}` },
                { title: 'Total', dataIndex: 'totalAmount', align: 'right', render: (v) => formatCurrency(v) },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  render: (s) => <Tag color={ORDER_STATUS_META[s]?.color}>{ORDER_STATUS_META[s]?.label}</Tag>,
                },
                { title: 'Date', dataIndex: 'createdAt', render: (v) => formatDate(v) },
              ]}
            />

            <Typography.Title level={5} style={{ marginTop: 16 }}>
              Billing history ({detail.bills.length})
            </Typography.Title>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              locale={{ emptyText: 'No bills yet' }}
              dataSource={detail.bills}
              columns={[
                { title: 'Period', dataIndex: 'periodType' },
                { title: 'Total', dataIndex: 'totalAmount', align: 'right', render: (v) => formatCurrency(v) },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  render: (s) => <Tag color={PAYMENT_STATUS_META[s]?.color}>{PAYMENT_STATUS_META[s]?.label}</Tag>,
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </>
  );
}
