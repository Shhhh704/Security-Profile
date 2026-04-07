// ===== 通用状态类型 =====

export type TabType = 'overview' | 'safety' | 'rectification' | 'risk' | 'office';

export type WorkplaceStatus = 'red' | 'yellow' | 'green';

export type RiskCategory =
  | '消防'
  | '人身安全'
  | '出入'
  | '客诉'
  | '交通事故/拥堵'
  | '办公/园区秩序'
  | '极端天气/自然灾害'
  | '财产损失';

// ===== 职场列表（Dashboard 使用） =====

export interface RiskItem {
  type: RiskCategory;
  level: 'red' | 'yellow';
}

export interface WorkplaceSummary {
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

// ===== 职场详情（Detail 使用） =====

export interface WorkplaceInfo {
  id: string;
  name: string;
  address: string;
  area: string;
  entranceCount: string;
  workstations: string;
}

// ===== 整改任务 =====

export interface RectificationItem {
  id: string;
  type: string;
  ticketNumber: string;
  status: 'red' | 'yellow' | 'green';
  analysis: string;
  solution: string;
  progress: 'overdue' | 'pending' | 'completed' | 'accepting';
  owner: string;
  planDate: string;
  finishDate?: string;
  children?: RectificationItem[];
}

// ===== 安全指标 =====

export interface SafetyIndicator {
  label: string;
  value: string;
  status: 'green' | 'orange' | 'red';
}

export interface SafetyRiskType {
  id: string;
  name: string;
  indicators: SafetyIndicator[];
}

export interface ManualCalibration {
  riskTypeId: string;
  calibratedStatus: 'green' | 'orange' | 'red';
  calibratedIndicators: SafetyIndicator[];
  calibratedReason: string;
  calibratedAt: string;
}

// ===== 风险评估 =====

export interface RiskAssessmentData {
  name: string;
  riskFeatures: string;
  protectionMeasures: string;
  updateTime: string;
}

// ===== 应急资源 =====

export interface EmergencyResource {
  id: string;
  name: string;
  distance: string;
  address: string;
  phone: string;
  driveTime: string;
}

export interface EmergencyResources {
  fireStations: EmergencyResource[];
  hospitals: EmergencyResource[];
  policeStations: EmergencyResource[];
}

// ===== 职场信息（办公信息） =====

export interface OfficeInfo {
  builtYear: string;
  moveInDate: string;
  propertyType: '自持' | '租赁';
  usage: '办公' | '商业' | '办公+商业';
  rentalArea: string;
  totalArea: string;
  buildingInfo: string;
  entranceCount: string;
  hasByteLogo: '是' | '否';
  expansionPlan: string;
  emergencyResources: EmergencyResources;
}
