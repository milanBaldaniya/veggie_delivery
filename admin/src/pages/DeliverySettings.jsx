import React, { useEffect } from 'react';
import { Card, Form, TimePicker, Button, Row, Col, Typography, App } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { useGetDeliverySettingsQuery, useUpdateDeliverySettingsMutation } from '../services/deliverySettingsApi';

// TimePicker binds to dayjs values but the API stores/accepts plain
// { hour, minute } objects — convert both ways at the Form.Item boundary.
const timeToPickerProps = (value) => ({
  value: value ? dayjs().hour(value.hour).minute(value.minute) : undefined,
});
const pickerToTime = (value) => (value ? { hour: value.hour(), minute: value.minute() } : undefined);

export default function DeliverySettings() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { data, isLoading } = useGetDeliverySettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateDeliverySettingsMutation();

  // Populate the form once the singleton loads (RTK Query re-runs this
  // whenever the cache is invalidated too, e.g. after a save elsewhere).
  useEffect(() => {
    if (data) form.setFieldsValue(data);
  }, [data, form]);

  const submit = async () => {
    const values = await form.validateFields();
    try {
      await updateSettings(values).unwrap();
      message.success('Delivery settings saved');
    } catch (err) {
      message.error(err?.data?.message || 'Could not save settings');
    }
  };

  return (
    <>
      <PageHeader
        title="Delivery Settings"
        subtitle="Delivery window and order cutoff time shown to customers in the app"
      />

      <Card loading={isLoading} style={{ maxWidth: 640 }}>
        <Form form={form} layout="vertical">
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            Delivery window
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="deliveryStart"
                label="Delivery window start"
                getValueProps={timeToPickerProps}
                normalize={pickerToTime}
                rules={[{ required: true, message: 'Start time is required' }]}
              >
                <TimePicker format="hh:mm A" use12Hours minuteStep={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="deliveryEnd"
                label="Delivery window end"
                getValueProps={timeToPickerProps}
                normalize={pickerToTime}
                rules={[{ required: true, message: 'End time is required' }]}
              >
                <TimePicker format="hh:mm A" use12Hours minuteStep={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5}>Order cutoff</Typography.Title>
          <Form.Item
            name="cutoff"
            label="Order cutoff time"
            tooltip="Customers can only place an order before this time each day. Pick 12:00 AM to accept orders all day (no early cutoff)."
            getValueProps={timeToPickerProps}
            normalize={pickerToTime}
            rules={[{ required: true, message: 'Cutoff time is required' }]}
          >
            <TimePicker format="hh:mm A" use12Hours minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>

          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={submit}>
            Save changes
          </Button>
        </Form>
      </Card>
    </>
  );
}
