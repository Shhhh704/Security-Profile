import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag } from '@universe-design/react';
import { Users, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type {
  TabType, WorkplaceInfo, RectificationItem, RiskAssessmentData,
  SafetyIndicator, ManualCalibration, OfficeInfo, EmergencyResource, EmergencyResources,
} from '../types';
import { StatusBadge, SafetyStatusBadge, getAggregatedProgress } from '../components/StatusBadge';
import { WORKPLACES } from '../mocks/workplaces';
import { SAFETY_RISK_TYPES, RISK_TABS, RISK_TYPE_TO_RECTIFICATION_MAP, INITIAL_RISK_ASSESSMENT_DATA, INITIAL_OFFICE_INFO } from '../mocks/safetyData';
import { RECTIFICATION_DATA } from '../mocks/rectificationData';



export default function WorkplaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeRiskTab, setActiveRiskTab] = useState(0);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showStableDetails, setShowStableDetails] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [officeEditing, setOfficeEditing] = useState(false);
  const [hasEditPermission] = useState(true);
  const [selectedRectificationFilter, setSelectedRectificationFilter] = useState<string | null>(null);
  const [selectedRiskType, setSelectedRiskType] = useState<string | null>(null);
  const [selectedSafetyStatus, setSelectedSafetyStatus] = useState<'red' | 'yellow' | 'green' | null>(null);
  const [currentWorkplace, setCurrentWorkplace] = useState<WorkplaceInfo>(WORKPLACES[0]);
  const [isWorkplaceDrawerOpen, setIsWorkplaceDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskDetailDrawerOpen, setIsTaskDetailDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RectificationItem | null>(null);

  useEffect(() => {
    if (id) {
      const workplace = WORKPLACES.find(w => w.id === id);
      if (workplace) {
        setCurrentWorkplace(workplace);
      }
    }
  }, [id]);

  useEffect(() => {
    const rowsWithChildren = RECTIFICATION_DATA.filter(row => row.children && row.children.length > 0).map(row => row.id);
    setExpandedRows(rowsWithChildren);
  }, []);

  const [manualCalibrations, setManualCalibrations] = useState<Record<string, ManualCalibration>>({});
  const [isCalibrationDrawerOpen, setIsCalibrationDrawerOpen] = useState(false);
  const [calibratingIndicatorsByType, setCalibratingIndicatorsByType] = useState<Record<string, SafetyIndicator[]>>({});
  const [calibratingStatusByType, setCalibratingStatusByType] = useState<Record<string, 'green' | 'orange' | 'red'>>({});
  const [originalStatusByType, setOriginalStatusByType] = useState<Record<string, 'green' | 'orange' | 'red'>>({});
  const [calibratingReasonByType, setCalibratingReasonByType] = useState<Record<string, string>>({});

  const [officeInfo, setOfficeInfo] = useState<OfficeInfo>(INITIAL_OFFICE_INFO);
  const [isOfficeDrawerOpen, setIsOfficeDrawerOpen] = useState(false);
  const [editingOfficeInfo, setEditingOfficeInfo] = useState<OfficeInfo>(officeInfo);

  const contentRef = useRef<HTMLDivElement>(null);

  const calculateRectificationStats = () => {
    let completed = 0;
    let pending = 0;
    let overdue = 0;
    let accepting = 0;
    
    RECTIFICATION_DATA.forEach(item => {
      if (item.children) {
        item.children.forEach(child => {
          if (child.progress === 'completed') {
            completed++;
          } else if (child.progress === 'pending') {
            pending++;
          } else if (child.progress === 'overdue') {
            overdue++;
          } else if (child.progress === 'accepting') {
            accepting++;
          }
        });
      }
    });
    
    return {
      total: completed + pending + overdue + accepting,
      completed,
      pending,
      overdue,
      accepting
    };
  };

  const getLatestPlanDate = () => {
    let latestDate = '';
    
    RECTIFICATION_DATA.forEach(item => {
      if (item.children) {
        item.children.forEach(child => {
          if (child.planDate && child.planDate !== '-') {
            if (!latestDate || child.planDate > latestDate) {
              latestDate = child.planDate;
            }
          }
        });
      }
    });
    
    return latestDate || '待定';
  };

  const rectificationStats = calculateRectificationStats();
  const overviewRef = useRef<HTMLDivElement>(null);
  const safetyRef = useRef<HTMLDivElement>(null);
  const rectificationRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);
  const officeRef = useRef<HTMLDivElement>(null);

  const riskTabs = RISK_TABS;

  const [riskAssessmentData, setRiskAssessmentData] = useState<Record<string, RiskAssessmentData>>(INITIAL_RISK_ASSESSMENT_DATA);
  const [isRiskDrawerOpen, setIsRiskDrawerOpen] = useState(false);
  const [editingRiskTab, setEditingRiskTab] = useState<string>('');
  const [editingRiskFeatures, setEditingRiskFeatures] = useState('');
  const [editingProtectionMeasures, setEditingProtectionMeasures] = useState('');
  const [activeEditor, setActiveEditor] = useState<'riskFeatures' | 'protectionMeasures' | null>(null);
  const [expandedEmergencyTypes, setExpandedEmergencyTypes] = useState<string[]>([]);

  const riskTypeToRectificationTypeMap = RISK_TYPE_TO_RECTIFICATION_MAP;

  const toggleRow = (id: string) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getRectificationCountForRiskType = (riskTypeName: string): number => {
    const rectificationType = riskTypeToRectificationTypeMap[riskTypeName];
    if (!rectificationType) return 0;
    const rectificationItem = RECTIFICATION_DATA.find(item => item.type === rectificationType);
    return rectificationItem?.children?.length || 0;
  };

  const handleViewRectification = (riskTypeName: string) => {
    const rectificationType = riskTypeToRectificationTypeMap[riskTypeName];
    if (rectificationType) {
      setSelectedRectificationFilter(null);
      setActiveTab('rectification');
      setTimeout(() => {
        if (rectificationRef.current && contentRef.current) {
          const offset = rectificationRef.current.offsetTop - 200;
          contentRef.current.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const openTaskDetail = (task: RectificationItem) => {
    setSelectedTask(task);
    setIsTaskDetailDrawerOpen(true);
  };



  const openRiskDrawer = (tabName: string) => {
    const data = riskAssessmentData[tabName];
    setEditingRiskTab(tabName);
    setEditingRiskFeatures(data.riskFeatures);
    setEditingProtectionMeasures(data.protectionMeasures);
    setIsRiskDrawerOpen(true);
  };

  const saveRiskAssessment = () => {
    setRiskAssessmentData(prev => ({
      ...prev,
      [editingRiskTab]: {
        ...prev[editingRiskTab],
        riskFeatures: editingRiskFeatures,
        protectionMeasures: editingProtectionMeasures,
        updateTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '-')
      }
    }));
    setIsRiskDrawerOpen(false);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertLink = () => {
    const url = prompt('请输入链接地址：');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const openCalibrationDrawer = () => {
    const indicatorsByType: Record<string, SafetyIndicator[]> = {};
    const statusByType: Record<string, 'green' | 'orange' | 'red'> = {};
    const originalStatusByType: Record<string, 'green' | 'orange' | 'red'> = {};
    const reasonByType: Record<string, string> = {};
    SAFETY_RISK_TYPES.forEach(riskType => {
      const existingCalibration = manualCalibrations[riskType.id];
      indicatorsByType[riskType.id] = existingCalibration 
        ? [...existingCalibration.calibratedIndicators] 
        : [...riskType.indicators];
      
      if (existingCalibration) {
        statusByType[riskType.id] = existingCalibration.calibratedStatus;
        originalStatusByType[riskType.id] = existingCalibration.calibratedStatus;
        reasonByType[riskType.id] = existingCalibration.calibratedReason || '';
      } else {
        const hasRed = riskType.indicators.some(i => i.status === 'red');
        const hasOrange = riskType.indicators.some(i => i.status === 'orange');
        const originalStatus = hasRed ? 'red' : hasOrange ? 'orange' : 'green';
        statusByType[riskType.id] = originalStatus;
        originalStatusByType[riskType.id] = originalStatus;
        reasonByType[riskType.id] = '';
      }
    });
    setCalibratingIndicatorsByType(indicatorsByType);
    setCalibratingStatusByType(statusByType);
    setOriginalStatusByType(originalStatusByType);
    setCalibratingReasonByType(reasonByType);
    setIsCalibrationDrawerOpen(true);
  };

  const saveCalibration = () => {
    const newCalibrations: Record<string, ManualCalibration> = { ...manualCalibrations };
    const calibratedAt = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-');
    
    SAFETY_RISK_TYPES.forEach(riskType => {
      const indicators = calibratingIndicatorsByType[riskType.id];
      const status = calibratingStatusByType[riskType.id];
      const reason = calibratingReasonByType[riskType.id] || '';
      if (indicators && status) {
        newCalibrations[riskType.id] = {
          riskTypeId: riskType.id,
          calibratedStatus: status,
          calibratedIndicators: indicators,
          calibratedReason: reason,
          calibratedAt
        };
      }
    });
    
    setManualCalibrations(newCalibrations);
    setIsCalibrationDrawerOpen(false);
  };

  const deleteCalibration = (riskTypeId: string) => {
    if (confirm('确定要删除该风险类型的人工校准吗？')) {
      setManualCalibrations(prev => {
        const newCalibrations = { ...prev };
        delete newCalibrations[riskTypeId];
        return newCalibrations;
      });
    }
  };

  const updateRiskTypeStatus = (riskTypeId: string, status: 'green' | 'orange' | 'red') => {
    setCalibratingStatusByType(prev => ({
      ...prev,
      [riskTypeId]: status
    }));
  };

  const updateCalibrationReason = (riskTypeId: string, reason: string) => {
    setCalibratingReasonByType(prev => ({
      ...prev,
      [riskTypeId]: reason
    }));
  };

  const updateIndicatorStatus = (riskTypeId: string, index: number, status: 'green' | 'orange' | 'red') => {
    setCalibratingIndicatorsByType(prev => ({
      ...prev,
      [riskTypeId]: prev[riskTypeId].map((indicator, i) => 
        i === index ? { ...indicator, status } : indicator
      )
    }));
  };

  const updateIndicatorValue = (riskTypeId: string, index: number, value: string) => {
    setCalibratingIndicatorsByType(prev => ({
      ...prev,
      [riskTypeId]: prev[riskTypeId].map((indicator, i) => 
        i === index ? { ...indicator, value } : indicator
      )
    }));
  };

  const openOfficeDrawer = () => {
    setEditingOfficeInfo({ ...officeInfo });
    setIsOfficeDrawerOpen(true);
  };

  const saveOfficeInfo = () => {
    setOfficeInfo(editingOfficeInfo);
    setIsOfficeDrawerOpen(false);
  };

  const updateOfficeField = (field: keyof OfficeInfo, value: string) => {
    setEditingOfficeInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateId = (type: string) => `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addEmergencyResource = (type: keyof EmergencyResources) => {
    const newResource: EmergencyResource = {
      id: generateId(type),
      name: '',
      distance: '',
      address: '',
      phone: '',
      driveTime: ''
    };
    setEditingOfficeInfo(prev => ({
      ...prev,
      emergencyResources: {
        ...prev.emergencyResources,
        [type]: [...prev.emergencyResources[type], newResource]
      }
    }));
  };

  const removeEmergencyResource = (type: keyof EmergencyResources, id: string) => {
    setEditingOfficeInfo(prev => ({
      ...prev,
      emergencyResources: {
        ...prev.emergencyResources,
        [type]: prev.emergencyResources[type].filter(resource => resource.id !== id)
      }
    }));
  };

  const updateEmergencyResource = (type: keyof EmergencyResources, id: string, field: keyof EmergencyResource, value: string) => {
    setEditingOfficeInfo(prev => ({
      ...prev,
      emergencyResources: {
        ...prev.emergencyResources,
        [type]: prev.emergencyResources[type].map(resource => 
          resource.id === id ? { ...resource, [field]: value } : resource
        )
      }
    }));
  };

  const scrollToSection = (section: TabType) => {
    setActiveTab(section);
    const refs = { overview: overviewRef, rectification: rectificationRef, risk: riskRef, office: officeRef };
    const target = refs[section as keyof typeof refs]?.current;
    if (target && contentRef.current) {
      const offset = target.offsetTop - 200;
      contentRef.current.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  const handleRectificationTypeClick = (type: string) => {
    setSelectedRectificationFilter(type);
    setActiveTab('rectification');
    if (rectificationRef.current && contentRef.current) {
      const offset = rectificationRef.current.offsetTop - 200;
      contentRef.current.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  const getAvailableRiskTypes = () => {
    const types = new Set<string>();
    RECTIFICATION_DATA.forEach(item => {
      if (item.type) types.add(item.type);
      item.children?.forEach(child => {
        if (child.type) types.add(child.type);
      });
    });
    return Array.from(types);
  };



  const getFilteredRectificationData = () => {
    return RECTIFICATION_DATA.map(row => {
      let rowMatches = true;
      let hasMatchingChildren = true;

      if (selectedRectificationFilter) {
        hasMatchingChildren = row.children?.some(child => child.progress === selectedRectificationFilter) ?? false;
        rowMatches = row.progress === selectedRectificationFilter;
      }

      if (selectedRiskType) {
        const childTypeMatches = row.children?.some(child => child.type === selectedRiskType) ?? false;
        rowMatches = row.type === selectedRiskType || childTypeMatches;
      }

      if (selectedSafetyStatus) {
        const childStatusMatches = row.children?.some(child => child.status === selectedSafetyStatus) ?? false;
        rowMatches = row.status === selectedSafetyStatus || childStatusMatches;
      }

      if (rowMatches || hasMatchingChildren) {
        let filteredChildren = row.children;
        
        if (selectedRectificationFilter) {
          filteredChildren = filteredChildren?.filter(child => child.progress === selectedRectificationFilter);
        }
        
        if (selectedRiskType) {
          filteredChildren = filteredChildren?.filter(child => !child.type || child.type === selectedRiskType);
        }

        if (selectedSafetyStatus) {
          filteredChildren = filteredChildren?.filter(child => !child.status || child.status === selectedSafetyStatus);
        }

        return {
          ...row,
          children: filteredChildren,
          originalChildren: row.children
        };
      }
      return null;
    }).filter(Boolean) as (RectificationItem & { originalChildren?: RectificationItem[] })[];
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const scrollTop = contentRef.current.scrollTop;
      const refs = [
        { key: 'overview', ref: overviewRef },
        { key: 'rectification', ref: rectificationRef },
        { key: 'risk', ref: riskRef },
        { key: 'office', ref: officeRef }
      ];
      
      let currentSection: TabType = 'overview';
      
      for (let i = refs.length - 1; i >= 0; i--) {
        const { key, ref } = refs[i];
        if (ref.current) {
          const offsetTop = ref.current.offsetTop - 200;
          if (scrollTop >= offsetTop) {
            currentSection = key as TabType;
            break;
          }
        }
      }
      
      setActiveTab(currentSection);
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans relative">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm text-text-body">切换职场中...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-full overflow-hidden gap-0">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-bg-body" ref={contentRef} style={{ marginLeft: 0, paddingLeft: 0 }}>
            <div className="max-w-full pb-10 flex flex-col items-center">
              {/* Breadcrumb */}
              <div className="w-full max-w-[1000px] mx-auto mt-[12px] mb-[12px]">
                <div className="flex items-center text-sm text-text-caption">
                  <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')}>职场安全档案</span>
                  <span className="mx-2">/</span>
                  <span className="text-text-title font-medium">{currentWorkplace.name}</span>
                </div>
              </div>

              {/* Card 1: Workplace Info */}
              <div className="relative border border-divider-light bg-white sticky top-0 z-40 max-w-[1000px] w-full mx-auto rounded-[12px] overflow-hidden">
                <div className="relative z-10 p-4 pb-0">
                    <div className="flex items-center gap-4">
                       <img 
                         src={`https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=现代化商业写字楼建筑外观&image_size=landscape_4_3`}
                         alt={currentWorkplace.name}
                         className="w-[72px] h-[72px] object-cover rounded-lg shrink-0"
                       />
                      <div className="flex-1">
                      <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-text-title" style={{ fontSize: '24px' }}>{currentWorkplace.name}</h2>
                        <Tag
                          color="error"
                          size="small"
                          icon={
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.732 2c-.77-1.333-2.694-1.333-3.464 0L.742 19c-.77 1.334.192 3 1.732 3h19.052c1.54 0 2.502-1.666 1.733-3L13.732 2ZM10.75 8.25a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1-.75-.75v-6Zm0 8.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1-.75-.75v-1Z" fill="currentColor" />
                            </svg>
                          }
                        >
                          红灯
                        </Tag>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-2 mt-3">
                        <div className="text-text-caption text-sm">
                          地址：{currentWorkplace.address}
                        </div>
                        <div className="w-[1px] h-3 bg-divider mx-2" />
                        <div className="text-text-caption text-sm">
                          占地面积：{currentWorkplace.area} ㎡
                        </div>
                        <div className="w-[1px] h-3 bg-divider mx-2" />
                        <div className="text-text-caption text-sm">
                          出入口数量：{currentWorkplace.entranceCount} 个
                        </div>
                        <div className="w-[1px] h-3 bg-divider mx-2" />
                        <div className="text-text-caption text-sm">
                          可用工位数：{currentWorkplace.workstations} 个
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="mt-4">
                    <div className="flex gap-10">
                      {(['overview', 'rectification', 'risk', 'office'] as TabType[]).map((tab) => (
                        <div 
                          key={tab}
                          className={`relative py-3.5 text-sm cursor-pointer transition-colors ${
                            activeTab === tab ? 'text-primary font-medium' : 'text-text-title'
                          }`}
                          onClick={() => scrollToSection(tab)}
                        >
                          <span>{tab === 'overview' ? '安全概况' : tab === 'rectification' ? '整改进度' : tab === 'risk' ? '风险评估' : '职场信息'}</span>
                          {activeTab === tab && (
                            <motion.div 
                              layoutId="activeTab"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Safety Status & Rectification */}
              <div id="card-overview" ref={overviewRef} className="relative rounded-xl mt-3 border border-divider-light bg-white max-w-[1000px] w-full mx-auto">
                <div className="relative">

                  
                  {/* Warning Card */}
                  <div className="rounded-xl p-4 flex items-center relative" style={{ backgroundColor: '#FFFFFF', backgroundImage: 'url(./Vector-3226.png)', backgroundRepeat: 'no-repeat', backgroundPosition: 'left top', backgroundSize: 'auto', paddingBottom: '0px' }}>
                    {/* Safety Overview */}
                    <div className="flex-1 relative">
                      <div className="flex items-center justify-between" style={{ alignItems: 'center', minHeight: '36px' }}>
                        <div className="flex items-center">
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 20 20" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ display: 'inline-flex', verticalAlign: 'middle' }}
                          >
                            <path d="M11.4435 1.66707C10.802 0.555963 9.1982 0.555962 8.5567 1.66707L0.618234 15.8337C-0.0232666 16.9448 0.778607 18.3337 2.06161 18.3337H17.9387C19.2217 18.3337 20.0236 16.9448 19.3821 15.8337L11.4435 1.66707ZM8.95833 6.875C8.95833 6.52982 9.23816 6.25 9.58333 6.25H10.4167C10.7618 6.25 11.0417 6.52982 11.0417 6.875V11.875C11.0417 12.2202 10.7618 12.5 10.4167 12.5H9.58333C9.23816 12.5 8.95833 12.2202 8.95833 11.875V6.875ZM8.95833 13.9583C8.95833 13.6132 9.23816 13.3333 9.58333 13.3333H10.4167C10.7618 13.3333 11.0417 13.6132 11.0417 13.9583V14.7917C11.0417 15.1368 10.7618 15.4167 10.4167 15.4167H9.58333C9.23816 15.4167 8.95833 15.1368 8.95833 14.7917V13.9583Z" fill="#F54A45"/>
                          </svg>
                          <span className="text-lg text-red-600" style={{ marginLeft: '8px', lineHeight: '1', verticalAlign: 'middle', fontWeight: '700', fontSize: '16px' }}>2 项指标需关注</span>
                        </div>
                        <Button 
                          onClick={openCalibrationDrawer}
                          type="outlined"
                          color="primary"
                          size="small"
                          icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M10.2506 4.22599L10.2467 4.22234L10.4623 4.0067C10.6897 3.77932 10.6902 3.41081 10.4634 3.18283L8.46015 1.16901L8.45906 1.16792C8.23126 0.940119 7.86191 0.940119 7.63411 1.16792L7.22271 1.57932L7.22845 1.58509L1.16797 7.69221V9.91705C1.16797 10.2392 1.42914 10.5004 1.7513 10.5004H3.97615L10.2506 4.22599ZM8.34127 4.4529L7.16606 3.27768L8.03296 2.39383L9.21313 3.5802L8.34127 4.4529ZM6.3491 4.11064L7.51672 5.27827L3.48411 9.31476H3.48233L2.35361 8.18603V8.18425L6.3491 4.11064Z" fill="currentColor"/>
                              <path d="M1.7513 11.6671C1.42914 11.6671 1.16797 11.9282 1.16797 12.2504C1.16797 12.5726 1.42914 12.8337 1.7513 12.8337H12.2513C12.5735 12.8337 12.8346 12.5726 12.8346 12.2504C12.8346 11.9282 12.5735 11.6671 12.2513 11.6671H1.7513Z" fill="currentColor"/>
                            </svg>
                          }
                        >
                          校准
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Safety Status Section */}
                  <div id="card-safety" ref={safetyRef} className="p-4">

                    {/* Warning Group */}
                    <div className="rounded-lg p-0 mb-7">
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {SAFETY_RISK_TYPES.slice(0, 2).map((riskType, index) => {
                          const calibration = manualCalibrations[riskType.id];
                          const indicators = calibration ? calibration.calibratedIndicators : riskType.indicators;
                          const rectificationCount = getRectificationCountForRiskType(riskType.name);
                          return (
                            <div 
                              key={riskType.id} 
                              className="rounded-xl overflow-hidden border flex flex-col" 
                              style={{ borderColor: '#DEE0E3', borderWidth: '0.5px', minHeight: '160px' }}
                            >
                              <div className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="4" cy="4" r="4" fill={index === 1 ? '#FF811A' : '#E22E28'}/>
                                  </svg>
                                  <span className="text-sm font-semibold text-text-title">
                                    {riskType.name}{index === 0 && '（人工校准）'}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white p-3 pr-3 flex-1">
                                <div className="flex flex-col gap-2">
                                  {indicators.map((indicator, idx) => {
                                    return (
                                      <div key={idx} className="flex items-center text-xs gap-4 pr-3" style={{ paddingLeft: 0, paddingRight: 0 }}>
                                        <span className="text-text-caption flex-1 truncate">{indicator.label}</span>
                                        <div className="flex items-center gap-2 flex-shrink-0" style={{ width: '80px' }}>
                                          {indicator.status === 'green' ? (
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <circle cx="4" cy="4" r="4" fill="#32A645"/>
                                            </svg>
                                          ) : indicator.status === 'red' ? (
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <circle cx="4" cy="4" r="4" fill={index === 1 ? '#FF811A' : '#E22E28'}/>
                                            </svg>
                                          ) : (
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <circle cx="4" cy="4" r="4" fill="#E8921C"/>
                                            </svg>
                                          )}
                                          <span className="text-text-body font-medium whitespace-nowrap">
                                            {indicator.value}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              {(index === 0 || index === 2) && (
                                <div className="bg-[#f8f9fa] p-3 mx-3 rounded-lg mb-3">
                                  <p className="text-xs text-text-caption">
                                    校准原因：近期地铁改造,导致出入口人流激增,高峰期尾随情况加剧,但保安无法逐一甄别。
                                  </p>
                                </div>
                              )}
                              <div className="bg-white p-3 border-t flex items-center justify-between mt-auto" style={{ borderColor: '#f3f4f6' }}>
                                <span className="text-xs text-text-caption">{rectificationCount} 项整改任务</span>
                                <Button 
                                  type="text"
                                  color="primary"
                                  size="small"
                                  onClick={() => handleViewRectification(riskType.name)}
                                  style={{ padding: 0 }}
                                >
                                  查看
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Stable Group */}
                    <div className="rounded-lg p-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.833252 9.99998C0.833252 15.0625 4.93742 19.1666 9.99992 19.1666C15.0624 19.1666 19.1666 15.0625 19.1666 9.99998C19.1666 4.93748 15.0624 0.833313 9.99992 0.833313C4.93742 0.833313 0.833252 4.93748 0.833252 9.99998ZM13.162 7.7713C13.4847 7.44854 14.0095 7.4568 14.3322 7.77964C14.6548 8.10248 14.6631 8.62729 14.3402 8.94997C12.7678 10.5216 11.194 12.092 9.62369 13.6657C9.29783 13.9923 8.76869 13.9923 8.44274 13.6658C7.62218 12.8439 6.80034 12.0232 5.97887 11.2021C5.65654 10.88 5.66611 10.3557 5.98819 10.0333C6.31028 9.71087 6.83449 9.70124 7.15675 10.0235L9.03326 11.9L13.162 7.7713Z" fill="#32A645"/>
                          </svg>
                          <span className="text-sm font-medium" style={{ color: '#258832', fontSize: '16px' }}>5 项指标运行平稳</span>
                        </div>
                        <Button 
                          type="text"
                          color="primary"
                          onClick={() => setShowStableDetails(!showStableDetails)}
                          endIcon={<ChevronDown size={14} className={`transition-transform ${showStableDetails ? 'rotate-180' : ''}`} />}
                          style={{ padding: 0 }}
                        >
                          {showStableDetails ? '收起详情' : '查看详情'}
                        </Button>
                      </div>
                      {showStableDetails && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-3">
                          {SAFETY_RISK_TYPES.slice(2).map(riskType => {
                            const calibration = manualCalibrations[riskType.id];
                            const indicators = calibration ? calibration.calibratedIndicators : riskType.indicators;
                            return (
                              <div 
                                key={riskType.id} 
                                className="bg-bg-overlay rounded-xl p-3 flex flex-col border h-full"
                                style={{ borderColor: '#DEE0E3', borderWidth: '0.5px' }}
                              >
                                <div className="flex items-center">
                                  <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <circle cx="4" cy="4" r="4" fill="#32A645"/>
                                        </svg>
                                        <span className="text-sm font-medium text-text-title">
                                          {riskType.name}{calibration && '（人工校准）'}
                                        </span>
                                      </div>
                                  </div>
                                </div>
                                
                                <div className="mt-3 flex flex-col gap-2">
                                  {indicators.map((indicator, idx) => {
                                    return (
                                      <div key={idx} className="flex items-center text-xs gap-4 pr-3" style={{ paddingLeft: 0, paddingRight: 0 }}>
                                        <span className="text-text-caption flex-1 truncate">{indicator.label}</span>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                          <span className="text-text-body font-medium flex items-center gap-1.5" style={{ width: '80px' }}>
                                            {indicator.status === 'green' ? (
                                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="4" cy="4" r="4" fill="#32A645"/>
                                              </svg>
                                            ) : indicator.status === 'red' ? (
                                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="4" cy="4" r="4" fill="#E22E28"/>
                                              </svg>
                                            ) : (
                                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="4" cy="4" r="4" fill="#E8921C"/>
                                              </svg>
                                            )}
                                            <span className="whitespace-nowrap">{indicator.value}</span>
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards Container */}
              <div className="mt-3 flex flex-col gap-4 max-w-[1000px] w-full mx-auto px-0">
                {/* Rectification Progress Card */}
                <section id="card-rectification" ref={rectificationRef} className="bg-bg-overlay rounded-xl border border-divider-light overflow-hidden">
                  <div className="pt-4 px-4 pb-0">
                    <h3 className="text-base font-medium text-text-title">整改任务</h3>
                  </div>
                  {/* Status Tabs and Table Container */}
                  <div className="mx-4 mt-4 mb-4">
                    {/* Status Tabs - Segmented Controller */}
                    <div className="bg-gray-100 p-1 flex rounded-lg">
                      <button
                        onClick={() => setSelectedRectificationFilter(null)}
                        className={`flex-1 py-2 px-3 text-sm font-medium transition-all rounded-md ${
                          !selectedRectificationFilter
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        全部
                        <span className="ml-1 text-xs">{rectificationStats.total}</span>
                      </button>
                      <button
                        onClick={() => setSelectedRectificationFilter('pending')}
                        className={`flex-1 py-2 px-3 text-sm font-medium transition-all rounded-md ${
                          selectedRectificationFilter === 'pending'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        进行中
                        <span className="ml-1 text-xs">{rectificationStats.pending}</span>
                      </button>
                      <button
                        onClick={() => setSelectedRectificationFilter('accepting')}
                        className={`flex-1 py-2 px-3 text-sm font-medium transition-all rounded-md ${
                          selectedRectificationFilter === 'accepting'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        验收中
                        <span className="ml-1 text-xs">{rectificationStats.accepting}</span>
                      </button>
                      <button
                        onClick={() => setSelectedRectificationFilter('completed')}
                        className={`flex-1 py-2 px-3 text-sm font-medium transition-all rounded-md ${
                          selectedRectificationFilter === 'completed'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        已完成
                        <span className="ml-1 text-xs">{rectificationStats.completed}</span>
                      </button>
                      <button
                        onClick={() => setSelectedRectificationFilter('overdue')}
                        className={`flex-1 py-2 px-3 text-sm font-medium transition-all rounded-md ${
                          selectedRectificationFilter === 'overdue'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        已逾期
                        <span className={`ml-1 text-xs ${selectedRectificationFilter === 'overdue' ? 'text-red-600' : ''}`}>
                          {rectificationStats.overdue}
                        </span>
                      </button>
                    </div>



                    {/* Table */}
                    <div className="mt-4 pb-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-divider">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">任务名称</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">整改前安全状态</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider" style={{ maxWidth: '200px' }}>整改方案</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">整改状态</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">整改责任人</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">计划完成时间</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">整改完成时间</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredRectificationData().map(row => (
                            <React.Fragment key={row.id}>
                              <tr className="hover:bg-bg-content-base transition-colors border-b border-divider-light">
                                <td className="px-4 py-3 text-sm text-text-body">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      className={`w-5 h-5 flex items-center justify-center transition-transform ${expandedRows.includes(row.id) || selectedRectificationFilter ? 'rotate-90' : ''}`}
                                      onClick={() => toggleRow(row.id)}
                                    >
                                      <ChevronRight size={16} />
                                    </button>
                                    <Button 
                                      type="text"
                                      color="primary"
                                      onClick={() => openTaskDetail(row)}
                                      style={{ padding: 0 }}
                                    >
                                      {row.type}-{row.ticketNumber}
                                    </Button>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-text-body">
                                  <SafetyStatusBadge status={row.status} />
                                </td>
                                <td className="px-4 py-3 text-sm text-text-body" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}></td>
                                <td className="px-4 py-3 text-sm text-text-body">
                                  {row.originalChildren && row.originalChildren.length > 0 ? (
                                    <StatusBadge type={getAggregatedProgress(row.originalChildren)} />
                                  ) : (
                                    <StatusBadge type={row.progress} />
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-text-body"></td>
                                <td className="px-4 py-3 text-sm text-text-body"></td>
                                <td className="px-4 py-3 text-sm text-text-body"></td>
                              </tr>
                              <AnimatePresence>
                                {(expandedRows.includes(row.id) || selectedRectificationFilter) && row.children?.map(child => (
                                  <motion.tr 
                                    key={child.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-bg-content-base/50 border-b border-divider-light"
                                  >
                                    <td className="px-4 py-3 text-sm text-text-body pl-10">
                                      <Button 
                                        type="text"
                                        color="primary"
                                        onClick={() => openTaskDetail(child)}
                                        style={{ padding: 0 }}
                                      >
                                        {child.ticketNumber}
                                      </Button>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-body"></td>
                                    <td className="px-4 py-3 text-sm text-text-body" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.solution}</td>
                                    <td className="px-4 py-3 text-sm text-text-body"><StatusBadge type={child.progress} /></td>
                                    <td className="px-4 py-3 text-sm text-text-body">
                                      <div className="flex items-center gap-1.5">
                                        <Users size={14} className="text-text-caption" />
                                        {child.owner}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-body cursor-pointer hover:text-primary">{child.planDate}</td>
                                    <td className="px-4 py-3 text-sm text-text-body">
                                      {child.progress === 'overdue' ? '-' : (child.finishDate || '-')}
                                    </td>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                  </div>
                </section>

                {/* Risk Assessment Card */}
                <section id="card-risk" ref={riskRef} className="bg-bg-overlay rounded-xl border border-divider-light overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <h3 className="text-base font-medium text-text-title">风险评估</h3>
                    <Button 
                      onClick={() => openRiskDrawer(riskTabs[activeRiskTab])}
                      type="outlined"
                      color="primary"
                      size="small"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M10.2506 4.22599L10.2467 4.22234L10.4623 4.0067C10.6897 3.77932 10.6902 3.41081 10.4634 3.18283L8.46015 1.16901L8.45906 1.16792C8.23126 0.940119 7.86191 0.940119 7.63411 1.16792L7.22271 1.57932L7.22845 1.58509L1.16797 7.69221V9.91705C1.16797 10.2392 1.42914 10.5004 1.7513 10.5004H3.97615L10.2506 4.22599ZM8.34127 4.4529L7.16606 3.27768L8.03296 2.39383L9.21313 3.5802L8.34127 4.4529ZM6.3491 4.11064L7.51672 5.27827L3.48411 9.31476H3.48233L2.35361 8.18603V8.18425L6.3491 4.11064Z" fill="currentColor"/>
                          <path d="M1.7513 11.6671C1.42914 11.6671 1.16797 11.9282 1.16797 12.2504C1.16797 12.5726 1.42914 12.8337 1.7513 12.8337H12.2513C12.5735 12.8337 12.8346 12.5726 12.8346 12.2504C12.8346 11.9282 12.5735 11.6671 12.2513 11.6671H1.7513Z" fill="currentColor"/>
                        </svg>
                      }
                    >
                      编辑
                    </Button>
                  </div>

                  {/* AI Summary */}
                  <div className="mx-4 p-3 border border-stroke-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.99959 0.292969C7.20424 0.292969 7.37305 0.453063 7.39893 0.658691C7.46321 1.17037 7.58212 1.66502 7.74984 2.13582L7.98397 2.71061C8.66753 4.19618 9.85328 5.39692 11.3199 6.08927L11.8873 6.32682L12.0724 6.3912C12.5076 6.53602 12.9619 6.63812 13.4305 6.69255C13.5856 6.71056 13.7062 6.84142 13.7062 6.99959L13.7005 7.0577C13.6752 7.18879 13.5661 7.29089 13.4305 7.30664L13.3582 7.31576C12.8485 7.3805 12.356 7.50118 11.8873 7.67236L11.3199 7.90991C9.85328 8.60227 8.66753 9.803 7.98397 11.2886L7.74984 11.8634C7.58212 12.3342 7.46321 12.8288 7.39893 13.3405L7.38298 13.4151C7.33059 13.5836 7.17872 13.7062 6.99959 13.7062L6.92497 13.6988C6.77931 13.6702 6.66114 13.5596 6.61621 13.4151L6.60026 13.3405C6.53598 12.8288 6.41707 12.3342 6.24935 11.8634L6.01522 11.2886C5.33166 9.803 4.1459 8.60227 2.67928 7.90991L2.1119 7.67236C1.6824 7.5155 1.23299 7.4008 0.768636 7.33285L0.568685 7.30664C0.413555 7.28863 0.292969 7.15777 0.292969 6.99959C0.292969 6.84142 0.413555 6.71056 0.568685 6.69255C1.03731 6.63812 1.49161 6.53602 1.92676 6.3912L2.1119 6.32682L2.67928 6.08927C4.1459 5.39692 5.33166 4.19618 6.01522 2.71061L6.24935 2.13582C6.41707 1.66502 6.53598 1.17037 6.60026 0.658691C6.62614 0.453063 6.79495 0.292969 6.99959 0.292969Z" fill="url(#paint0_linear_ai_summary)"/>
                        <defs>
                          <linearGradient id="paint0_linear_ai_summary" x1="3.93695" y1="9.62466" x2="10.062" y2="3.49966" gradientUnits="userSpaceOnUse">
                            <stop offset="0.48" stopColor="#3F77FB"/>
                            <stop offset="1" stopColor="#8A72FE"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="text-sm font-bold text-text-title">AI 总结</span>
                    </div>
                    <p className="text-sm text-text-body leading-relaxed">
                      大钟寺办公区当前呈现开放园区与商业混合运营特征，整体风险主要集中在出入、消防、客诉和人身安全四类：出入口多且部分临近商业区，外部人员误入、尾随和强行闯入压力较高；高层带中庭、地下餐饮和车库充电场景并存，消防风险叠加、处置容错低；因外部被识别为 "总部"，客诉、滞留和舆情暴露相对突出；外围停车及接驳点分散，周边突发医疗事件响应时效仍偏弱。
                    </p>
                    <p className="text-sm text-text-body leading-relaxed mt-3">
                      目前已形成人防、技防、联动处置并行的基础防护体系：出入侧配置门禁闸机、3472 路监控及固定岗 / 巡岗，客诉侧配有兼职客诉岗、防暴力量和舆情联动机制，消防侧具备 24 小时中控、微消队和较完整消防系统，SOS 侧已部署 AED/FAK 及持证急救安保。当前更需关注无值守及临商业出入口的持续补强，以及园区外围医疗响应效率提升。
                    </p>
                  </div>

                  {/* Master-Detail Layout */}
                  <div className="flex">
                    {/* Left Sidebar (Master) */}
                    <div className="w-[160px] shrink-0 border-r border-divider-light flex flex-col py-4">
                      {riskTabs.map((tab, idx) => (
                        <div 
                          key={tab}
                          onClick={() => setActiveRiskTab(idx)}
                          className={`pl-5 pr-3 py-3 text-sm cursor-pointer transition-all flex items-center relative ${
                            activeRiskTab === idx 
                              ? 'bg-bg-overlay/50 text-primary font-bold border-y border-l border-divider-light rounded-l-xl -mr-[1px]' 
                              : 'text-text-body hover:text-text-body border-y border-l border-transparent'
                          }`}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>

                    {/* Right Content (Detail) */}
                    <div className="flex-1 p-8">
                      {(() => {
                        const currentTab = riskTabs[activeRiskTab];
                        const data = riskAssessmentData[currentTab];
                        if (!data) return null;
                        return (
                          <div>
                            <h4 className="text-base font-medium text-text-title mb-2">{data.name}</h4>
                            <p className="text-sm text-text-caption mb-6">更新时间：{data.updateTime}</p>

                            <div className="mb-8">
                              <h5 className="text-sm font-medium text-text-title mb-3">风险特征</h5>
                              <div dangerouslySetInnerHTML={{ __html: data.riskFeatures }} />
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-text-title mb-3">防护手段</h5>
                              <div dangerouslySetInnerHTML={{ __html: data.protectionMeasures }} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </section>

                {/* Office Info Card */}
                <section id="card-office" ref={officeRef} className="bg-bg-overlay rounded-xl border border-divider-light overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-base font-medium text-text-title">职场信息</h3>
                      {hasEditPermission && (
                        <Button 
                          onClick={openOfficeDrawer}
                          type="outlined"
                          color="primary"
                          size="small"
                          icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M10.2506 4.22599L10.2467 4.22234L10.4623 4.0067C10.6897 3.77932 10.6902 3.41081 10.4634 3.18283L8.46015 1.16901L8.45906 1.16792C8.23126 0.940119 7.86191 0.940119 7.63411 1.16792L7.22271 1.57932L7.22845 1.58509L1.16797 7.69221V9.91705C1.16797 10.2392 1.42914 10.5004 1.7513 10.5004H3.97615L10.2506 4.22599ZM8.34127 4.4529L7.16606 3.27768L8.03296 2.39383L9.21313 3.5802L8.34127 4.4529ZM6.3491 4.11064L7.51672 5.27827L3.48411 9.31476H3.48233L2.35361 8.18603V8.18425L6.3491 4.11064Z" fill="currentColor"/>
                              <path d="M1.7513 11.6671C1.42914 11.6671 1.16797 11.9282 1.16797 12.2504C1.16797 12.5726 1.42914 12.8337 1.7513 12.8337H12.2513C12.5735 12.8337 12.8346 12.5726 12.8346 12.2504C12.8346 11.9282 12.5735 11.6671 12.2513 11.6671H1.7513Z" fill="currentColor"/>
                            </svg>
                          }
                        >
                          编辑
                        </Button>
                      )}
                    </div>
                    
                    <div className="mb-7">
                      <h4 className="text-sm font-medium text-text-title mb-4">基础信息</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-text-caption mb-1">建成年份</p>
                            <p className="text-sm text-text-title">{officeInfo.builtYear} 年建成</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-caption mb-1">办公室入住时间</p>
                            <p className="text-sm text-text-title">{officeInfo.moveInDate} 入住</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-caption mb-1">自持园区/租赁职场</p>
                            <p className="text-sm text-text-title">{officeInfo.propertyType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-caption mb-1">用途</p>
                            <p className="text-sm text-text-title">{officeInfo.usage}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-text-caption mb-1">租赁面积</p>
                            <p className="text-sm text-text-title">{officeInfo.rentalArea} m²</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-caption mb-1">大物业面积</p>
                            <p className="text-sm text-text-title">{officeInfo.totalArea} m²</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-caption mb-1">楼栋/楼层说明</p>
                            <p className="text-sm text-text-title">{officeInfo.buildingInfo}</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-caption mb-1">出入口数</p>
                            <p className="text-sm text-text-title">{officeInfo.entranceCount} 个出入口</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-text-caption mb-1">是否挂有字节Logo</p>
                            <p className="text-sm text-text-title">{officeInfo.hasByteLogo}</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-caption mb-1">扩租/缩租/退租规划</p>
                            <p className="text-sm text-text-title">{officeInfo.expansionPlan}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-7">
                      <h4 className="text-sm font-medium text-text-title mb-4">人员分布</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-text-caption mb-1">可用工位数</p>
                          <p className="text-sm text-text-title">12,345 个可用工位</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-caption mb-1">月均访客数</p>
                          <p className="text-sm text-text-title">8,560 人</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-caption mb-1">主要入住一级部门</p>
                          <div className="group relative">
                            <p className="text-sm text-text-title">效率与安全部、商业化、基础架构</p>
                            <div className="hidden group-hover:block absolute left-0 top-full mt-1 p-3 bg-white border border-divider-light rounded-lg shadow-lg z-20 min-w-[200px]">
                              <p className="text-sm text-text-caption mb-2">全量入驻一级部门：</p>
                              <div className="space-y-1">
                                <p className="text-xs text-text-body">效率与安全部：4,500个工位</p>
                                <p className="text-xs text-text-body">商业化：3,200个工位</p>
                                <p className="text-xs text-text-body">基础架构：2,100个工位</p>
                                <p className="text-xs text-text-body">抖音电商：1,545个工位</p>
                                <p className="text-xs text-text-body">火山引擎：1,000个工位</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-7">
                      <h4 className="text-sm font-medium text-text-title mb-4">特殊空间</h4>
                      <div className="flex flex-wrap gap-2">
                        {['实验室', 'EMDF机房', 'IDF机房', '开火厨房', '储藏室'].map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary/10 text-text-body rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-text-title mb-4">应急资源</h4>
                      
                      {[
                        { key: 'fireStations', label: '周边消防队', data: officeInfo.emergencyResources.fireStations },
                        { key: 'hospitals', label: '周边医院', data: officeInfo.emergencyResources.hospitals.slice(0, 3) },
                        { key: 'policeStations', label: '周边派出所', data: officeInfo.emergencyResources.policeStations.slice(0, 2) }
                      ].map(({ key, label, data }) => {
                        const isExpanded = expandedEmergencyTypes.includes(key);
                        return (
                          <div key={key} className="mb-4">
                            <button
                              onClick={() => setExpandedEmergencyTypes(prev => 
                                prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                              )}
                              className="w-full flex items-center justify-between p-3 bg-bg-content-base rounded-lg hover:bg-bg-overlay transition-colors"
                            >
                              <span className="text-sm font-medium text-text-title">{label}</span>
                              <ChevronDown 
                                size={16} 
                                className={`text-text-body transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              />
                            </button>
                            {isExpanded && (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {data.map(item => (
                                  <div key={item.id} className="border border-divider-light rounded-lg overflow-hidden">
                                    <div className="bg-bg-content-base px-3 py-3 border-b border-divider-light">
                                      <h6 className="text-sm font-bold text-text-title">{item.name}</h6>
                                    </div>
                                    <div className="p-3 space-y-2">
                                      <div className="flex items-start gap-2">
                                        <span className="text-sm text-text-caption shrink-0">距离：</span>
                                        <span className="text-sm text-text-body">{item.distance} km</span>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <span className="text-sm text-text-caption shrink-0">地址：</span>
                                        <span className="text-sm text-text-body">{item.address}</span>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <span className="text-sm text-text-caption shrink-0">电话：</span>
                                        <span className="text-sm text-text-body">{item.phone}</span>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <span className="text-sm text-text-caption shrink-0">车程：</span>
                                        <span className="text-sm text-text-body">预估车程 {item.driveTime} 分钟</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>

        {/* Risk Assessment Drawer */}
        <AnimatePresence>
          {isRiskDrawerOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsRiskDrawerOpen(false)}
                className="fixed inset-0 bg-black/50 z-40"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-divider-light">
                  <h2 className="text-lg font-bold text-text-title">编辑风险评估</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRiskDrawerOpen(false)}
                      className="px-4 py-2 text-sm text-text-body hover:bg-divider-light rounded-lg transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={saveRiskAssessment}
                      className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      style={{ color: '#ffffff' }}
                    >
                      保存
                    </button>
                  </div>
                </div>

                {/* Risk Type Selector */}
                <div className="p-4 border-b border-divider-light">
                  <label className="text-sm font-medium text-text-title mb-2 block">选择风险类型</label>
                  <div className="flex flex-wrap gap-2">
                    {riskTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          const data = riskAssessmentData[tab];
                          setEditingRiskTab(tab);
                          setEditingRiskFeatures(data.riskFeatures);
                          setEditingProtectionMeasures(data.protectionMeasures);
                        }}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          editingRiskTab === tab
                            ? 'text-[#1454f0]'
                            : 'bg-bg-content-base text-text-body hover:bg-divider-light'
                        }`}
                        style={editingRiskTab === tab ? { backgroundColor: '#e0e9ff', color: '#1454f0' } : undefined}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Risk Features Editor */}
                  <div>
                    <h3 className="text-sm font-bold text-text-title mb-3">风险特征</h3>
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-1 p-2 bg-bg-content-base rounded-t-lg border border-divider-light border-b-0">
                      <button
                        onClick={() => execCommand('bold')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="加粗"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => execCommand('italic')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="斜体"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="19" y1="4" x2="10" y2="4" />
                          <line x1="14" y1="20" x2="5" y2="20" />
                          <line x1="15" y1="4" x2="9" y2="20" />
                        </svg>
                      </button>
                      <button
                        onClick={() => execCommand('underline')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="下划线"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
                          <line x1="4" y1="21" x2="20" y2="21" />
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-divider-light mx-1" />
                      <button
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="无序列表"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="8" y1="6" x2="21" y2="6" />
                          <line x1="8" y1="12" x2="21" y2="12" />
                          <line x1="8" y1="18" x2="21" y2="18" />
                          <line x1="3" y1="6" x2="3.01" y2="6" />
                          <line x1="3" y1="12" x2="3.01" y2="12" />
                          <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                      </button>
                      <button
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="有序列表"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="10" y1="6" x2="21" y2="6" />
                          <line x1="10" y1="12" x2="21" y2="12" />
                          <line x1="10" y1="18" x2="21" y2="18" />
                          <path d="M4 6h1v4" />
                          <path d="M4 10h2" />
                          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-divider-light mx-1" />
                      <button
                        onClick={insertLink}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="插入链接"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </button>
                    </div>
                    {/* Editor */}
                    <div
                      contentEditable
                      dangerouslySetInnerHTML={{ __html: editingRiskFeatures }}
                      onInput={(e) => setEditingRiskFeatures(e.currentTarget.innerHTML)}
                      onFocus={() => setActiveEditor('riskFeatures')}
                      className="min-h-[200px] p-4 border border-divider-light rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Protection Measures Editor */}
                  <div>
                    <h3 className="text-sm font-bold text-text-title mb-3">防护手段</h3>
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-1 p-2 bg-bg-content-base rounded-t-lg border border-divider-light border-b-0">
                      <button
                        onClick={() => execCommand('bold')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="加粗"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => execCommand('italic')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="斜体"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="19" y1="4" x2="10" y2="4" />
                          <line x1="14" y1="20" x2="5" y2="20" />
                          <line x1="15" y1="4" x2="9" y2="20" />
                        </svg>
                      </button>
                      <button
                        onClick={() => execCommand('underline')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="下划线"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
                          <line x1="4" y1="21" x2="20" y2="21" />
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-divider-light mx-1" />
                      <button
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="无序列表"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="8" y1="6" x2="21" y2="6" />
                          <line x1="8" y1="12" x2="21" y2="12" />
                          <line x1="8" y1="18" x2="21" y2="18" />
                          <line x1="3" y1="6" x2="3.01" y2="6" />
                          <line x1="3" y1="12" x2="3.01" y2="12" />
                          <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                      </button>
                      <button
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="有序列表"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="10" y1="6" x2="21" y2="6" />
                          <line x1="10" y1="12" x2="21" y2="12" />
                          <line x1="10" y1="18" x2="21" y2="18" />
                          <path d="M4 6h1v4" />
                          <path d="M4 10h2" />
                          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-divider-light mx-1" />
                      <button
                        onClick={insertLink}
                        className="p-2 hover:bg-divider-light rounded transition-colors"
                        title="插入链接"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </button>
                    </div>
                    {/* Editor */}
                    <div
                      contentEditable
                      dangerouslySetInnerHTML={{ __html: editingProtectionMeasures }}
                      onInput={(e) => setEditingProtectionMeasures(e.currentTarget.innerHTML)}
                      onFocus={() => setActiveEditor('protectionMeasures')}
                      className="min-h-[200px] p-4 border border-divider-light rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Calibration Drawer */}
        <AnimatePresence>
          {isCalibrationDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCalibrationDrawerOpen(false)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-bg-overlay z-50 shadow-xl flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-divider-light">
                  <h2 className="text-lg font-bold text-text-title">安全状态校准</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCalibrationDrawerOpen(false)}
                      className="px-4 py-2 text-sm text-text-body hover:text-text-title transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={saveCalibration}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                      {SAFETY_RISK_TYPES.map((riskType) => {
                        const currentCalibration = manualCalibrations[riskType.id];
                        const status = calibratingStatusByType[riskType.id] || 'green';
                        const originalStatus = originalStatusByType[riskType.id] || 'green';
                        const reason = calibratingReasonByType[riskType.id] || '';
                        const indicators = calibratingIndicatorsByType[riskType.id] || [];
                        const hasStatusChanged = status !== originalStatus;
                        
                        const statusColor = status === 'red' ? '#E22E28' : status === 'orange' ? '#E8921C' : '#34A853';
                        const cardBgColor = status === 'red' ? 'bg-red-50' : status === 'orange' ? 'bg-yellow-50' : 'bg-green-50';
                        const titleColor = status === 'red' ? 'text-red-600' : status === 'orange' ? 'text-yellow-600' : 'text-text-title';
                        
                        return (
                          <div key={riskType.id} className="rounded-xl overflow-hidden transition-opacity border" style={{ borderColor: '#DEE0E3', borderWidth: '0.5px' }}>
                            {currentCalibration && (
                              <div className="bg-tag-green-bg/30 border-b border-tag-green-bg p-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2 py-0.5 bg-tag-green-bg text-tag-green-text text-xs rounded-full">
                                      人工校准
                                    </span>
                                    <span className="text-xs text-text-caption">校准时间：{currentCalibration.calibratedAt}</span>
                                  </div>
                                  <button
                                    onClick={() => deleteCalibration(riskType.id)}
                                    className="text-xs text-red-500 hover:text-red-600 transition-colors"
                                  >
                                    删除
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className={currentCalibration ? 'py-2 px-3' : 'py-2 px-3'}>
                              <div className="flex items-center gap-2 mb-2">
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="4" cy="4" r="4" fill={statusColor}/>
                                </svg>
                                <span className={`text-sm font-semibold ${titleColor}`}>
                                  {riskType.name}{currentCalibration && '（人工校准）'}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateRiskTypeStatus(riskType.id, 'green')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                      status === 'green'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white border border-gray-200 text-text-body hover:border-green-500 hover:text-green-500'
                                    }`}
                                  >
                                    绿灯
                                  </button>
                                  <button
                                    onClick={() => updateRiskTypeStatus(riskType.id, 'orange')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                      status === 'orange'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-white border border-gray-200 text-text-body hover:border-yellow-500 hover:text-yellow-500'
                                    }`}
                                  >
                                    黄灯
                                  </button>
                                  <button
                                    onClick={() => updateRiskTypeStatus(riskType.id, 'red')}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                      status === 'red'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white border border-gray-200 text-text-body hover:border-red-500 hover:text-red-500'
                                    }`}
                                  >
                                    红灯
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-3 pr-3">
                              {(hasStatusChanged || currentCalibration) && (
                                <div className="mb-3">
                                  <label className="text-xs font-medium text-text-title mb-1 block">校准理由</label>
                                  <textarea
                                    value={reason}
                                    onChange={(e) => updateCalibrationReason(riskType.id, e.target.value)}
                                    className="w-full px-2 py-1.5 border border-divider-light rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    placeholder="请输入校准理由..."
                                    rows={2}
                                  />
                                </div>
                              )}
                              {currentCalibration && currentCalibration.calibratedReason && (
                                <div className="mb-3 p-2 bg-tag-green-bg/20 rounded-lg">
                                  <p className="text-xs text-text-caption">
                                    <span className="font-medium text-tag-green-text">已保存的理由：</span>
                                    {currentCalibration.calibratedReason}
                                  </p>
                                </div>
                              )}
                              <div className="flex flex-col gap-2">
                                {indicators.map((indicator, idx) => {
                                  return (
                                    <div key={idx} className="flex items-center text-xs gap-4 pr-3" style={{ paddingLeft: 0, paddingRight: 0 }}>
                                      <span className="text-text-caption flex-1">{indicator.label}</span>
                                      <div className="flex items-center gap-2" style={{ paddingLeft: 0, paddingRight: 0, width: '80px' }}>
                                        {indicator.status === 'green' ? (
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tag-green-text">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="m9 12 2 2 4-4"></path>
                                          </svg>
                                        ) : indicator.status === 'red' ? (
                                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.42188 1.41699C6.66252 1.00087 7.2406 0.974752 7.52344 1.33887L7.57617 1.41699L13.1299 11.3281L13.1748 11.418C13.3494 11.8453 13.0369 12.334 12.5557 12.334H1.44141C0.960349 12.3337 0.648549 11.8452 0.823242 11.418L0.864258 11.334L0.867188 11.3281L6.42188 1.41699Z" stroke="#E22E28"/>
                                            <path d="M6.32812 5.03425C6.32812 4.812 6.50829 4.63184 6.73054 4.63184H7.26709C7.48934 4.63184 7.66951 4.812 7.66951 5.03425V8.25357C7.66951 8.47582 7.48934 8.65598 7.26709 8.65598H6.73054C6.50829 8.65598 6.32812 8.47582 6.32812 8.25357V5.03425Z" fill="#E22E28"/>
                                            <path d="M6.32812 9.59495C6.32812 9.3727 6.50829 9.19254 6.73054 9.19254H7.26709C7.48934 9.19254 7.66951 9.3727 7.66951 9.59495V10.1315C7.66951 10.3538 7.48934 10.5339 7.26709 10.5339H6.73054C6.50829 10.5339 6.32812 10.3538 6.32812 10.1315V9.59495Z" fill="#E22E28"/>
                                          </svg>
                                        ) : (
                                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.42188 1.41699C6.66252 1.00087 7.2406 0.974752 7.52344 1.33887L7.57617 1.41699L13.1299 11.3281L13.1748 11.418C13.3494 11.8453 13.0369 12.334 12.5557 12.334H1.44141C0.960349 12.3337 0.648549 11.8452 0.823242 11.418L0.864258 11.334L0.867188 11.3281L6.42188 1.41699Z" stroke="#E22E28"/>
                                            <path d="M6.32812 5.03425C6.32812 4.812 6.50829 4.63184 6.73054 4.63184H7.26709C7.48934 4.63184 7.66951 4.812 7.66951 5.03425V8.25357C7.66951 8.47582 7.48934 8.65598 7.26709 8.65598H6.73054C6.50829 8.65598 6.32812 8.47582 6.32812 8.25357V5.03425Z" fill="#E22E28"/>
                                            <path d="M6.32812 9.59495C6.32812 9.3727 6.50829 9.19254 6.73054 9.19254H7.26709C7.48934 9.19254 7.66951 9.3727 7.66951 9.59495V10.1315C7.66951 10.3538 7.48934 10.5339 7.26709 10.5339H6.73054C6.50829 10.5339 6.32812 10.3538 6.32812 10.1315V9.59495Z" fill="#E22E28"/>
                                          </svg>
                                        )}
                                        <span className={indicator.status === 'green' ? 'text-text-title font-medium' : indicator.status === 'orange' ? 'font-medium' : 'text-red-600 font-medium'} style={{ color: indicator.status === 'orange' ? '#E22E28' : undefined }}>
                                          {indicator.value}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Office Info Drawer */}
        <AnimatePresence>
          {isOfficeDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOfficeDrawerOpen(false)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-bg-overlay z-50 shadow-xl flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-divider-light">
                  <h2 className="text-lg font-bold text-text-title">编辑职场信息</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsOfficeDrawerOpen(false)}
                      className="px-4 py-2 text-sm text-text-body hover:text-text-title transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={saveOfficeInfo}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mb-7">
                    <h3 className="text-base font-bold text-text-title mb-4">基础信息</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">建成年份</label>
                        <input
                          type="text"
                          value={editingOfficeInfo.builtYear}
                          onChange={(e) => updateOfficeField('builtYear', e.target.value)}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="如2015"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">办公室入住时间</label>
                        <input
                          type="text"
                          value={editingOfficeInfo.moveInDate}
                          onChange={(e) => updateOfficeField('moveInDate', e.target.value)}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="如2018-05-20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">自持园区/租赁职场</label>
                        <select
                          value={editingOfficeInfo.propertyType}
                          onChange={(e) => updateOfficeField('propertyType', e.target.value as '自持' | '租赁')}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="自持">自持</option>
                          <option value="租赁">租赁</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">用途</label>
                        <select
                          value={editingOfficeInfo.usage}
                          onChange={(e) => updateOfficeField('usage', e.target.value as '办公' | '商业' | '办公+商业')}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="办公">办公</option>
                          <option value="商业">商业</option>
                          <option value="办公+商业">办公+商业</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">租赁面积 (m²)</label>
                        <input
                          type="text"
                          value={editingOfficeInfo.rentalArea}
                          onChange={(e) => updateOfficeField('rentalArea', e.target.value)}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="如32,250"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">大物业面积 (m²)</label>
                        <input
                          type="text"
                          value={editingOfficeInfo.totalArea}
                          onChange={(e) => updateOfficeField('totalArea', e.target.value)}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="如45,000"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">楼栋/楼层说明</label>
                        <input
                          type="text"
                          value={editingOfficeInfo.buildingInfo}
                          onChange={(e) => updateOfficeField('buildingInfo', e.target.value)}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="如C座1-20层，D座1-18层"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">出入口数</label>
                        <input
                          type="text"
                          value={editingOfficeInfo.entranceCount}
                          onChange={(e) => updateOfficeField('entranceCount', e.target.value)}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="如199"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">是否挂有字节Logo</label>
                        <select
                          value={editingOfficeInfo.hasByteLogo}
                          onChange={(e) => updateOfficeField('hasByteLogo', e.target.value as '是' | '否')}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="是">是</option>
                          <option value="否">否</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">扩租/缩租/退租规划</label>
                        <input
                          type="text"
                          value={editingOfficeInfo.expansionPlan}
                          onChange={(e) => updateOfficeField('expansionPlan', e.target.value)}
                          className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="如2026年Q3计划扩租B座5-8层"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-text-title mb-4 pt-7">应急资源</h3>
                      
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-text-title">周边消防队</h4>
                          <Button
                            onClick={() => addEmergencyResource('fireStations')}
                            type="outlined"
                            color="primary"
                            size="small"
                            icon={
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 1.1665C7.3866 1.1665 7.7 1.4799 7.7 1.8665V6.30017H12.1337C12.5203 6.30017 12.8337 6.61357 12.8337 7.00017C12.8337 7.38677 12.5203 7.70017 12.1337 7.70017H7.7V12.1338C7.7 12.5204 7.3866 12.8338 7 12.8338C6.6134 12.8338 6.3 12.5204 6.3 12.1338V7.70017H1.86633C1.47973 7.70017 1.16633 7.38677 1.16633 7.00017C1.16633 6.61357 1.47973 6.30017 1.86633 6.30017H6.3V1.8665C6.3 1.4799 6.6134 1.1665 7 1.1665Z" fill="currentColor"/>
                              </svg>
                            }
                          >
                            新增
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {editingOfficeInfo.emergencyResources.fireStations.map((station, index) => (
                            <div key={station.id} className="border border-divider-light rounded-lg p-4 relative">
                              <button
                                onClick={() => removeEmergencyResource('fireStations', station.id)}
                                className="absolute top-3 right-3 p-1 text-text-caption hover:text-red-500 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M12.3334 4.00008L11.3934 13.0667C11.3534 13.4601 11.0134 13.7467 10.6201 13.7467H5.38008C4.98675 13.7467 4.64675 13.4601 4.60675 13.0667L3.66675 4.00008" stroke="#666F80" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M1.3335 4H14.6668" stroke="#666F80" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M6.00016 4V2.66667C6.00016 2.31305 6.14064 1.97391 6.3907 1.72386C6.64075 1.4738 6.97989 1.33333 7.3335 1.33333H8.66683C9.02045 1.33333 9.35959 1.4738 9.60964 1.72386C9.8597 1.97391 10.0002 2.31305 10.0002 2.66667V4" stroke="#666F80" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-text-title mb-1 block">名称</label>
                                  <input
                                    type="text"
                                    value={station.name}
                                    onChange={(e) => updateEmergencyResource('fireStations', station.id, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="消防队名称"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-text-title mb-1 block">距离 (km)</label>
                                  <input
                                    type="text"
                                    value={station.distance}
                                    onChange={(e) => updateEmergencyResource('fireStations', station.id, 'distance', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="如1.2"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-text-title mb-1 block">电话</label>
                                  <input
                                    type="text"
                                    value={station.phone}
                                    onChange={(e) => updateEmergencyResource('fireStations', station.id, 'phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="电话号码"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-text-title mb-1 block">地址</label>
                                  <input
                                    type="text"
                                    value={station.address}
                                    onChange={(e) => updateEmergencyResource('fireStations', station.id, 'address', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="详细地址"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-text-title mb-1 block">预估车程 (分钟)</label>
                                  <input
                                    type="text"
                                    value={station.driveTime}
                                    onChange={(e) => updateEmergencyResource('fireStations', station.id, 'driveTime', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="如3 ～ 5"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-text-title">周边医院</h4>
                          <Button
                            onClick={() => addEmergencyResource('hospitals')}
                            type="outlined"
                            color="primary"
                            size="small"
                            icon={
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 1.1665C7.3866 1.1665 7.7 1.4799 7.7 1.8665V6.30017H12.1337C12.5203 6.30017 12.8337 6.61357 12.8337 7.00017C12.8337 7.38677 12.5203 7.70017 12.1337 7.70017H7.7V12.1338C7.7 12.5204 7.3866 12.8338 7 12.8338C6.6134 12.8338 6.3 12.5204 6.3 12.1338V7.70017H1.86633C1.47973 7.70017 1.16633 7.38677 1.16633 7.00017C1.16633 6.61357 1.47973 6.30017 1.86633 6.30017H6.3V1.8665C6.3 1.4799 6.6134 1.1665 7 1.1665Z" fill="currentColor"/>
                              </svg>
                            }
                          >
                            新增
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {editingOfficeInfo.emergencyResources.hospitals.map((hospital, index) => (
                            <div key={hospital.id} className="border border-divider-light rounded-lg p-4 relative">
                              <button
                                onClick={() => removeEmergencyResource('hospitals', hospital.id)}
                                className="absolute top-3 right-3 p-1 text-text-caption hover:text-red-500 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M12.3334 4.00008L11.3934 13.0667C11.3534 13.4601 11.0134 13.7467 10.6201 13.7467H5.38008C4.98675 13.7467 4.64675 13.4601 4.60675 13.0667L3.66675 4.00008" stroke="#666F80" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M1.3335 4H14.6668" stroke="#666F80" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M6.00016 4V2.66667C6.00016 2.31305 6.14064 1.97391 6.3907 1.72386C6.64075 1.4738 6.97989 1.33333 7.3335 1.33333H8.66683C9.02045 1.33333 9.35959 1.4738 9.60964 1.72386C9.8597 1.97391 10.0002 2.31305 10.0002 2.66667V4" stroke="#666F80" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-text-title mb-1 block">名称</label>
                                  <input
                                    type="text"
                                    value={hospital.name}
                                    onChange={(e) => updateEmergencyResource('hospitals', hospital.id, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="医院名称"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-text-title mb-1 block">距离 (km)</label>
                                  <input
                                    type="text"
                                    value={hospital.distance}
                                    onChange={(e) => updateEmergencyResource('hospitals', hospital.id, 'distance', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="如0.8"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-text-title mb-1 block">电话</label>
                                  <input
                                    type="text"
                                    value={hospital.phone}
                                    onChange={(e) => updateEmergencyResource('hospitals', hospital.id, 'phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="电话号码"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-text-title mb-1 block">地址</label>
                                  <input
                                    type="text"
                                    value={hospital.address}
                                    onChange={(e) => updateEmergencyResource('hospitals', hospital.id, 'address', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="详细地址"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-text-title mb-1 block">预估车程 (分钟)</label>
                                  <input
                                    type="text"
                                    value={hospital.driveTime}
                                    onChange={(e) => updateEmergencyResource('hospitals', hospital.id, 'driveTime', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="如2 ～ 4"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-text-title">周边派出所</h4>
                          <Button
                            onClick={() => addEmergencyResource('policeStations')}
                            type="outlined"
                            color="primary"
                            size="small"
                            icon={
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 1.1665C7.3866 1.1665 7.7 1.4799 7.7 1.8665V6.30017H12.1337C12.5203 6.30017 12.8337 6.61357 12.8337 7.00017C12.8337 7.38677 12.5203 7.70017 12.1337 7.70017H7.7V12.1338C7.7 12.5204 7.3866 12.8338 7 12.8338C6.6134 12.8338 6.3 12.5204 6.3 12.1338V7.70017H1.86633C1.47973 7.70017 1.16633 7.38677 1.16633 7.00017C1.16633 6.61357 1.47973 6.30017 1.86633 6.30017H6.3V1.8665C6.3 1.4799 6.6134 1.1665 7 1.1665Z" fill="currentColor"/>
                              </svg>
                            }
                          >
                            新增
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {editingOfficeInfo.emergencyResources.policeStations.map((station, index) => (
                            <div key={station.id} className="border border-divider-light rounded-lg p-4 relative">
                              <button
                                onClick={() => removeEmergencyResource('policeStations', station.id)}
                                className="absolute top-3 right-3 p-1 text-text-caption hover:text-red-500 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M12.3334 4.00008L11.3934 13.0667C11.3534 13.4601 11.0134 13.7467 10.6201 13.7467H5.38008C4.98675 13.7467 4.64675 13.4601 4.60675 13.0667L3.66675 4.00008" stroke="#666F80" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M1.3335 4H14.6668" stroke="#666F80" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                  <path d="M6.00016 4V2.66667C6.00016 2.31305 6.14064 1.97391 6.3907 1.72386C6.64075 1.4738 6.97989 1.33333 7.3335 1.33333H8.66683C9.02045 1.33333 9.35959 1.4738 9.60964 1.72386C9.8597 1.97391 10.0002 2.31305 10.0002 2.66667V4" stroke="#666F80" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-text-title mb-1 block">名称</label>
                                  <input
                                    type="text"
                                    value={station.name}
                                    onChange={(e) => updateEmergencyResource('policeStations', station.id, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="派出所名称"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-text-title mb-1 block">距离 (km)</label>
                                  <input
                                    type="text"
                                    value={station.distance}
                                    onChange={(e) => updateEmergencyResource('policeStations', station.id, 'distance', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="如0.6"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-text-title mb-1 block">电话</label>
                                  <input
                                    type="text"
                                    value={station.phone}
                                    onChange={(e) => updateEmergencyResource('policeStations', station.id, 'phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="电话号码"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-text-title mb-1 block">地址</label>
                                  <input
                                    type="text"
                                    value={station.address}
                                    onChange={(e) => updateEmergencyResource('policeStations', station.id, 'address', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="详细地址"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-medium text-text-title mb-1 block">预估车程 (分钟)</label>
                                  <input
                                    type="text"
                                    value={station.driveTime}
                                    onChange={(e) => updateEmergencyResource('policeStations', station.id, 'driveTime', e.target.value)}
                                    className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="如2 ～ 3"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Workplace Switch Drawer */}
        <AnimatePresence>
          {isWorkplaceDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsWorkplaceDrawerOpen(false)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-[600px] bg-white z-50 shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-divider">
                  <h3 className="text-lg font-semibold text-text-title">切换职场</h3>
                  <button
                    onClick={() => setIsWorkplaceDrawerOpen(false)}
                    className="p-2 hover:bg-bg-content-base rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {WORKPLACES.map(workplace => (
                      <div
                        key={workplace.id}
                        onClick={() => {
                          setIsLoading(true);
                          setIsWorkplaceDrawerOpen(false);
                          setTimeout(() => {
                            setCurrentWorkplace(workplace);
                            setIsLoading(false);
                          }, 1000);
                        }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          currentWorkplace.id === workplace.id
                            ? 'border-primary bg-primary/5'
                            : 'border-divider-light hover:border-primary/50 hover:bg-bg-content-base'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-text-title">{workplace.name}</h4>
                          {currentWorkplace.id === workplace.id && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1456F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-text-caption mb-2">地址：{workplace.address}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-text-caption">
                          <span>占地面积：{workplace.area} ㎡</span>
                          <span>出入口：{workplace.entranceCount} 个</span>
                          <span>工位数：{workplace.workstations} 个</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 任务详情抽屉 */}
        <AnimatePresence>
          {isTaskDetailDrawerOpen && selectedTask && (
            <>
              {/* 遮罩层 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsTaskDetailDrawerOpen(false)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              {/* 抽屉内容 */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 flex flex-col"
              >
                {/* 抽屉头部 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">任务详情</h2>
                  <button
                    onClick={() => setIsTaskDetailDrawerOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>

                {/* 抽屉内容 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">工单号</span>
                      <span className="text-sm text-gray-900 font-mono">{selectedTask.ticketNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">风险类型</span>
                      <span className="text-sm text-gray-900">{selectedTask.type || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">状态</span>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          selectedTask.status === 'red' ? 'bg-red-500' :
                          selectedTask.status === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></span>
                        <StatusBadge type={selectedTask.progress} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">负责人</span>
                      <span className="text-sm text-gray-900">{selectedTask.owner || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">计划完成日期</span>
                      <span className="text-sm text-gray-900">{selectedTask.planDate || '-'}</span>
                    </div>
                    {(selectedTask.progress === 'overdue' || selectedTask.finishDate) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">实际完成日期</span>
                        <span className="text-sm text-gray-900">
                          {selectedTask.progress === 'overdue' ? '-' : selectedTask.finishDate}
                        </span>
                      </div>
                    )}
                  </div>

                  <hr className="border-gray-200" />

                  {/* 问题分析 */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">问题分析</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedTask.analysis}</p>
                    </div>
                  </div>

                  {/* 解决方案 */}
                  {selectedTask.solution && selectedTask.solution !== '-' && (
                    <>
                      <hr className="border-gray-200" />
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-900">解决方案</h3>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <p className="text-sm text-gray-700">{selectedTask.solution}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 子任务 */}
                  {selectedTask.children && selectedTask.children.length > 0 && (
                    <>
                      <hr className="border-gray-200" />
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-900">子任务</h3>
                        <div className="space-y-3">
                          {selectedTask.children.map((child) => (
                            <div key={child.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">{child.ticketNumber}</span>
                                <StatusBadge type={child.progress} />
                              </div>
                              <p className="text-sm text-gray-600">{child.analysis}</p>
                              {child.solution && child.solution !== '-' && (
                                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                  <span className="font-medium">方案：</span>{child.solution}
                                </div>
                              )}
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                <span>负责人：{child.owner || '-'}</span>
                                {child.planDate && <span>计划：{child.planDate}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
