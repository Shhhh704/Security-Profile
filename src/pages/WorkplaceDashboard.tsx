import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from '@universe-design/react';
import { Table, Pagination, Select, Input, Tag } from '@universe-design/react';
import { Search, Loader2 } from 'lucide-react';
import type { WorkplaceSummary, WorkplaceStatus, RiskItem, RiskCategory } from '../types';
import { MOCK_WORKPLACES } from '../mocks/workplaces';

export default function WorkplaceDashboard() {
  const navigate = useNavigate();
  const [workplaces, setWorkplaces] = useState<WorkplaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('status');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [cityFilter, setCityFilter] = useState<string | undefined>(undefined);
  const [riskTypeFilter, setRiskTypeFilter] = useState<string | undefined>(undefined);
  const [overdueFilter, setOverdueFilter] = useState<string | undefined>(undefined);

  const hasFilters = searchQuery || statusFilter !== undefined || cityFilter !== undefined || riskTypeFilter !== undefined || overdueFilter !== undefined;

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter(undefined);
    setCityFilter(undefined);
    setRiskTypeFilter(undefined);
    setOverdueFilter(undefined);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

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

  const filteredWorkplaces = useMemo(() => {
    let result = [...workplaces];

    if (statusFilter) {
      result = result.filter(w => w.status === statusFilter);
    }
    if (cityFilter) {
      result = result.filter(w => w.city === cityFilter);
    }
    if (riskTypeFilter) {
      result = result.filter(w =>
        w.risks && w.risks.some(risk => risk.type === riskTypeFilter)
      );
    }
    if (overdueFilter) {
      if (overdueFilter === 'yes') {
        result = result.filter(w => w.rectificationTasks.overdue > 0);
      } else if (overdueFilter === 'no') {
        result = result.filter(w => w.rectificationTasks.overdue === 0);
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q)
      );
    }

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

  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    workplaces.forEach(wp => cities.add(wp.city));
    return Array.from(cities).sort();
  }, [workplaces]);

  const uniqueRiskTypes = useMemo(() => {
    const riskTypes = new Set<RiskCategory>();
    workplaces.forEach(wp => {
      if (wp.risks) {
        wp.risks.forEach(risk => riskTypes.add(risk.type));
      }
    });
    return Array.from(riskTypes).sort();
  }, [workplaces]);

  const getStatusColor = (status: WorkplaceStatus) => {
    switch (status) {
      case 'red': return '#D93026';
      case 'yellow': return '#E8921C';
      case 'green': return '#34A853';
      default: return '#8F959E';
    }
  };

  const columns: ColumnsType<WorkplaceSummary> = [
    {
      title: '职场名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
    },
    {
      title: '安全状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      sorter: true,
      sortOrder: sortBy === 'status' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : undefined,
      render: (status: WorkplaceStatus) => {
        if (!status) return null;

        const config = {
          red: {
            color: 'error',
            text: '红灯',
            icon: (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.732 2c-.77-1.333-2.694-1.333-3.464 0L.742 19c-.77 1.334.192 3 1.732 3h19.052c1.54 0 2.502-1.666 1.733-3L13.732 2ZM10.75 8.25a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1-.75-.75v-6Zm0 8.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1-.75-.75v-1Z" fill="currentColor" />
              </svg>
            ),
          },
          yellow: {
            color: 'warning',
            text: '黄灯',
            icon: (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11ZM11 7.5v6a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5Zm0 8v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5Z" fill="currentColor" />
              </svg>
            ),
          },
          green: {
            color: 'success',
            text: '绿灯',
            icon: (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.013 11.996c0 6.066 4.916 10.984 10.983 10.984 6.066 0 10.983-4.918 10.983-10.984S18.062 1.013 11.996 1.013C5.93 1.013 1.014 5.93 1.013 11.996Zm15.505-3.491 1.112 1.112a.48.48 0 0 1 0 .68l-6.488 6.488a.481.481 0 0 1-.68 0l-4.1-4.098a.48.48 0 0 1 0-.681l1.112-1.111a.481.481 0 0 1 .68 0l2.647 2.645 5.037-5.035a.481.481 0 0 1 .68 0Z" fill="currentColor" />
              </svg>
            ),
          },
        }[status];

        return config ? (
          <Tag
            color={config.color as any}
            size="small"
            icon={config.icon}
          >
            {config.text}
          </Tag>
        ) : null;
      },
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 120,
    },
    {
      title: '风险类型',
      dataIndex: 'risks',
      key: 'risks',
      render: (risks?: RiskItem[]) => {
        if (!risks || risks.length === 0) {
          return <span className="text-gray-400">--</span>;
        }
        return (
          <div className="flex items-center gap-1 w-max">
            {risks.map((risk, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                  risk.level === 'red'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-orange-50 text-orange-700'
                }`}
              >
                {risk.type}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: '待整改任务',
      dataIndex: 'rectificationTasks',
      key: 'rectificationTasks',
      width: 200,
      sorter: true,
      sortOrder: sortBy === 'rectificationTasks' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : undefined,
      render: (tasks: WorkplaceSummary['rectificationTasks'], record: WorkplaceSummary) => {
        if (record.status === 'green' || (tasks.pending === 0 && tasks.overdue === 0)) {
          return <span className="text-gray-400">--</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{tasks.pending + tasks.overdue}</span>
            {tasks.overdue > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                {tasks.overdue} 项逾期
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: '持续安全天数',
      dataIndex: 'safeDays',
      key: 'safeDays',
      width: 200,
      sorter: true,
      sortOrder: sortBy === 'safeDays' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : undefined,
      render: (safeDays: number | undefined, record: WorkplaceSummary) => (
        record.status === 'green' ? `${safeDays || 0}天` : <span className="text-gray-400">--</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 1,
      render: (_: any, record: WorkplaceSummary) => (
        <button
          onClick={() => navigate(`/workplace/${record.id}`)}
          className="text-sm font-medium hover:underline whitespace-nowrap"
          style={{ color: '#2563eb' }}
        >
          查看详情
        </button>
      ),
    },
  ];

  const tableDataSource = filteredWorkplaces.map(workplace => ({
    ...workplace,
    key: workplace.id,
  }));

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    if (sorter.field) {
      const field = sorter.field as string;
      if (field === 'status' || field === 'rectificationTasks' || field === 'safeDays') {
        if (sortBy === field) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
          setSortBy(field);
          setSortOrder('asc');
        }
      }
    }
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return tableDataSource.slice(startIndex, startIndex + pageSize);
  }, [tableDataSource, currentPage, pageSize]);

  return (
    <div className="h-full overflow-auto">
      <div className="w-full min-w-[960px] px-[20px] py-[20px]">
      {/* Stats Cards */}
      <div className="w-full flex items-stretch gap-4 mb-5">
        <div className="flex-1 px-5 py-4 bg-ud-body rounded-[12px]">
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.91667 0.583336C2.27233 0.583336 1.75 1.10567 1.75 1.75V12.25C1.75 12.8943 2.27233 13.4167 2.91667 13.4167H11.0833C11.7277 13.4167 12.25 12.8943 12.25 12.25V4.08334C12.25 3.439 11.7277 2.91667 11.0833 2.91667H9.91667V1.75C9.91667 1.10567 9.39433 0.583336 8.75 0.583336H2.91667ZM9.91667 12.25V4.08334H11.0833V12.25H9.91667ZM5.25 9.91667H6.41667C6.73883 9.91667 7 10.1778 7 10.5V12.25H4.66667V10.5C4.66667 10.1778 4.92783 9.91667 5.25 9.91667ZM4.08333 4.375C4.08333 4.21392 4.21392 4.08334 4.375 4.08334H4.95833C5.11942 4.08334 5.25 4.21392 5.25 4.375V4.95834C5.25 5.11942 5.11942 5.25 4.95833 5.25H4.375C4.21392 5.25 4.08333 5.11942 4.08333 4.95834V4.375ZM6.70833 4.08334H7.29167C7.45275 4.08334 7.58333 4.21392 7.58333 4.375V4.95834C7.58333 5.11942 7.45275 5.25 7.29167 5.25H6.70833C6.54725 5.25 6.41667 5.11942 6.41667 4.95834V4.375C6.41667 4.21392 6.54725 4.08334 6.70833 4.08334ZM4.08333 6.70834C4.08333 6.54725 4.21392 6.41667 4.375 6.41667H4.95833C5.11942 6.41667 5.25 6.54725 5.25 6.70834V7.29167C5.25 7.45275 5.11942 7.58334 4.95833 7.58334H4.375C4.21392 7.58334 4.08333 7.45275 4.08333 7.29167V6.70834ZM6.70833 6.41667H7.29167C7.45275 6.41667 7.58333 6.54725 7.58333 6.70834V7.29167C7.58333 7.45275 7.45275 7.58334 7.29167 7.58334H6.70833C6.54725 7.58334 6.41667 7.45275 6.41667 7.29167V6.70834C6.41667 6.54725 6.54725 6.41667 6.70833 6.41667Z" fill="#336DF4"/>
                </svg>
                <div className="text-sm text-gray-500">总职场数</div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900 leading-none">{stats.total}</span>
                <span className="text-[14px] text-gray-900 leading-none relative bottom-[2px]">个</span>
              </div>
            </div>
          </div>
          <div className="flex-1 px-5 py-4 bg-ud-body rounded-[12px]">
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.01048 1.16695C7.56143 0.389174 6.4388 0.389173 5.98975 1.16695L0.432825 11.0836C-0.0162255 11.8614 0.545086 12.8336 1.44319 12.8336H12.5572C13.4553 12.8336 14.0166 11.8614 13.5675 11.0836L8.01048 1.16695ZM6.27089 4.8125C6.27089 4.57088 6.46677 4.375 6.70839 4.375H7.29173C7.53335 4.375 7.72923 4.57088 7.72923 4.8125V8.3125C7.72923 8.55412 7.53335 8.75 7.29173 8.75H6.70839C6.46677 8.75 6.27089 8.55412 6.27089 8.3125V4.8125ZM6.27089 9.77083C6.27089 9.52921 6.46677 9.33333 6.70839 9.33333H7.29173C7.53335 9.33333 7.72923 9.52921 7.72923 9.77083V10.3542C7.72923 10.5958 7.53335 10.7917 7.29173 10.7917H6.70839C6.46677 10.7917 6.27089 10.5958 6.27089 10.3542V9.77083Z" fill="#F54A45"/>
                </svg>
                <div className="text-sm text-gray-500">红灯/黄灯职场</div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900 leading-none">{stats.redYellowCount}</span>
                <span className="text-[14px] text-gray-900 leading-none relative bottom-[2px]">个</span>
              </div>
            </div>
          </div>
          <div className="flex-1 px-5 py-4 bg-ud-body rounded-[12px]">
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.66663 1.75C4.66663 1.42783 4.40546 1.16666 4.08329 1.16666C3.76113 1.16666 3.49996 1.42783 3.49996 1.75H2.33327C1.68894 1.75 1.16663 2.27233 1.16663 2.91666V11.6667C1.16663 12.311 1.68896 12.8333 2.33329 12.8333H6.85683C6.21638 12.0344 5.83329 11.0203 5.83329 9.91666C5.83329 7.33934 7.92263 5.25 10.5 5.25C11.35 5.25 12.1469 5.47725 12.8333 5.87431V2.91666C12.8333 2.27233 12.311 1.75 11.6666 1.75H10.5C10.5 1.42783 10.2388 1.16666 9.91663 1.16666C9.59446 1.16666 9.33329 1.42783 9.33329 1.75H4.66663ZM4.08329 7.58333C4.40546 7.58333 4.66663 7.8445 4.66663 8.16666V8.75C4.66663 9.07216 4.40546 9.33333 4.08329 9.33333H3.49996C3.17779 9.33333 2.91663 9.07216 2.91663 8.75V8.16666C2.91663 7.8445 3.17779 7.58333 3.49996 7.58333H4.08329ZM3.49996 4.66666H4.08329C4.40546 4.66666 4.66663 4.92783 4.66663 5.25V5.83333C4.66663 6.1555 4.40546 6.41666 4.08329 6.41666H3.49996C3.17779 6.41666 2.91663 6.1555 2.91663 5.83333V5.25C2.91663 4.92783 3.17779 4.66666 3.49996 4.66666ZM5.83329 5.25C5.83329 4.92783 6.09446 4.66666 6.41663 4.66666H6.99996C7.32212 4.66666 7.58329 4.92783 7.58329 5.25V5.83333C7.58329 6.1555 7.32212 6.41666 6.99996 6.41666H6.41663C6.09446 6.41666 5.83329 6.1555 5.83329 5.83333V5.25Z" fill="#FF811A"/>
                  <path d="M14 9.91666C14 11.8497 12.433 13.4167 10.5 13.4167C8.56696 13.4167 6.99996 11.8497 6.99996 9.91666C6.99996 7.98367 8.56696 6.41666 10.5 6.41666C12.433 6.41666 14 7.98367 14 9.91666ZM10.5 8.16666C10.1778 8.16666 9.91663 8.42783 9.91663 8.75V9.91666C9.91663 10.2388 10.1778 10.5 10.5 10.5H11.6666C11.9888 10.5 12.25 10.2388 12.25 9.91666C12.25 9.5945 11.9888 9.33333 11.6666 9.33333H11.0833V8.75C11.0833 8.42783 10.8221 8.16666 10.5 8.16666Z" fill="#FF811A"/>
                </svg>
                <div className="text-sm text-gray-500">存在逾期整改的职场</div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900 leading-none">{stats.hasOverdue}</span>
                <span className="text-[14px] text-gray-900 leading-none relative bottom-[2px]">个</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full bg-ud-body p-[20px] rounded-[12px]">
          {/* Filters */}
          <div className="filters flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-80">
              <Input
                placeholder="搜索职场名称"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<Search size={18} />}
              />
            </div>
            <Select
              value={cityFilter}
              onChange={(value) => setCityFilter(value as string | undefined)}
              placeholder="城市"
              allowClear
              style={{ width: 'fit-content' }}
              options={uniqueCities.map(city => ({ label: city, value: city }))}
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as string | undefined)}
              placeholder="安全状态"
              allowClear
              style={{ width: 'fit-content' }}
              options={[
                { label: '红灯', value: 'red' },
                { label: '黄灯', value: 'yellow' },
                { label: '绿灯', value: 'green' }
              ]}
            />
            <Select
              value={riskTypeFilter}
              onChange={(value) => setRiskTypeFilter(value as string | undefined)}
              placeholder="风险类型"
              allowClear
              style={{ width: 'fit-content' }}
              options={uniqueRiskTypes.map(riskType => ({ label: riskType, value: riskType }))}
            />
            <Select
              value={overdueFilter}
              onChange={(value) => setOverdueFilter(value as string | undefined)}
              placeholder="整改任务逾期"
              allowClear
              style={{ width: 'fit-content' }}
              options={[
                { label: '是', value: 'yes' },
                { label: '否', value: 'no' }
              ]}
            />
            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                清空
              </button>
            )}
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
              <>
                <Table
                  columns={columns}
                  dataSource={paginatedData}
                  pagination={false}
                  onChange={handleTableChange}
                  bordered={false}
                  scroll={{ x: 'max-content' }}
                />
                <div className="flex justify-end mt-[16px]">
                  <Pagination
                    total={tableDataSource.length}
                    current={currentPage}
                    pageSize={pageSize}
                    showSizeChanger
                    showQuickJumper
                    showTotal={total => `共 ${total} 条`}
                    onChange={handlePageChange}
                    onShowSizeChange={handlePageSizeChange}
                  />
                </div>
              </>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
