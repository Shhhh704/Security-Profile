import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import WorkplaceDetail from './pages/WorkplaceDetail';
import WorkplaceDashboard from './pages/WorkplaceDashboard';
import Layout from './components/Layout';
import { ConfigProvider } from '@universe-design/react';
// @ts-ignore
import zhCN from '@universe-design/react/es/shared/locales/zh-CN';
import '@universe-design/react/es/styles/light.cssvar.less';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<WorkplaceDashboard />} />
            <Route path="/workplace/:id" element={<WorkplaceDetail />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  </StrictMode>
);
