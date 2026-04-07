import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Button } from '@universe-design/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  // 根据路由判断是否在详情页
  const isDetailPage = location.pathname.startsWith('/workplace/');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen bg-bg-body flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-[52px] bg-bg-overlay border-b border-divider-light flex items-center px-3 shrink-0 gap-2 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-md text-text-caption">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_572_26776)">
                <path d="M21.4117 9.39258L9.48145 21.0135L12.0884 23.5763L21.4117 14.3414V9.39258Z" fill="#00BCFF"/>
                <path d="M2.5 14.0766V0.378906H6.12326V12.6184L14.7395 21.0138L12.0884 23.6208L2.5 14.0766Z" fill="#0051F6"/>
                <path d="M21.5 0.378906H2.5V3.95798H17.8767L9.39302 11.9998L12.0884 14.5184L21.5 5.50449V0.378906Z" fill="#008DFF"/>
              </g>
              <defs>
                <clipPath id="clip0_572_26776">
                  <rect width="24" height="24" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        <h1 className="text-[17px] font-semibold text-text-title tracking-tight cursor-pointer" onClick={() => navigate('/')}>物理安全 Profile</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className={`bg-transparent border-r border-divider-light shrink-0 transition-all duration-300 ease-in-out flex flex-col ${
            collapsed ? 'w-[80px]' : 'w-[200px]'
          }`}
        >
          <Menu
            defaultSelectedKeys={['workplace-profile']}
            mode="inline"
            inlineCollapsed={collapsed}
            style={{ borderRight: 'none', backgroundColor: 'transparent', flex: 1 }}
          >
            <Menu.Item
              key="data-dashboard"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-8v2h4a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h4v-2H3c-1.1 0-2-.9-2-2V4Zm20 0H3v12h18V4Z" fill="currentColor"/>
                </svg>
              }
            >
              数据驾驶舱
            </Menu.Item>
            <Menu.Item
              key="workplace-profile"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1ZM7 11.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm4.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z" fill="currentColor"/>
                  <path d="M5 23a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5ZM15 3H5v18h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3V3Zm2 18h2V7h-2v14Z" fill="currentColor"/>
                </svg>
              }
            >
              职场安全档案
            </Menu.Item>
            <Menu.Item
              key="security-status"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 3a1 1 0 0 1-2 0V2a1 1 0 1 1 2 0v1Zm4.98 1.945a1 1 0 1 1-1.732-1l.45-.78a1 1 0 0 1 1.732 1l-.45.78Zm1.698 3.359a1 1 0 0 0 1.366.366l.373-.215a1 1 0 1 0-1-1.732l-.373.215a1 1 0 0 0-.366 1.366ZM2.59 8.455a1 1 0 0 1 1-1.732l.374.215a1 1 0 0 1-1 1.732l-.373-.215ZM5.945 2.8a1 1 0 0 0-.366 1.366l.45.78a1 1 0 0 0 1.732-1l-.45-.78A1 1 0 0 0 5.945 2.8ZM9 12a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1Z" fill="currentColor"/>
                  <path d="M20 12.758C20 8.473 16.307 5 12 5c-4.308 0-7.992 3.473-7.992 7.758V21H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2h-1v-8.242Zm-13.998-.175C6.097 9.484 8.746 7 12 7c3.313 0 6 2.577 6 5.756V21H6v-8.244l.002-.173Z" fill="currentColor"/>
                </svg>
              }
            >
              安全状态管理
            </Menu.Item>
            <Menu.Item
              key="knowledge-base"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 8.5a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" fill="currentColor"/>
                  <path d="M3 3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3Zm2 0v18h14V3H5Z" fill="currentColor"/>
                </svg>
              }
            >
              知识库管理
            </Menu.Item>
          </Menu>
          
          <div className="p-4 border-t border-divider-light flex justify-center mt-auto">
            <Button
              type="text"
              color="primary"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
