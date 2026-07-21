import React from 'react';
import { Upload, App, Button } from 'antd';
import { PlusOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUploadImageMutation } from '../services/uploadApi';

// Controlled image picker for AntD Form: `value` is the Cloudinary URL, `onChange`
// receives the new URL (or null when removed). Uploads via RTK Query.
export default function ImageUpload({ value, onChange }) {
  const { message } = App.useApp();
  const [uploadImage, { isLoading }] = useUploadImageMutation();

  const customRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const data = await uploadImage(formData).unwrap();
      onChange?.(data.url);
      message.success('Image uploaded');
      onSuccess?.(data);
    } catch (err) {
      message.error(err?.data?.message || 'Upload failed');
      onError?.(err);
    }
  };

  return (
    <div>
      <Upload
        accept="image/*"
        listType="picture-card"
        showUploadList={false}
        customRequest={customRequest}
        disabled={isLoading}
      >
        {value ? (
          <img src={value} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div>
            {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>{isLoading ? 'Uploading' : 'Upload'}</div>
          </div>
        )}
      </Upload>
      {value && (
        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onChange?.(null)}>
          Remove
        </Button>
      )}
    </div>
  );
}
