import React, { useMemo, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Switch,
  Modal,
  Form,
  InputNumber,
  Select,
  Popconfirm,
  App,
  Avatar,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import ImageUpload from '../components/ImageUpload';
import useDebounce from '../hooks/useDebounce';
import { PRODUCT_UNITS } from '../utils/constants';
import { formatCurrency } from '../utils/format';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useToggleProductMutation,
  useDeleteProductMutation,
} from '../services/productApi';

export default function Products() {
  const { message } = App.useApp();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const { data: products = [], isLoading, isFetching } = useGetProductsQuery({ search: debouncedSearch });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [toggleProduct] = useToggleProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ emoji: '🥬', category: 'Vegetable', unit: 'kg', inStock: true, sortOrder: 100 });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateProduct({ id: editing.id, ...values }).unwrap();
        message.success('Product updated');
      } else {
        await createProduct(values).unwrap();
        message.success('Product created');
      }
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || 'Something went wrong');
    }
  };

  const handleToggle = async (record, next) => {
    try {
      await toggleProduct({ id: record.id, inStock: next }).unwrap();
    } catch {
      message.error('Could not update availability');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      message.success('Product deleted');
    } catch (err) {
      message.error(err?.data?.message || 'Could not delete');
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'Product',
        dataIndex: 'name',
        render: (name, r) => (
          <Space>
            <Avatar shape="square" src={r.imageUrl || undefined} style={{ background: '#f0f7f0' }}>
              {!r.imageUrl && <span style={{ fontSize: 18 }}>{r.emoji}</span>}
            </Avatar>
            <span style={{ fontWeight: 600 }}>{name}</span>
          </Space>
        ),
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      { title: 'Category', dataIndex: 'category', render: (c) => <Tag>{c}</Tag> },
      {
        title: 'Price / kg',
        dataIndex: 'pricePerKg',
        align: 'right',
        render: (v) => formatCurrency(v),
        sorter: (a, b) => a.pricePerKg - b.pricePerKg,
      },
      { title: 'Unit', dataIndex: 'unit', align: 'center' },
      {
        title: 'Available',
        dataIndex: 'inStock',
        align: 'center',
        render: (inStock, r) => (
          <Switch checked={inStock} onChange={(next) => handleToggle(r, next)} />
        ),
        filters: [
          { text: 'Available', value: true },
          { text: 'Disabled', value: false },
        ],
        onFilter: (val, r) => r.inStock === val,
      },
      {
        title: 'Actions',
        key: 'actions',
        align: 'right',
        render: (_, r) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this product?"
              description="This can't be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(r.id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage the daily vegetable catalog and prices"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Product
          </Button>
        }
      />

      <Card styles={{ body: { padding: 16 } }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search products…"
          style={{ maxWidth: 320, marginBottom: 16 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={isLoading || isFetching}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 720 }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Product' : 'Add Product'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={creating || updating}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Save' : 'Create'}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }, { min: 2, message: 'Too short' }]}
          >
            <Input placeholder="e.g. Tomato" />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="emoji" label="Emoji" style={{ width: 90 }}>
              <Input maxLength={4} placeholder="🍅" />
            </Form.Item>
            <Form.Item name="category" label="Category" style={{ flex: 1, minWidth: 160 }}>
              <Input placeholder="Vegetable" />
            </Form.Item>
          </Space>

          <Form.Item
            name="imageUrl"
            label="Product image"
            tooltip="Uploaded to Cloudinary. Falls back to the emoji if no image."
          >
            <ImageUpload />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="start">
            <Form.Item
              name="pricePerKg"
              label="Price / kg (₹)"
              rules={[{ required: true, message: 'Price is required' }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="40" />
            </Form.Item>
            <Form.Item name="unit" label="Unit" style={{ width: 130 }}>
              <Select options={PRODUCT_UNITS.map((u) => ({ value: u, label: u }))} />
            </Form.Item>
          </Space>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Short description (optional)" />
          </Form.Item>

          <Space style={{ display: 'flex' }} align="center">
            <Form.Item name="inStock" label="Available" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort order" tooltip="Lower shows first">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
}
