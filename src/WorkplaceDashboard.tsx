import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Loader2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// --- Types ---
type WorkplaceStatus = 'red' | 'yellow' | 'green';

type RiskType = '消防' | '人身安全' | '出入' | '客诉' | '交通事故/拥堵' | '办公/园区秩序' | '极端天气/自然灾害' | '财产损失';

interface RiskItem {
  type: RiskType;
  level: 'red' | 'yellow';
}

interface Workplace {
  id: string;
  name: string;
  city: string;
  status: WorkplaceStatus;
  redRiskCount: number;
  yellowRiskCount: number;
  rectificationTasks: {
    pending: number;
    overdue: number;
  };
  employeeCount: number;
  lastUpdate: string;
  safeDays?: number;
  risks?: RiskItem[];
}

// --- Mock Data & API ---
const MOCK_WORKPLACES: Workplace[] = [
  {
    id: 'dazhongsi',
    name: '大钟寺广场',
    city: '北京',
    status: 'red',
    redRiskCount: 2,
    yellowRiskCount: 0,
    rectificationTasks: { pending: 3, overdue: 1 },
    employeeCount: 1250,
    lastUpdate: '2026-03-20 14:30',
    risks: [
      { type: '消防', level: 'red' },
      { type: '出入', level: 'red' }
    ]
  },
  {
    id: 'zhongxing',
    name: '中兴大厦',
    city: '北京',
    status: 'red',
    redRiskCount: 1,
    yellowRiskCount: 1,
    rectificationTasks: { pending: 3, overdue: 1 },
    employeeCount: 850,
    lastUpdate: '2026-03-20 16:45',
    risks: [
      { type: '人身安全', level: 'red' },
      { type: '客诉', level: 'yellow' }
    ]
  },
  {
    id: 'puxiang',
    name: '上海浦项现代服务业大厦',
    city: '上海',
    status: 'yellow',
    redRiskCount: 0,
    yellowRiskCount: 2,
    rectificationTasks: { pending: 3, overdue: 0 },
    employeeCount: 1560,
    lastUpdate: '2026-03-20 11:20',
    risks: [
      { type: '办公/园区秩序', level: 'yellow' },
      { type: '出入', level: 'yellow' }
    ]
  },
  {
    id: 'caohaijing',
    name: '漕河泾中心',
    city: '上海',
    status: 'yellow',
    redRiskCount: 0,
    yellowRiskCount: 3,
    rectificationTasks: { pending: 2, overdue: 0 },
    employeeCount: 1200,
    lastUpdate: '2026-03-20 09:30',
    risks: [
      { type: '交通事故/拥堵', level: 'yellow' },
      { type: '客诉', level: 'yellow' },
      { type: '人身安全', level: 'yellow' }
    ]
  },
  {
    id: 'nanjingwu',
    name: '南京梧桐广场',
    city: '南京',
    status: 'yellow',
    redRiskCount: 0,
    yellowRiskCount: 1,
    rectificationTasks: { pending: 1, overdue: 0 },
    employeeCount: 980,
    lastUpdate: '2026-03-20 10:00',
    risks: [
      { type: '极端天气/自然灾害', level: 'yellow' }
    ]
  },
  {
    id: 'zhangrun',
    name: '张润大厦',
    city: '上海',
    status: 'green',
    redRiskCount: 0,
    yellowRiskCount: 0,
    rectificationTasks: { pending: 0, overdue: 0 },
    employeeCount: 2100,
    lastUpdate: '2026-03-20 08:00'
  },
  {
    id: 'nandaxue',
    name: '南京大学生物大学科技园',
    city: '南京',
    status: 'green',
    redRiskCount: 0,
    yellowRiskCount: 0,
    rectificationTasks: { pending: 0, overdue: 0 },
    employeeCount: 720,
    lastUpdate: '2026-03-20 12:15'
  },
  {
    id: 'hengda',
    name: '恒大广场',
    city: '合肥市',
    status: 'green',
    redRiskCount: 0,
    yellowRiskCount: 0,
    rectificationTasks: { pending: 0, overdue: 0 },
    employeeCount: 1100,
    lastUpdate: '2026-03-20 15:00'
  },
  {
    id: 'zhongliang',
    name: '中粮广场',
    city: '兰州',
    status: 'green',
    redRiskCount: 0,
    yellowRiskCount: 0,
    rectificationTasks: { pending: 0, overdue: 0 },
    employeeCount: 540,
    lastUpdate: '2026-03-20 13:45'
  },
  {
    id: 'xiamenwanda',
    name: '厦门万达广场',
    city: '厦门',
    status: 'yellow',
    redRiskCount: 0,
    yellowRiskCount: 2,
    rectificationTasks: { pending: 2, overdue: 0 },
    employeeCount: 810,
    lastUpdate: '2026-03-20 17:00',
    risks: [
      { type: '财产损失', level: 'yellow' },
      { type: '出入', level: 'yellow' }
    ]
  },
  {
    id: 'zijincheng',
    name: '紫金城',
    city: '天津市',
    status: 'green',
    redRiskCount: 0,
    yellowRiskCount: 0,
    rectificationTasks: { pending: 0, overdue: 0 },
    employeeCount: 630,
    lastUpdate: '2026-03-20 18:00'
  },
  {
    id: 'shanxizhic',
    name: '山西智创城',
    city: '太原市',
    status: 'green',
    redRiskCount: 0,
    yellowRiskCount: 0,
    rectificationTasks: { pending: 0, overdue: 0 },
    employeeCount: 980,
    lastUpdate: '2026-03-20 19:00'
  }
];

