import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Grid, Drawer, Button, theme } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  InboxOutlined,
  TeamOutlined,
  HomeOutlined,
  SafetyOutlined,
  ShopOutlined,
  WalletOutlined,
  DollarOutlined,
  ProfileOutlined,
  BarChartOutlined,
  CarryOutOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import { ROLE_META, BRAND } from '../utils/constants';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const ALL = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'WATCHMAN'];
const MGMT = ['SUPER_ADMIN', 'ADMIN'];
const FINANCE = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'];
const OPS = ['SUPER_ADMIN', 'ADMIN', 'WATCHMAN'];

// Menu is role-aware: `roles` gates each item; groups are dropped when empty.
const MENU_GROUPS = [
  {
    key: 'g-overview',
    label: 'Overview',
    items: [{ key: '/', icon: <DashboardOutlined />, label: 'Dashboard', roles: ALL }],
  },
  {
    key: 'g-ops',
    label: 'Operations',
    items: [
      { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders', roles: OPS },
      { key: '/packing', icon: <InboxOutlined />, label: 'Packing', roles: OPS },
      { key: '/reports/daily-purchase', icon: <CarryOutOutlined />, label: 'Daily Purchase', roles: FINANCE },
      { key: '/products', icon: <AppstoreOutlined />, label: 'Products', roles: MGMT },
    ],
  },
  {
    key: 'g-people',
    label: 'People & Societies',
    items: [
      { key: '/users', icon: <TeamOutlined />, label: 'Users', roles: MGMT },
      { key: '/buildings', icon: <HomeOutlined />, label: 'Buildings', roles: MGMT },
      { key: '/watchmen', icon: <SafetyOutlined />, label: 'Watchmen', roles: MGMT },
    ],
  },
  {
    key: 'g-finance',
    label: 'Finance',
    items: [
      { key: '/billing', icon: <FileTextOutlined />, label: 'Billing', roles: FINANCE },
      { key: '/expenses', icon: <WalletOutlined />, label: 'Expenses', roles: FINANCE },
      { key: '/vendors', icon: <ShopOutlined />, label: 'Vendors', roles: FINANCE },
      { key: '/salaries', icon: <DollarOutlined />, label: 'Salary', roles: FINANCE },
    ],
  },
  {
    key: 'g-reports',
    label: 'Insights',
    items: [{ key: '/reports', icon: <BarChartOutlined />, label: 'Reports', roles: FINANCE }],
  },
];

// Flattened list of every routable menu key, for selected-key matching.
const ALL_KEYS = MENU_GROUPS.flatMap((g) => g.items.map((i) => i.key));

function buildMenu(role) {
  return MENU_GROUPS.map((g) => {
    const items = g.items.filter((i) => i.roles.includes(role)).map(({ roles, ...rest }) => rest);
    return items.length ? { key: g.key, type: 'group', label: g.label, children: items } : null;
  }).filter(Boolean);
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false); // desktop rail collapse
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile overlay drawer
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // `screens.md` is undefined on the very first render; treat that as desktop so
  // we don't flash the mobile layout.
  const isMobile = screens.md === false;
  const menuItems = buildMenu(user?.role);
  const selectedKey =
    ALL_KEYS.filter((k) => k !== '/' && location.pathname.startsWith(k)).sort(
      (a, b) => b.length - a.length
    )[0] || '/';

  const roleMeta = ROLE_META[user?.role] || { label: user?.role };

  const brand = (compact) => (
    <div
      style={{
        height: 56,
        margin: 12,
        color: '#fff',
        fontWeight: 700,
        fontSize: compact ? 22 : 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      <span>🥦</span>
      {!compact && <span>{BRAND.name}</span>}
    </div>
  );

  // Shared menu; on mobile a tap also closes the drawer.
  const menu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      onClick={({ key }) => {
        navigate(key);
        setDrawerOpen(false);
      }}
      items={menuItems}
      style={{ borderInlineEnd: 'none' }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop: in-flow collapsible sider. Hidden on mobile. */}
      {!isMobile && (
        <Sider
          collapsed={collapsed}
          trigger={null}
          width={224}
          style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
        >
          {brand(collapsed)}
          {menu}
        </Sider>
      )}

      {/* Mobile: overlay drawer holding the same menu. */}
      <Drawer
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closable={false}
        width={240}
        styles={{ body: { padding: 0, background: '#001529' } }}
      >
        {brand(false)}
        {menu}
      </Drawer>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <Button
            type="text"
            aria-label="Toggle menu"
            icon={
              isMobile || collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 18 }} />
              ) : (
                <MenuFoldOutlined style={{ fontSize: 18 }} />
              )
            }
            onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed))}
          />

          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Log out',
                  danger: true,
                  onClick: () => dispatch(logout()),
                },
              ],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar style={{ background: BRAND.primary }} icon={<UserOutlined />} />
              {!isMobile && (
                <div style={{ lineHeight: 1.2 }}>
                  <Typography.Text strong>{user?.name || 'Admin'}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {roleMeta.label}
                  </Typography.Text>
                </div>
              )}
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: isMobile ? 12 : 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
