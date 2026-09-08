import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, Input, Button, Tabs, Typography, App, Space } from 'antd';
import { SaveOutlined, LinkOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader';
import { useGetLegalContentListQuery, useUpdateLegalContentMutation } from '../services/legalContentApi';
import { LEGAL_DOCS as DOCS } from '../utils/legalDocs';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

function DocEditor({ doc, item, saving, onSave }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [html, setHtml] = useState('');

  useEffect(() => {
    form.setFieldsValue({ title: item?.title ?? doc.label });
    setHtml(item?.contentHtml ?? '');
  }, [item, doc.label, form]);

  const submit = async () => {
    const { title } = await form.validateFields();
    if (!html || html === '<p><br></p>') {
      message.error('Content is required');
      return;
    }
    await onSave({ type: doc.type, title, contentHtml: html });
  };

  // Same-origin, no-login route rendered by PublicLegalContent — this is the
  // URL to give Google Play Console's Privacy Policy field.
  const publicUrl = `/legal/${doc.slug}`;

  return (
    <>
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Title is required' }]}
        >
          <Input placeholder={doc.label} />
        </Form.Item>

        <Form.Item label="Content" required>
          <ReactQuill
            theme="snow"
            value={html}
            onChange={setHtml}
            modules={QUILL_MODULES}
            style={{ background: '#fff' }}
          />
        </Form.Item>
      </Form>

      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginTop: 40,
          flexWrap: 'wrap',
          rowGap: 8,
        }}
      >
        <Space direction="vertical" size={0}>
          {item?.updatedAt && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Last updated {dayjs(item.updatedAt).format('DD MMM YYYY, h:mm A')}
            </Typography.Text>
          )}
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <LinkOutlined /> View public page
          </a>
        </Space>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={submit}>
          Save changes
        </Button>
      </Space>
    </>
  );
}

export default function LegalContent() {
  const { message } = App.useApp();
  const { data: items, isLoading } = useGetLegalContentListQuery();
  const [updateLegalContent, { isLoading: saving }] = useUpdateLegalContentMutation();
  const [activeTab, setActiveTab] = useState(DOCS[0].type);

  const itemsByType = useMemo(() => {
    const map = {};
    (items || []).forEach((it) => { map[it.type] = it; });
    return map;
  }, [items]);

  const handleSave = async (body) => {
    try {
      await updateLegalContent(body).unwrap();
      message.success('Content saved');
    } catch (err) {
      message.error(err?.data?.message || 'Could not save content');
    }
  };

  return (
    <>
      <PageHeader
        title="Legal Content"
        subtitle="Privacy Policy, Terms & Conditions, Return & Refund Policy and About Us — shown in the app and updated instantly, no app release needed"
      />

      <Card loading={isLoading} styles={{ body: { padding: '8px 0 0' } }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ paddingLeft: 24 }}
          items={DOCS.map((doc) => ({
            key: doc.type,
            label: doc.label,
            children: (
              <div style={{ padding: '0 24px 24px' }}>
                <DocEditor doc={doc} item={itemsByType[doc.type]} saving={saving} onSave={handleSave} />
              </div>
            ),
          }))}
        />
      </Card>
    </>
  );
}
