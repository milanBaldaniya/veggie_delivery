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
} from 'antd';
import { PlusOutlined, DollarOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { PAYMENT_STATUS_META, BRAND } from '../utils/constants';
import { formatCurrency } from '../utils/format';
import {
  useGetSalariesQuery,
  useGetEligibleStaffQuery,
  useCreateSalaryMutation,
  usePaySalaryMutation,
  useDeleteSalaryMutation,
} from '../services/salaryApi';

function printSlip(s) {
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Salary Slip</title>
    <style>*{font-family:-apple-system,Segoe UI,Roboto,Arial}body{padding:32px}
    h1{color:${BRAND.primary}}table{width:100%;border-collapse:collapse;margin-top:16px}
    td{padding:8px;border-bottom:1px solid #eee}.r{text-align:right}</style></head><body>
    <h1>🥦 Salary Slip</h1>
    <div>Staff: <strong>${s.staff?.name || '—'}</strong> · ${s.month}</div>
    <table>
      <tr><td>Gross</td><td class="r">${formatCurrency(s.amount)}</td></tr>
      <tr><td>Advance</td><td class="r">- ${formatCurrency(s.advance)}</td></tr>
      <tr><td><strong>Net payable</strong></td><td class="r"><strong>${formatCurrency(s.netPayable)}</strong></td></tr>
      <tr><td>Paid</td><td class="r">${formatCurrency(s.paidAmount)}</td></tr>
      <tr><td>Balance</td><td class="r">${formatCurrency(s.balance)}</td></tr>
    </table>
    <script>window.onload=()=>window.print()</script></body></html>`;
  const w = window.open('', '_blank', 'width=700,height=800');
  if (w) { w.document.write(html); w.document.close(); }
}

export default function Salaries() {
  const { message } = App.useApp();
  const { data: salaries = [], isLoading, isFetching } = useGetSalariesQuery();
  const { data: staff = [] } = useGetEligibleStaffQuery();
  const [createSalary, { isLoading: creating }] = useCreateSalaryMutation();
  const [paySalary, { isLoading: paying }] = usePaySalaryMutation();
  const [deleteSalary] = useDeleteSalaryMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [payFor, setPayFor] = useState(null);
  const [form] = Form.useForm();
  const [payForm] = Form.useForm();

  const staffOptions = staff.map((s) => ({ value: s.id, label: `${s.name || 'Unnamed'} (${s.role})` }));

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ month: dayjs(), advance: 0 });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      await createSalary({ ...values, month: values.month.format('YYYY-MM') }).unwrap();
      message.success('Salary record created');
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || 'Something went wrong');
    }
  };

  const submitPay = async () => {
    const values = await payForm.validateFields();
    try {
      await paySalary({ id: payFor.id, amount: values.amount }).unwrap();
      message.success('Payment recorded');
      setPayFor(null);
      payForm.resetFields();
    } catch (err) {
      message.error(err?.data?.message || 'Could not record payment');
    }
  };

  const columns = [
    { title: 'Staff', dataIndex: ['staff', 'name'], render: (v, r) => v || r.staff?.role || '—' },
    { title: 'Month', dataIndex: 'month' },
    { title: 'Gross', dataIndex: 'amount', align: 'right', render: (v) => formatCurrency(v) },
    { title: 'Advance', dataIndex: 'advance', align: 'right', render: (v) => formatCurrency(v) },
    { title: 'Net', dataIndex: 'netPayable', align: 'right', render: (v) => formatCurrency(v) },
    { title: 'Paid', dataIndex: 'paidAmount', align: 'right', render: (v) => formatCurrency(v) },
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
          <Button
            size="small"
            type="primary"
            icon={<DollarOutlined />}
            disabled={r.status === 'PAID'}
            onClick={() => setPayFor(r)}
          >
            Pay
          </Button>
          <Button size="small" icon={<PrinterOutlined />} onClick={() => printSlip(r)} />
          <Popconfirm title="Delete this record?" onConfirm={() => deleteSalary(r.id)} okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Salary"
        subtitle="Monthly staff salaries, advances and payments"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Salary
          </Button>
        }
      />
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={salaries}
          loading={isLoading || isFetching}
          scroll={{ x: 980 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Add Salary Record"
        open={modalOpen}
        onOk={submit}
        confirmLoading={creating}
        onCancel={() => setModalOpen(false)}
        okText="Create"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="staff" label="Staff" rules={[{ required: true, message: 'Select staff' }]}>
            <Select showSearch optionFilterProp="label" placeholder="Select staff" options={staffOptions} />
          </Form.Item>
          <Form.Item name="month" label="Month" rules={[{ required: true }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="amount" label="Gross salary (₹)" rules={[{ required: true, message: 'Amount is required' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="advance" label="Advance (₹)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={payFor ? `Pay salary — ${payFor.staff?.name || ''}` : ''}
        open={!!payFor}
        onOk={submitPay}
        confirmLoading={paying}
        onCancel={() => setPayFor(null)}
        okText="Record payment"
        destroyOnHidden
      >
        {payFor && (
          <Form form={payForm} layout="vertical" style={{ marginTop: 16 }}>
            <p>
              Balance due: <strong>{formatCurrency(payFor.balance)}</strong>
            </p>
            <Form.Item
              name="amount"
              label="Payment amount (₹)"
              rules={[{ required: true, message: 'Enter an amount' }]}
              initialValue={payFor.balance}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}
