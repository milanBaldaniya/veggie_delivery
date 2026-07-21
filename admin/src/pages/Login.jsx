import React from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../services/authApi';
import { setCredentials, selectIsAuthenticated } from '../features/auth/authSlice';
import { BRAND } from '../utils/constants';

export default function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const isAuthed = useSelector(selectIsAuthenticated);

  if (isAuthed) return <Navigate to="/" replace />;

  const onFinish = async (values) => {
    try {
      const data = await login(values).unwrap();
      dispatch(setCredentials({ token: data.token, user: data.user }));
      message.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (err) {
      message.error(err?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1B5E20 100%)`,
        padding: 16,
      }}
    >
      <Card style={{ width: 400, maxWidth: '100%' }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44 }}>🥦</div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            {BRAND.name}
          </Typography.Title>
          <Typography.Text type="secondary">Admin Panel</Typography.Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="admin@veggie.local" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
