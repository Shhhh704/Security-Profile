import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import WorkplaceDashboard from './WorkplaceDashboard.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<WorkplaceDashboard />} />
        <Route path="/workplace/:id" element={<App />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
