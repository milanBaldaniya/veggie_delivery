import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import 'antd/dist/reset.css';
import { store } from './app/store';
import AppRoutes from './App';
import { BRAND } from './utils/constants';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: { colorPrimary: BRAND.primary, borderRadius: 8, fontSize: 14 },
        }}
      >
        {/* AntdApp provides static message/notification/modal contexts. */}
        <AntdApp>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