// --- Main Page Component ---

export default function WorkplaceDashboard() {
  const navigate = useNavigate();
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('status');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [riskTypeFilter, setRiskTypeFilter] = useState<string>('all');
  const [overdueFilter, setOverdueFilter] = useState<string>('all');

  const hasFilters = searchQuery || statusFilter !== 'all' || cityFilter !== 'all' || riskTypeFilter !== 'all' || overdueFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCityFilter('all');
    setRiskTypeFilter('all');
    setOverdueFilter('all');
  };

  // Simulate API Fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate random safe days for green workplaces
      const workplacesWithRandomDays = MOCK_WORKPLACES.map(wp => {
        if (wp.status === 'green') {
          return { ...wp, safeDays: Math.floor(Math.random() * 365) + 30 };
        }
        return wp;
      });
      
      setWorkplaces(workplacesWithRandomDays);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Sort and Filter Logic
  const filteredWorkplaces = useMemo(() => {
    let result = [...workplaces];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(w => w.status === statusFilter);
    }

    // Filter by city
    if (cityFilter !== 'all') {
      result = result.filter(w => w.city === cityFilter);
    }

    // Filter by risk type
    if (riskTypeFilter !== 'all') {
      result = result.filter(w => 
        w.risks && w.risks.some(risk => risk.type === riskTypeFilter)
      );
    }

    // Filter by overdue
    if (overdueFilter !== 'all') {
      if (overdueFilter === 'yes') {
        result = result.filter(w => w.rectificationTasks.overdue > 0);
      } else if (overdueFilter === 'no') {
        result = result.filter(w => w.rectificationTasks.overdue === 0);
      }
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w => 
        w.name.toLowerCase().includes(q) || 
        w.city.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'status') {
        const priority = { red: 0, yellow: 1, green: 2 };
        const statusA = priority[a.status];
        const statusB = priority[b.status];
        if (statusA !== statusB) return statusA - statusB;
        
        const overdueA = a.rectificationTasks.overdue;
        const overdueB = b.rectificationTasks.overdue;
        if (overdueA !== overdueB) return overdueB - overdueA;
        
        return b.redRiskCount - a.redRiskCount;
      }
      
      if (sortBy === 'rectificationTasks') {
        const totalA = a.rectificationTasks.pending + a.rectificationTasks.overdue;
        const totalB = b.rectificationTasks.pending + b.rectificationTasks.overdue;
        return sortOrder === 'asc' ? totalA - totalB : totalB - totalA;
      }
      
      if (sortBy === 'safeDays') {
        const daysA = a.safeDays || 0;
        const daysB = b.safeDays || 0;
        return sortOrder === 'asc' ? daysA - daysB : daysB - daysA;
      }

      
      return 0;
    });

    return result;
  }, [workplaces, searchQuery, sortBy, sortOrder, statusFilter, cityFilter, riskTypeFilter, overdueFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = workplaces.length;
    const redCount = workplaces.filter(w => w.status === 'red').length;
    const yellowCount = workplaces.filter(w => w.status === 'yellow').length;
    const hasOverdue = workplaces.filter(w => w.rectificationTasks.overdue > 0).length;
    const latestUpdate = workplaces.length > 0 
      ? workplaces.reduce((latest, w) => w.lastUpdate > latest ? w.lastUpdate : latest, workplaces[0].lastUpdate)
      : '';
    
    return { total, redYellowCount: redCount + yellowCount, hasOverdue, latestUpdate };
  }, [workplaces]);

  // Extract unique cities and risk types
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    workplaces.forEach(wp => cities.add(wp.city));
    return Array.from(cities).sort();
  }, [workplaces]);

  const uniqueRiskTypes = useMemo(() => {
    const riskTypes = new Set<RiskType>();
    workplaces.forEach(wp => {
      if (wp.risks) {
        wp.risks.forEach(risk => riskTypes.add(risk.type));
      }
    });
    return Array.from(riskTypes).sort();
  }, [workplaces]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status: WorkplaceStatus) => {
    switch (status) {
      case 'red': return '#D93026';
      case 'yellow': return '#E8921C';
      case 'green': return '#34A853';
      default: return '#8F959E';
    }
  };

  const getRowBorderColor = (status: WorkplaceStatus) => {
    return 'border-l-transparent';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-[52px] bg-bg-overlay border-b border-divider-light flex items-center px-3 shrink-0 gap-3 z-20">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 flex items-center justify-center rounded-md text-text-caption">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.79115 10.0938L3.79009 10.0947L3.77946 10.088L3.75395 10.0717L1.90886 8.8846L1.89186 8.87308L0.0053142 7.65913L0 7.65625V21.9991H17.3381V18.5761H3.79115V10.0938Z" fill="#0051F6"/>
              <path d="M20.207 6.26446L20.2092 22.0008H24.0003V9.37468L20.207 6.25391V6.26446Z" fill="#00BCFF"/>
              <path d="M0.0053142 7.66L3.75395 10.0725L3.77946 10.0889L3.79009 10.0956L3.79115 10.0946L3.92613 10.0399L13.547 6.8846V15.9417H17.3381V2L0 7.65712L0.0053142 7.66Z" fill="#3C8BFF"/>
            </svg>
          </div>
        </div>
        <h1 className="text-[17px] font-semibold text-text-title tracking-tight">物理安全 Profile</h1>
      </header>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-10 py-8">
        {/* Stats Cards */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.91667 0.583336C2.27233 0.583336 1.75 1.10567 1.75 1.75V12.25C1.75 12.8943 2.27233 13.4167 2.91667 13.4167H11.0833C11.7277 13.4167 12.25 12.8943 12.25 12.25V4.08334C12.25 3.439 11.7277 2.91667 11.0833 2.91667H9.91667V1.75C9.91667 1.10567 9.39433 0.583336 8.75 0.583336H2.91667ZM9.91667 12.25V4.08334H11.0833V12.25H9.91667ZM5.25 9.91667H6.41667C6.73883 9.91667 7 10.1778 7 10.5V12.25H4.66667V10.5C4.66667 10.1778 4.92783 9.91667 5.25 9.91667ZM4.08333 4.375C4.08333 4.21392 4.21392 4.08334 4.375 4.08334H4.95833C5.11942 4.08334 5.25 4.21392 5.25 4.375V4.95834C5.25 5.11942 5.11942 5.25 4.95833 5.25H4.375C4.21392 5.25 4.08333 5.11942 4.08333 4.95834V4.375ZM6.70833 4.08334H7.29167C7.45275 4.08334 7.58333 4.21392 7.58333 4.375V4.95834C7.58333 5.11942 7.45275 5.25 7.29167 5.25H6.70833C6.54725 5.25 6.41667 5.11942 6.41667 4.95834V4.375C6.41667 4.21392 6.54725 4.08334 6.70833 4.08334ZM4.08333 6.70834C4.08333 6.54725 4.21392 6.41667 4.375 6.41667H4.95833C5.11942 6.41667 5.25 6.54725 5.25 6.70834V7.29167C5.25 7.45275 5.11942 7.58334 4.95833 7.58334H4.375C4.21392 7.58334 4.08333 7.45275 4.08333 7.29167V6.70834ZM6.70833 6.41667H7.29167C7.45275 6.41667 7.58333 6.54725 7.58333 6.70834V7.29167C7.58333 7.45275 7.45275 7.58334 7.29167 7.58334H6.70833C6.54725 7.58334 6.41667 7.45275 6.41667 7.29167V6.70834C6.41667 6.54725 6.54725 6.41667 6.70833 6.41667Z" fill="#336DF4"/>
            </svg>
            <div className="text-left">
              <div className="text-sm text-gray-500">总职场数</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.01048 1.16695C7.56143 0.389174 6.4388 0.389173 5.98975 1.16695L0.432825 11.0836C-0.0162255 11.8614 0.545086 12.8336 1.44319 12.8336H12.5572C13.4553 12.8336 14.0166 11.8614 13.5675 11.0836L8.01048 1.16695ZM6.27089 4.8125C6.27089 4.57088 6.46677 4.375 6.70839 4.375H7.29173C7.53335 4.375 7.72923 4.57088 7.72923 4.8125V8.3125C7.72923 8.55412 7.53335 8.75 7.29173 8.75H6.70839C6.46677 8.75 6.27089 8.55412 6.27089 8.3125V4.8125ZM6.27089 9.77083C6.27089 9.52921 6.46677 9.33333 6.70839 9.33333H7.29173C7.53335 9.33333 7.72923 9.52921 7.72923 9.77083V10.3542C7.72923 10.5958 7.53335 10.7917 7.29173 10.7917H6.70839C6.46677 10.7917 6.27089 10.5958 6.27089 10.3542V9.77083Z" fill="#F54A45"/>
            </svg>
            <div className="text-left">
              <div className="text-sm text-gray-500">红灯/黄灯职场</div>
              <div className="text-3xl font-bold text-gray-900">{stats.redYellowCount}</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.66663 1.75C4.66663 1.42783 4.40546 1.16666 4.08329 1.16666C3.76113 1.16666 3.49996 1.42783 3.49996 1.75H2.33327C1.68894 1.75 1.16663 2.27233 1.16663 2.91666V11.6667C1.16663 12.311 1.68896 12.8333 2.33329 12.8333H6.85683C6.21638 12.0344 5.83329 11.0203 5.83329 9.91666C5.83329 7.33934 7.92263 5.25 10.5 5.25C11.35 5.25 12.1469 5.47725 12.8333 5.87431V2.91666C12.8333 2.27233 12.311 1.75 11.6666 1.75H10.5C10.5 1.42783 10.2388 1.16666 9.91663 1.16666C9.59446 1.16666 9.33329 1.42783 9.33329 1.75H4.66663ZM4.08329 7.58333C4.40546 7.58333 4.66663 7.8445 4.66663 8.16666V8.75C4.66663 9.07216 4.40546 9.33333 4.08329 9.33333H3.49996C3.17779 9.33333 2.91663 9.07216 2.91663 8.75V8.16666C2.91663 7.8445 3.17779 7.58333 3.49996 7.58333H4.08329ZM3.49996 4.66666H4.08329C4.40546 4.66666 4.66663 4.92783 4.66663 5.25V5.83333C4.66663 6.1555 4.40546 6.41666 4.08329 6.41666H3.49996C3.17779 6.41666 2.91663 6.1555 2.91663 5.83333V5.25C2.91663 4.92783 3.17779 4.66666 3.49996 4.66666ZM5.83329 5.25C5.83329 4.92783 6.09446 4.66666 6.41663 4.66666H6.99996C7.32212 4.66666 7.58329 4.92783 7.58329 5.25V5.83333C7.58329 6.1555 7.32212 6.41666 6.99996 6.41666H6.41663C6.09446 6.41666 5.83329 6.1555 5.83329 5.83333V5.25Z" fill="#FF811A"/>
              <path d="M14 9.91666C14 11.8497 12.433 13.4167 10.5 13.4167C8.56696 13.4167 6.99996 11.8497 6.99996 9.91666C6.99996 7.98367 8.56696 6.41666 10.5 6.41666C12.433 6.41666 14 7.98367 14 9.91666ZM10.5 8.16666C10.1778 8.16666 9.91663 8.42783 9.91663 8.75V9.91666C9.91663 10.2388 10.1778 10.5 10.5 10.5H11.6666C11.9888 10.5 12.25 10.2388 12.25 9.91666C12.25 9.5945 11.9888 9.33333 11.6666 9.33333H11.0833V8.75C11.0833 8.42783 10.8221 8.16666 10.5 8.16666Z" fill="#FF811A"/>
            </svg>
            <div className="text-left">
              <div className="text-sm text-gray-500">存在逾期整改的职场</div>
              <div className="text-3xl font-bold text-gray-900">{stats.hasOverdue}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索职场名称"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="relative w-40">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="all">城市</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="all">安全状态</option>
                <option value="red">红灯</option>
                <option value="yellow">黄灯</option>
                <option value="green">绿灯</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative w-40">
              <select
                value={riskTypeFilter}
                onChange={(e) => setRiskTypeFilter(e.target.value)}
                className="w-full px-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="all">风险类型</option>
                {uniqueRiskTypes.map(riskType => (
                  <option key={riskType} value={riskType}>{riskType}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative w-40">
              <select
                value={overdueFilter}
                onChange={(e) => setOverdueFilter(e.target.value)}
                className="w-full px-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="all">整改任务逾期</option>
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                清空
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            最后更新: {stats.latestUpdate}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">正在加载职场数据...</p>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {filteredWorkplaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的职场</h3>
                <p className="text-gray-500 max-w-sm">请尝试调整筛选条件或搜索关键词</p>
              </div>
            ) : (
              /* Table */
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          安全状态
                          {sortBy === 'status' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">职场名称</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">城市</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">风险类型</th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('rectificationTasks')}
                      >
                        <div className="flex items-center gap-1">
                          待整改任务
                          {sortBy === 'rectificationTasks' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('safeDays')}
                      >
                        <div className="flex items-center gap-1">
                          持续安全天数
                          {sortBy === 'safeDays' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600" style={{ width: '120px' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWorkplaces.map((workplace) => (
                      <tr 
                        key={workplace.id}
                        className={`hover:bg-gray-50 transition-colors border-l-2 ${getRowBorderColor(workplace.status)}`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getStatusColor(workplace.status) }}
                            />
                            <span className="text-sm text-gray-900">
                              {workplace.status === 'red' ? '红灯' : workplace.status === 'yellow' ? '黄灯' : '绿灯'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{workplace.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{workplace.city}</td>
                        <td className="px-4 py-4">
                          {workplace.risks && workplace.risks.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1">
                              {workplace.risks.map((risk, index) => (
                                <span 
                                  key={index}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                    risk.level === 'red' 
                                      ? 'bg-red-50 text-red-700' 
                                      : 'bg-orange-50 text-orange-700'
                                  }`}
                                >
                                  {risk.type}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">--</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">
                              {workplace.rectificationTasks.pending + workplace.rectificationTasks.overdue}
                            </span>
                            {workplace.rectificationTasks.overdue > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                                {workplace.rectificationTasks.overdue} 项逾期
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {workplace.status === 'green' ? (
                            `${workplace.safeDays || 0}天`
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-left" style={{ width: '120px' }}>
                          <button
                            onClick={() => navigate(`/workplace/${workplace.id}`)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
