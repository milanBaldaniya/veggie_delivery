import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Spin, Result } from 'antd';
import { BRAND } from '../utils/constants';
import { getLegalDocBySlug } from '../utils/legalDocs';
import { useGetPublicLegalContentQuery } from '../services/publicLegalApi';

// Public, unauthenticated page — no AdminLayout/login required. This is the
// URL to give Google Play Console's Privacy Policy field, e.g.
// https://<this-site>/legal/privacy-policy. Content is admin-managed and
// fetched live, so it updates instantly without a redeploy.
export default function PublicLegalContent() {
  const { slug } = useParams();
  const doc = getLegalDocBySlug(slug);
  const { data: content, isLoading, isError } = useGetPublicLegalContentQuery(doc?.type, { skip: !doc });

  if (!doc) {
    return (
      <Page>
        <Result status="404" title="Page not found" subTitle="This page doesn't exist." extra={<Link to="/">Go home</Link>} />
      </Page>
    );
  }

  if (isLoading) {
    return (
      <Page>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <Result status="error" title="Couldn't load this page" subTitle="Please try again in a moment." />
      </Page>
    );
  }

  return (
    <Page>
      <Typography.Title level={2} style={{ marginBottom: 4 }}>
        {content?.title || doc.label}
      </Typography.Title>
      {content?.updatedAt && (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Last updated {new Date(content.updatedAt).toLocaleDateString()}
        </Typography.Text>
      )}
      {content?.contentHtml ? (
        <div className="legal-content-body" dangerouslySetInnerHTML={{ __html: content.contentHtml }} />
      ) : (
        <Typography.Paragraph type="secondary">This page hasn't been published yet.</Typography.Paragraph>
      )}
    </Page>
  );
}

function Page({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f8' }}>
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '48px 24px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <span style={{ fontSize: 22 }}>🥦</span>
          <Typography.Text strong style={{ fontSize: 16, color: BRAND.primary }}>
            {BRAND.name}
          </Typography.Text>
        </div>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '32px 40px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {children}
        </div>
      </div>
      <style>{`
        .legal-content-body { line-height: 1.7; color: rgba(0,0,0,0.85); }
        .legal-content-body h1, .legal-content-body h2, .legal-content-body h3, .legal-content-body h4 { margin-top: 24px; margin-bottom: 8px; }
        .legal-content-body p { margin-bottom: 12px; }
        .legal-content-body ul, .legal-content-body ol { padding-left: 24px; margin-bottom: 12px; }
        .legal-content-body a { color: ${BRAND.primary}; }
      `}</style>
    </div>
  );
}
