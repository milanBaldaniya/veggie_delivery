import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';

// A dashboard KPI tile with an icon chip. Shows a skeleton while loading.
export default function StatCard({ title, value, prefix, icon, color = '#2E7D32', loading }) {
  return (
    <Card variant="borderless" style={{ height: '100%' }} styles={{ body: { padding: 20 } }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {icon && (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${color}18`,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
          <Statistic title={title} value={value} prefix={prefix} valueStyle={{ fontWeight: 700 }} />
        </div>
      )}
    </Card>
  );
}
