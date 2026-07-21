import React, { useState } from 'react';
import { Table, Card, Button, Space, Tag, Modal, Form, Input, Switch, Popconfirm, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { formatCurrency } from '../utils/format';
import {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} from '../services/vendorApi';

export default function Vendors() {
  const { message } = App.useApp();
  const { data: vendors = [], isLoading, isFetching } = useGetVendorsQuery();
  const [createVendor, { isLoading: creating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: updating }] = useUpdateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue(r);
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateVendor({ id: editing.id, ...values }).unwrap();
        message.success('Vendor updated');
      } else {
        await createVendor(values).unwrap();
        message.success('Vendor created');
      }
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || 'Something went wrong');
    }
  };

  const remove = async (id) => {
    try {
      await deleteVendor(id).unwrap();
      message.success('Vendor deleted');
    } catch (err) {
      message.error(err?.data?.message || 'Could not delete');
    }
  };

  const columns = [
    { title: 'Vendor', dataIndex: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Phone', dataIndex: 'phone', render: (v) => v || '—' },
    { title: 'Address', dataIndex: 'address', render: (v) => v || '—' },
    {
      title: 'Total Purchased',
      dataIndex: 'totalPurchased',
      align: 'right',
      render: (v) => formatCurrency(v),
      sorter: (a, b) => a.totalPurchased - b.totalPurchased,
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      align: 'center',
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Delete this vendor?" onConfirm={() => remove(r.id)} okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Vendors"
        subtitle="Market vendors vegetables are purchased from"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Vendor
          </Button>
        }
      />
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={vendors}
          loading={isLoading || isFetching}
          scroll={{ x: 720 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Vendor' : 'Add Vendor'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={creating || updating}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Save' : 'Create'}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Vendor name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. APMC Market" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="e.g. 9876543210" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input placeholder="Market address" />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
