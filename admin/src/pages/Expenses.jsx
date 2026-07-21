import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  Input,
  Popconfirm,
  App,
  Row,
  Col,
  Statistic,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { EXPENSE_CATEGORY_META, EXPENSE_CATEGORY_OPTIONS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/format';
import {
  useGetExpensesQuery,
  useGetExpenseSummaryQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '../services/expenseApi';
import { useGetVendorsQuery } from '../services/vendorApi';

const { RangePicker } = DatePicker;

export default function Expenses() {
  const { message } = App.useApp();
  const [filters, setFilters] = useState({ category: undefined, from: undefined, to: undefined });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isFetching } = useGetExpensesQuery({ page, limit, ...filters });
  const { data: summary } = useGetExpenseSummaryQuery({ from: filters.from, to: filters.to });
  const { data: vendors = [] } = useGetVendorsQuery();
  const [createExpense, { isLoading: creating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: updating }] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const expenses = data?.expenses || [];
  const vendorOptions = vendors.map((v) => ({ value: v.id, label: v.name }));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ date: dayjs(), category: 'VEGETABLE_PURCHASE' });
    setModalOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({ ...r, date: dayjs(r.date), vendor: r.vendor?.id || r.vendor || undefined });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, date: values.date?.toISOString() };
    try {
      if (editing) {
        await updateExpense({ id: editing.id, ...payload }).unwrap();
        message.success('Expense updated');
      } else {
        await createExpense(payload).unwrap();
        message.success('Expense recorded');
      }
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || 'Something went wrong');
    }
  };

  const remove = async (id) => {
    try {
      await deleteExpense(id).unwrap();
      message.success('Expense deleted');
    } catch {
      message.error('Could not delete');
    }
  };

  const columns = [
    { title: 'Date', dataIndex: 'date', render: (v) => formatDate(v) },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (c) => {
        const m = EXPENSE_CATEGORY_META[c] || { label: c, color: 'default' };
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    { title: 'Vendor', dataIndex: ['vendor', 'name'], render: (v) => v || '—' },
    { title: 'Note', dataIndex: 'note', render: (v) => v || '—' },
    { title: 'Amount', dataIndex: 'amount', align: 'right', render: (v) => formatCurrency(v) },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Delete this expense?" onConfirm={() => remove(r.id)} okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="Track and categorise business expenses"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Expense
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Total (filtered)" value={summary?.total || 0} prefix="₹" />
          </Card>
        </Col>
        {(summary?.byCategory || []).slice(0, 3).map((c) => (
          <Col xs={12} md={6} key={c.category}>
            <Card>
              <Statistic title={EXPENSE_CATEGORY_META[c.category]?.label || c.category} value={c.total} prefix="₹" />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="Category"
            style={{ width: 200 }}
            options={EXPENSE_CATEGORY_OPTIONS}
            value={filters.category}
            onChange={(v) => {
              setPage(1);
              setFilters((f) => ({ ...f, category: v }));
            }}
          />
          <RangePicker
            onChange={(range) => {
              setPage(1);
              setFilters((f) => ({
                ...f,
                from: range?.[0]?.startOf('day').toISOString(),
                to: range?.[1]?.endOf('day').toISOString(),
              }));
            }}
          />
        </Space>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={expenses}
          loading={isLoading || isFetching}
          scroll={{ x: 720 }}
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
        title={editing ? 'Edit Expense' : 'Add Expense'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={creating || updating}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Save' : 'Record'}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={EXPENSE_CATEGORY_OPTIONS} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true, message: 'Amount is required' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="vendor" label="Vendor (optional)">
            <Select allowClear placeholder="Link a vendor" options={vendorOptions} />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
