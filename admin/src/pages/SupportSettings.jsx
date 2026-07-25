import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Row, Col, Divider, Typography, App, Space, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { useGetSupportSettingsQuery, useUpdateSupportSettingsMutation } from '../services/supportSettingsApi';

export default function SupportSettings() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { data, isLoading } = useGetSupportSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSupportSettingsMutation();

  // Populate the form once the singleton loads (RTK Query re-runs this
  // whenever the cache is invalidated too, e.g. after a save elsewhere).
  useEffect(() => {
    if (data) form.setFieldsValue(data);
  }, [data, form]);

  const submit = async () => {
    const values = await form.validateFields();
    try {
      await updateSettings(values).unwrap();
      message.success('Support settings saved');
    } catch (err) {
      message.error(err?.data?.message || 'Could not save settings');
    }
  };

  return (
    <>
      <PageHeader
        title="Support Settings"
        subtitle="Contact details and FAQs shown on the customer app's Help & Support screen"
      />

      <Card loading={isLoading} style={{ maxWidth: 760 }}>
        <Form form={form} layout="vertical" initialValues={{ faqs: [] }}>
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            Contact details
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="callNumber"
                label="Call number"
                tooltip="Shown as a tap-to-call button, e.g. +919999999999"
                rules={[{ required: true, message: 'Call number is required' }]}
              >
                <Input placeholder="+919999999999" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="whatsappNumber"
                label="WhatsApp number"
                tooltip="Used to build the wa.me chat link, e.g. +919999999999"
                rules={[{ required: true, message: 'WhatsApp number is required' }]}
              >
                <Input placeholder="+919999999999" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="whatsappLink"
            label="WhatsApp link (optional override)"
            tooltip="Leave blank to auto-generate from the WhatsApp number above. Fill this in only if you need a custom link, e.g. one with a pre-filled message."
          >
            <Input placeholder="https://wa.me/919999999999?text=Hi..." />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Support email"
                rules={[{ type: 'email', message: 'Enter a valid email' }]}
              >
                <Input placeholder="support@veggiedelivery.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="hours" label="Support hours">
                <Input placeholder="Mon–Sat, 7 AM – 9 PM" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Typography.Title level={5}>Frequently asked questions</Typography.Title>
          <Form.List name="faqs">
            {(fields, { add, remove }) => (
              <>
                {fields.length === 0 && (
                  <Empty
                    description="No FAQs yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ marginBottom: 16 }}
                  />
                )}
                {fields.map((field) => (
                  <Card key={field.key} size="small" style={{ marginBottom: 12 }}>
                    <Space align="start" style={{ width: '100%' }}>
                      <div style={{ width: 560, maxWidth: '100%' }}>
                        <Form.Item
                          name={[field.name, 'question']}
                          label="Question"
                          rules={[{ required: true, message: 'Question is required' }]}
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="e.g. What time do I need to order by?" />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'answer']}
                          label="Answer"
                          rules={[{ required: true, message: 'Answer is required' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input.TextArea rows={2} placeholder="Answer shown when the customer expands this question" />
                        </Form.Item>
                      </div>
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                        style={{ marginTop: 28 }}
                      />
                    </Space>
                  </Card>
                ))}
                <Button icon={<PlusOutlined />} onClick={() => add({ question: '', answer: '' })} block>
                  Add question
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={submit}>
            Save changes
          </Button>
        </Form>
      </Card>
    </>
  );
}
