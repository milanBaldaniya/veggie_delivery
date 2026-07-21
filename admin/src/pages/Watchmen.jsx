import React, { useState } from 'react';
import { Table, Card, Button, Space, Tag, Modal, Form, Input, Popconfirm, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { USER_STATUS_META } from '../utils/constants';
import { formatDate } from '../utils/format';
import {
  useGetWatchmenQuery,
  useCreateWatchmanMutation,
  useUpdateWatchmanMutation,
  useDeleteWatchmanMutation,
} from '../services/watchmanApi';

export default function Watchmen() {
  const { message } = App.useApp();
  const { data: watchmen = [], isLoading, isFetching } = useGetWatchmenQuery();
  const [createWatchman, { isLoading: creating }] = useCreateWatchmanMutation();
  const [updateWatchman, { isLoading: updating }] = useUpdateWatchmanMutation();
  const [deleteWatchman] = useDeleteWatchmanMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({ name: r.name, phone: r.phone, email: r.email });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        // Don't send an empty password on edit.
        const payload = { id: editing.id, ...values };
        if (!payload.password) delete payload.password;
        await updateWatchman(payload).unwrap();
        message.success('Watchman updated');
      } else {
        await createWatchman(values).unwrap();
        message.success('Watchman created');
      }
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || 'Something went wrong');
    }
  };

  const remove = async (id) => {
    try {
      await deleteWatchman(id).unwrap();
      message.success('Watchman removed');
    } catch (err) {
      message.error(err?.data?.message || 'Could not remove');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Phone', dataIndex: 'phone', render: (v) => v || '—' },
    { title: 'Email', dataIndex: 'email', render: (v) => v || '—' },
    {
      title: 'Societies',
      dataIndex: 'buildings',
      render: (b) => (b?.length ? b.map((x) => <Tag key={x.id}>{x.name}</Tag>) : <Tag>None</Tag>),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <Tag color={USER_STATUS_META[s]?.color}>{USER_STATUS_META[s]?.label}</Tag>,
    },
    { title: 'Added', dataIndex: 'createdAt', render: (v) => formatDate(v) },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Remove this watchman?" onConfirm={() => remove(r.id)} okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Watchmen"
        subtitle="Delivery staff who handle society-wise delivery"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Watchman
          </Button>
        }
      />

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={watchmen}
          loading={isLoading || isFetching}
          scroll={{ x: 820 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Watchman' : 'Add Watchman'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={creating || updating}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Save' : 'Create'}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. Ramu Kaka" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="e.g. 9876543210" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email (login)"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="watchman@veggie.local" />
          </Form.Item>
          <Form.Item
            name="password"
            label={editing ? 'New password (leave blank to keep)' : 'Password'}
            rules={editing ? [] : [{ required: true, message: 'Password is required' }, { min: 6, message: 'At least 6 characters' }]}
          >
            <Input.Password placeholder="••••••" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
