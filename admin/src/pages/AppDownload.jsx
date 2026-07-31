import React from 'react';
import { Card, Typography, Button, Space, Skeleton, Result, Input, App } from 'antd';
import { DownloadOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { useGetDownloadQrQuery } from '../services/appDownloadApi';

export default function AppDownload() {
  const { message } = App.useApp();
  const { data, isLoading, isError, refetch } = useGetDownloadQrQuery();

  const copyLink = async () => {
    await navigator.clipboard.writeText(data.downloadUrl);
    message.success('Link copied');
  };

  return (
    <>
      <PageHeader
        title="App Download"
        subtitle="Share this QR code with customers to let them download and install the latest Android app build"
      />

      <Card style={{ maxWidth: 480 }}>
        {isLoading && <Skeleton active paragraph={{ rows: 6 }} />}

        {isError && (
          <Result
            status="warning"
            title="Could not generate the QR code"
            extra={
              <Button icon={<ReloadOutlined />} onClick={refetch}>
                Retry
              </Button>
            }
          />
        )}

        {data && (
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <img
              src={data.qrCode}
              alt="Scan to download the app"
              style={{ width: 256, height: 256 }}
            />

            <Input
              value={data.downloadUrl}
              readOnly
              onFocus={(e) => e.target.select()}
              style={{ textAlign: 'center' }}
            />

            <Space wrap>
              <Button icon={<CopyOutlined />} onClick={copyLink}>
                Copy link
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                href={data.qrCode}
                download="veggie-delivery-app-qr.png"
              >
                Download QR image
              </Button>
            </Space>

            <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
              Scanning this QR downloads the current release APK directly. To publish a new
              build, replace the file on the server and the same QR/link keeps working.
            </Typography.Text>
          </Space>
        )}
      </Card>
    </>
  );
}
