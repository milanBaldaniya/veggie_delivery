import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Popconfirm,
  App,
  Drawer,
  Descriptions,
  Statistic,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserAddOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { formatCurrency } from '../utils/format';
import {
  useGetBuildingsQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
  useAssignWatchmanMutation,
  useDeleteBuildingMutation,
  useGetBuildingStatsQuery,
} from '../services/buildingApi';
import { useGetWatchmenQuery } from '../services/watchmanApi';

export default function Buildings() {
  const { message } = App.useApp();
  const { data: buildings = [], isLoading, isFetching } = useGetBuildingsQuery();
  const { data: watchmen = [] } = useGetWatchmenQuery();
  const [createBuilding, { isLoading: creating }] = useCreateBuildingMutation();
  const [updateBuilding, { isLoading: updating }] = useUpdateBuildingMutation();
  const [assignWatchman] = useAssignWatchmanMutation();
  const [deleteBuilding] = useDeleteBuildingMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statsId, setStatsId] = useState(null);
  const [form] = Form.useForm();

  const { data: stats, isFetching: statsLoading } = useGetBuildingStatsQuery(statsId, { skip: !statsId });
  const watchmanOptions = watchmen.map((w) => ({ value: w.id, label: `${w.name}${w.phone ? ` · ${w.phone}` : ''}` }));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, wings: [] });
    setModalOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({ ...r, watchman: r.watchman?.id || r.watchman || undefined });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateBuilding({ id: editing.id, ...values }).unwrap();
        message.success('Building updated');
      } else {
        await createBuilding(values).unwrap();
        message.success('Building created');
      }
      setModalOpen(false);
    } catch (err) {
      message.error(err?.data?.message || 'Something went wrong');
    }
  };

  const assign = async (buildingId, watchmanId) => {
    try {
      await assignWatchman({ id: buildingId, watchmanId: watchmanId || null }).unwrap();
      message.success('Watchman updated');
    } catch {
      message.error('Could not assign watchman');
    }
  };

  const remove = async (id) => {
    try {
      await deleteBuilding(id).unwrap();
      message.success('Building deleted');
    } catch (err) {
      message.error(err?.data?.message || 'Could not delete');
    }
  };

  const columns = [
    { title: 'Society', dataIndex: 'name', render: (v) => <strong>{v}</strong> },
    { title: 'Code', dataIndex: 'code', render: (v) => v || '—' },
    {
      title: 'Wings',
      dataIndex: 'wings',
      render: (w) => (w?.length ? w.map((x) => <Tag key={x}>{x}</Tag>) : '—'),
    },
    {
      title: 'Watchman',
      key: 'watchman',
      render: (_, r) => (
        <Select
          size="small"
          allowClear
          placeholder="Assign"
          style={{ minWidth: 160 }}
          value={r.watchman?.id || undefined}
          options={watchmanOptions}
          onChange={(v) => assign(r.id, v)}
          suffixIcon={<UserAddOutlined />}
        />
      ),
    },
    { title: 'Customers', dataIndex: 'userCount', align: 'center' },
    { title: 'Orders', dataIndex: 'orderCount', align: 'center' },
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
          <Button size="small" icon={<EyeOutlined />} onClick={() => setStatsId(r.id)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Delete this building?" onConfirm={() => remove(r.id)} okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Buildings / Societies"
        subtitle="Manage societies, assign watchmen, view building-wise stats"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Building
          </Button>
        }
      />

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={buildings}
          loading={isLoading || isFetching}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Building' : 'Add Building'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={creating || updating}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Save' : 'Create'}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Society name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. Green Valley Apartments" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="code" label="Code">
                <Input placeholder="e.g. GV" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="area" label="Area">
                <Input placeholder="e.g. Kondhwa" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="wings" label="Wings" tooltip="Type and press enter">
            <Select mode="tags" placeholder="A, B, C" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="watchman" label="Watchman">
            <Select allowClear placeholder="Assign a watchman" options={watchmanOptions} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="Building details" width={480} open={!!statsId} onClose={() => setStatsId(null)} loading={statsLoading}>
        {stats && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Society">{stats.building.name}</Descriptions.Item>
              <Descriptions.Item label="Watchman">{stats.building.watchman?.name || 'Unassigned'}</Descriptions.Item>
            </Descriptions>
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="Customers" value={stats.users.length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="Orders" value={stats.orderCount} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="Revenue" value={stats.revenue} prefix="₹" />
                </Card>
              </Col>
            </Row>
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 8 }}
              dataSource={stats.users}
              columns={[
                { title: 'Name', dataIndex: 'name', render: (v) => v || '—' },
                { title: 'Wing', dataIndex: 'wing', render: (v) => v || '—' },
                { title: 'Flat', dataIndex: 'flat', render: (v) => v || '—' },
                { title: 'Phone', dataIndex: 'phone', render: (v) => v || '—' },
              ]}
            />
          </>
        )}
      </Drawer>
    </>
  );
}
