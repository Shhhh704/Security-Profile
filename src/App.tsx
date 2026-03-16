import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ClipboardCheck, 
  AlertTriangle, 
  BookOpen, 
  Users, 
  HardDrive, 
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  MapPin,
  Maximize2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Edit3,
  Search,
  ArrowLeftRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type TabType = 'safety' | 'rectification' | 'risk' | 'office';

interface RectificationItem {
  id: string;
  type: string;
  status: 'red' | 'yellow' | 'green';
  analysis: string;
  solution: string;
  progress: 'overdue' | 'pending' | 'public' | 'completed';
  owner: string;
  planDate: string;
  finishDate?: string;
  children?: RectificationItem[];
}

interface RiskAssessmentData {
  name: string;
  riskFeatures: string;
  protectionMeasures: string;
  updateTime: string;
}

interface SafetyIndicator {
  label: string;
  value: string;
  status: 'green' | 'orange' | 'red';
}

interface SafetyRiskType {
  id: string;
  name: string;
  indicators: SafetyIndicator[];
}

interface ManualCalibration {
  riskTypeId: string;
  calibratedIndicators: SafetyIndicator[];
  calibratedAt: string;
}

interface EmergencyResource {
  id: string;
  name: string;
  distance: string;
  address: string;
  phone: string;
  driveTime: string;
}

interface EmergencyResources {
  fireStations: EmergencyResource[];
  hospitals: EmergencyResource[];
  policeStations: EmergencyResource[];
}

interface OfficeInfo {
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

// --- Mock Data ---

const SAFETY_RISK_TYPES: SafetyRiskType[] = [
  { id: 'entry', name: '出入风险', indicators: [
    { label: '无权限人员闯入次数：', value: '10次', status: 'green' },
    { label: '闯入报警响应时效达标率：', value: '不达标', status: 'orange' }
  ]},
  { id: 'fire', name: '消防风险', indicators: [
    { label: '明火事件数量：', value: '0次', status: 'green' },
    { label: '工区消防手续是否完备：', value: '不完备', status: 'red' }
  ]},
  { id: 'personal', name: '人身安全风险', indicators: [
    { label: '暴力事件数量：', value: '0次', status: 'green' },
    { label: '医疗急救响应：', value: '100%', status: 'green' }
  ]},
  { id: 'disaster', name: '极端灾害风险', indicators: [
    { label: '气象预警响应：', value: '及时', status: 'green' },
    { label: '防汛物资储备：', value: '充足', status: 'green' }
  ]},
  { id: 'order', name: '办公秩序风险', indicators: [
    { label: '违规吸烟举报：', value: '0次', status: 'green' },
    { label: '办公区噪音达标：', value: '100%', status: 'green' }
  ]},
  { id: 'property', name: '财产损失风险', indicators: [
    { label: '资产丢失报案：', value: '0次', status: 'green' },
    { label: '监控覆盖完整率：', value: '100%', status: 'green' }
  ]},
  { id: 'traffic', name: '交通事故风险', indicators: [
    { label: '园区超速违章：', value: '0次', status: 'green' },
    { label: '停车场秩序评分：', value: '9.8', status: 'green' }
  ]},
  { id: 'complaint', name: '客诉风险', indicators: [
    { label: '安全服务投诉：', value: '0次', status: 'green' },
    { label: '投诉处理时效：', value: '100%', status: 'green' }
  ]}
];

const STABLE_RISKS = [
  { id: 'personal', name: '人身安全风险', summary: '暴力/医疗事件 0', indicators: [{ label: '暴力事件数量：', value: '0次' }, { label: '医疗急救响应：', value: '100%' }] },
  { id: 'disaster', name: '极端灾害风险', summary: '气象/防汛 正常', indicators: [{ label: '气象预警响应：', value: '及时' }, { label: '防汛物资储备：', value: '充足' }] },
  { id: 'order', name: '办公秩序风险', summary: '吸烟/噪音 达标', indicators: [{ label: '违规吸烟举报：', value: '0次' }, { label: '办公区噪音达标：', value: '100%' }] },
  { id: 'property', name: '财产损失风险', summary: '资产/监控 正常', indicators: [{ label: '资产丢失报案：', value: '0次' }, { label: '监控覆盖完整率：', value: '100%' }] },
  { id: 'traffic', name: '交通事故风险', summary: '超速/秩序 良好', indicators: [{ label: '园区超速违章：', value: '0次' }, { label: '停车场秩序评分：', value: '9.8' }] },
  { id: 'complaint', name: '客诉风险', summary: '服务/时效 100%', indicators: [{ label: '安全服务投诉：', value: '0次' }, { label: '投诉处理时效：', value: '100%' }] },
];

const RECTIFICATION_DATA: RectificationItem[] = [
  {
    id: '1',
    type: '出入风险',
    status: 'red',
    analysis: '近期地铁改造导致出入口人流激增，安全管控压力增大',
    solution: '-',
    progress: 'overdue',
    owner: '-',
    planDate: '-',
    finishDate: '2026-03-10',
    children: [
      {
        id: '1-1',
        type: '',
        status: 'red',
        analysis: '早晚高峰期安保人员配置不足',
        solution: '协调外包保安公司，在早晚高峰时段增加2名安保人员，加强出入口管控',
        progress: 'overdue',
        owner: '陈浩',
        planDate: '2026-03-10',
        finishDate: '2026-03-12',
      },
      {
        id: '1-2',
        type: '',
        status: 'red',
        analysis: '现有闸机防尾随功能老化',
        solution: '联系供应商对A区、B区共6台主出入口闸机进行防尾随功能升级',
        progress: 'pending',
        owner: '陈梅',
        planDate: '2026-03-15',
      }
    ]
  },
  {
    id: '2',
    type: '消防风险',
    status: 'yellow',
    analysis: '内部消防审计发现多处灭火器即将过期，存在安全隐患',
    solution: '-',
    progress: 'public',
    owner: '-',
    planDate: '-',
    finishDate: '2026-03-08',
    children: [
      {
        id: '2-1',
        type: '',
        status: 'yellow',
        analysis: '灭火器临期',
        solution: '采购并替换全园区共45具即将过期的灭火器，确保消防设备完好',
        progress: 'public',
        owner: '陈欣',
        planDate: '2026-03-08',
        finishDate: '2026-03-08',
      },
      {
        id: '2-2',
        type: '',
        status: 'yellow',
        analysis: 'C区通道杂物堆积',
        solution: '联合行政部门对C区通道进行全面清理，确保消防通道畅通',
        progress: 'completed',
        owner: '李磊',
        planDate: '2026-03-05',
        finishDate: '2026-03-04',
      }
    ]
  },
  {
    id: '3',
    type: '客诉风险',
    status: 'green',
    analysis: '近期接到多起关于安保服务态度的投诉',
    solution: '-',
    progress: 'completed',
    owner: '-',
    planDate: '-',
    finishDate: '2026-03-01',
    children: [
      {
        id: '3-1',
        type: '',
        status: 'green',
        analysis: '安保人员服务意识不足',
        solution: '组织安保人员服务礼仪培训，提升服务意识和沟通能力',
        progress: 'completed',
        owner: '李天天',
        planDate: '2026-03-01',
        finishDate: '2026-02-28',
      }
    ]
  }
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, collapsed = false }: { icon: any, label: string, active?: boolean, collapsed?: boolean }) => (
  <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
    active ? 'bg-primary/15 text-primary font-medium' : 'text-text-title hover:bg-black/5'
  } ${collapsed ? 'justify-center px-2.5' : ''}`}>
    <Icon size={20} className="shrink-0" />
    {!collapsed && <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
  </div>
);

const StatusBadge = ({ type }: { type: RectificationItem['progress'] }) => {
  const styles = {
    overdue: 'bg-red-50 text-red-600',
    pending: 'bg-yellow-50 text-yellow-600',
    public: 'bg-blue-50 text-blue-600',
    completed: 'bg-green-50 text-green-600',
  };
  const labels = {
    overdue: '已逾期',
    pending: '未完成',
    public: '公示中',
    completed: '已完成',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
};

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('safety');
  const [activeRiskTab, setActiveRiskTab] = useState(0);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [expandedStableCards, setExpandedStableCards] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [officeEditing, setOfficeEditing] = useState(false);
  const [hasEditPermission] = useState(true);

  const [manualCalibrations, setManualCalibrations] = useState<Record<string, ManualCalibration>>({});
  const [isCalibrationDrawerOpen, setIsCalibrationDrawerOpen] = useState(false);
  const [calibratingRiskTypeId, setCalibratingRiskTypeId] = useState<string>('');
  const [calibratingIndicators, setCalibratingIndicators] = useState<SafetyIndicator[]>([]);

  const [officeInfo, setOfficeInfo] = useState<OfficeInfo>({
    builtYear: '2015',
    moveInDate: '2018-05-20',
    propertyType: '自持',
    usage: '办公+商业',
    rentalArea: '32,250',
    totalArea: '45,000',
    buildingInfo: 'C座1-20层，D座1-18层',
    entranceCount: '199',
    hasByteLogo: '是',
    expansionPlan: '2026年Q3计划扩租B座5-8层',
    emergencyResources: {
      fireStations: [
        { id: 'fire-1', name: '北下关消防救援站', distance: '1.2', address: '海淀区学院南路51号', phone: '010-62255119', driveTime: '3 ～ 5' },
        { id: 'fire-2', name: '中关村消防救援站', distance: '2.3', address: '海淀区中关村大街18号', phone: '010-62555119', driveTime: '6 ～ 10' },
        { id: 'fire-3', name: '五道口消防救援站', distance: '3.1', address: '海淀区成府路28号', phone: '010-62355119', driveTime: '8 ～ 12' }
      ],
      hospitals: [
        { id: 'hospital-1', name: '北京大学口腔医院', distance: '0.8', address: '海淀区中关村南大街22号', phone: '010-62179977', driveTime: '2 ～ 4' },
        { id: 'hospital-2', name: '北京博爱医院', distance: '1.5', address: '海淀区皂君庙路10号', phone: '010-62266666', driveTime: '4 ～ 6' },
        { id: 'hospital-3', name: '中关村医院', distance: '2.0', address: '海淀区中关村南路12号', phone: '010-62553000', driveTime: '5 ～ 8' },
        { id: 'hospital-4', name: '海淀医院', distance: '2.8', address: '海淀区中关村大街29号', phone: '010-82693000', driveTime: '7 ～ 12' }
      ],
      policeStations: [
        { id: 'police-1', name: '大钟寺派出所', distance: '0.6', address: '海淀区皂君庙路5号', phone: '010-62255110', driveTime: '2 ～ 3' },
        { id: 'police-2', name: '中关村派出所', distance: '1.8', address: '海淀区中关村大街27号', phone: '010-62555110', driveTime: '4 ～ 7' },
        { id: 'police-3', name: '五道口派出所', distance: '2.5', address: '海淀区成府路28号', phone: '010-62355110', driveTime: '6 ～ 10' },
        { id: 'police-4', name: '海淀派出所', distance: '3.2', address: '海淀区海淀大街30号', phone: '010-62655110', driveTime: '8 ～ 14' }
      ]
    }
  });
  const [isOfficeDrawerOpen, setIsOfficeDrawerOpen] = useState(false);
  const [editingOfficeInfo, setEditingOfficeInfo] = useState<OfficeInfo>(officeInfo);

  const contentRef = useRef<HTMLDivElement>(null);

  const calculateRectificationStats = () => {
    let completed = 0;
    let pending = 0;
    let overdue = 0;
    
    RECTIFICATION_DATA.forEach(item => {
      if (item.children) {
        item.children.forEach(child => {
          if (child.progress === 'completed') {
            completed++;
          } else if (child.progress === 'pending' || child.progress === 'public') {
            pending++;
          } else if (child.progress === 'overdue') {
            overdue++;
          }
        });
      }
    });
    
    return {
      total: completed + pending + overdue,
      completed,
      pending,
      overdue
    };
  };

  const rectificationStats = calculateRectificationStats();
  const safetyRef = useRef<HTMLDivElement>(null);
  const rectificationRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);
  const officeRef = useRef<HTMLDivElement>(null);

  const riskTabs = ['出入风险', '消防风险', '客诉风险', '人身安全风险', '秩序风险', '财产风险'];

  const [riskAssessmentData, setRiskAssessmentData] = useState<Record<string, RiskAssessmentData>>({
    '出入风险': {
      name: '出入风险',
      riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">北京大钟寺广场为开放式自持园区，现运营的C座和D座由商场改造成的办公室，楼宇布局复杂，需要防范的出入口数量接近200个，其中全员可通行出入口数共42个，包括23个无安保值守出入口，和14个临近商业区域出入口，外部人员（外卖、顾客、代驾等）尾随误入风险高。</p><p class="text-sm text-text-body leading-relaxed">9-11月大钟寺现场响应各类闯入报警（尾随、强开等）共2191次，外部人员真实闯入事件共10起，其中9起均为商业区域人员误入。</p>',
      protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">管控措施：对远程和现场响应安保人员定期开展出入管理专项培训和模拟演练，持续提升异常人员识别、追踪和拦截能力；临近商业出入口位置增加更为醒目的办公区域提示和商业区域引导标识，降低误入风险；增加周界门检查和测试频次，发现设备异常及时同步技防团队跟进维修。</p><p class="text-sm text-text-body leading-relaxed mb-2">人防配置：对临近商业区域且高频（月均大于3起）发生外部人员误入工区事件（如D座B2层餐厅、B1层4号电梯厅入口等），在工作时间增设2名安保固定岗值守；通行高峰期间安排巡视岗支持临近商业区的无安保值守出入口身份查验。</p><p class="text-sm text-text-body leading-relaxed mb-2">技防配置：大钟寺园区共配置矮闸机7组、高闸机10组、平开门禁7个、旋转门15组、刷卡立柱3个，以实现防线二技术手段管控；大钟寺园区共安装3,472个监控探头，可有效追踪或回查闯入人员行动轨迹。</p><p class="text-sm text-text-body leading-relaxed">人技联动：通过人/技防联动，落实闯入报警响应机制，实现安保快速响应、追踪和拦截外部入侵人员。</p>',
      updateTime: '2026-03-15 10:00'
    },
    '消防风险': {
      name: '消防风险',
      riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">固有消防风险：大钟寺C座和D座均为高层建筑（据建筑防火设计规范，超过24米的非单层公共建筑为高层建筑），且均设有中庭，建筑火灾竖向蔓延速度快，人员垂直疏散距离长，疏散困难，外部救援难度大。</p><p class="text-sm text-text-body leading-relaxed mb-2">主要消防风险：大钟寺C座和D座均配置了位于地下的餐饮楼层，电气设备数量多，电气火灾风险较高；建筑内的厨房均使用天然气，存在燃气泄漏的消防风险；地下车库设有电动车充电桩，电动车起火扑救难度大。</p><p class="text-sm text-text-body leading-relaxed">其它消防风险：大钟寺楼内隐蔽空间较多，隐蔽空间存在堆物风险；园区处于边运营、边施工建设阶段，运营与施工风险叠加易引发消防安全风险。</p>',
      protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">固有风险防护：保障消防设施的正常运行，大钟寺配置了两名维保人员日间常驻现场，夜间15分钟响应，2小时到达现场，能够确保当消防设施出现故障时及时维修；组织同学进行全楼疏散演习，确保同学熟悉疏散路径，掌握疏散知识。</p><p class="text-sm text-text-body leading-relaxed mb-2">主要风险防护：组织餐饮供应商进行每日和每周防火巡查，定期检查电气设施和燃气设施的运行状态；制定地下车库新能源汽车火灾扑救方案，采购并补充推车式水基型灭火器等初期灭火工具，完善充电桩配电设施过载、故障断电等安全保护功能。</p><p class="text-sm text-text-body leading-relaxed mb-2">其它风险防护：定期组织隐蔽空间的联合巡检，及时消除隐患；消防运营团队在做好日常运营管理的同时，与地产团队配合将新建区域消防设备设施接入消防系统，施工完成前三个月消防团队开始介入检查，监督总包整改，最终验收阶段消防团队负责承接查验，降低运营和施工交接区域的消防风险。</p><p class="text-sm text-text-body leading-relaxed mb-2">消防人力配置：大钟寺E栋设置一个集中消防控制室，全年24h双人值班，每班2人，值班人员均持证上岗(中级消防设施操作员证书)；人员配置13人：管理岗1人（消防主管）、技术员4人（消防技术员）、操作员8人。</p><p class="text-sm text-text-body leading-relaxed mb-2">安保兼职消防队：大钟寺兼职微消队共计118人（含安全经理2人，领班7人）：其中1号楼61人，2号楼57人，满足24H不间断值岗，每班不少于20人要求；每月度内部演练比赛，每季度组织开展消防应急培训演练。</p><p class="text-sm text-text-body leading-relaxed mb-2">消防系统/设施：大钟寺园区配有功能良好的消防系统和末端设备，主要包括火灾自动报警系统、电气火灾监控系统、消防电源监控系统、消火栓系统、自动喷水灭火系统、防排烟系统、防火门监控系统、气体灭火系统、疏散指示应急照明系统、燃气报警系统、厨房灭火系统、防火分隔设施（防火卷帘、挡烟垂壁）共12类。</p><p class="text-sm text-text-body leading-relaxed">微型消防站物资：大钟寺园区配有消防器材柜共3个：C座/D座和E座（消防中控室）各配置1套消防器材柜；消防应急包6套，C座和D座各配置3套，含防毒面具、应急手电、灭火器等，配置在现场安保值班室，以及B3和B4层车库岗亭内。</p>',
      updateTime: '2026-03-15 10:00'
    },
    '客诉风险': {
      name: '客诉风险',
      riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">外墙悬挂多个字节相关业务logo，百度/高德地图中均显示"总部"字样，被外界认为是抖音北京总部，导致客诉量大，9-11月大钟寺现场共接待客诉事件425起，承接北京区域53%的客诉量，其中涉及堵门、拉横幅等中风险及以上客诉事件3起，虽风险客诉会引导至临近盈都职场处置，但仍有部分人员会折返回大钟寺采取闹访、滞留等手段施压，且园区内配有"1733商业区"，人流量大，舆情风险高。</p><p class="text-sm text-text-body leading-relaxed">引导至盈都职场原因：大钟寺园区人流量大、临近三环辅路，发生极端闹访事件易引起政府关注，盈都距离大钟寺步行10分钟，位置相对偏僻，人流量小，风险可控。</p>',
      protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">管控措施：培养并推荐更多高潜力保安参与兼职客诉经理认证培训和评估，着力提升现场客诉接待沟通能力；季度开展对现有安保人员的极端客诉应急响应培训和实操演练，持续提升现场突发事件处置能力；与PA、属地派出所紧密配合，闹访案件明确告诫客诉人前往盈都职场处理。</p><p class="text-sm text-text-body leading-relaxed mb-2">人防配置：临近的方恒职场常驻1名客诉经理，大钟寺现场常驻3名安保认证兼职客诉岗；大钟寺C/D座可抽掉各4名巡视岗和1名管理岗响应各类突发事件；防暴队伍共计20人，分为2队，均接受过属地公安机关的防暴培训和联合演练。</p><p class="text-sm text-text-body leading-relaxed mb-2">物资配置：配置防暴柜共4组，各类防暴器材50个，伞式警示围挡20组。</p><p class="text-sm text-text-body leading-relaxed mb-2">线下管控：安保及时使用围挡（或黑伞）对极端行为进行遮挡，阻止拍摄；安保对周围警戒，疏散围观人员，礼貌劝止拍摄；当客诉人员执意不删除拍摄内容，及时同步警方，劝导客诉人员删除。</p><p class="text-sm text-text-body leading-relaxed">线上联动：实时同步PR，对园区进行电子围栏布控，及时监控并处置舆情。</p>',
      updateTime: '2026-03-15 10:00'
    },
    '人身安全风险': {
      name: '人身安全风险',
      riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">大钟寺园区部分配套设施（停车场、穿梭车站等）位于园区外围，距离办公楼宇较远，现有工区SOS资源难以确保园区周边紧急医疗事件的内部响应时效（&lt;4mins到场）。</p><p class="text-sm text-text-body leading-relaxed">9-11月大钟寺园区外围SOS医疗响应事件共3起（其中中风险2起、低风险1起），平均响应时效&gt;5mins。</p>',
      protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">管控措施：通过不断开展专项培训和实操演练，持续提升SOS值班号的沟通技巧和现场安保的急救响应能力，确保能够快速且准确获取求救人员的位置信息，提升安保响应效率；外围固定岗位增配AED+FAK，可快速取用响应园区周边紧急医疗需求，保障响应时效。</p><p class="text-sm text-text-body leading-relaxed mb-2">SOS组员配置：C座（1号楼）SOS小组正式成员14人，预备3人，一共17人；D座（2号楼）SOS小组正式成员15人，预备9人，一共24人。</p><p class="text-sm text-text-body leading-relaxed mb-2">安保配置：C座（1号楼）持有急救证保安共29人（安保员25人，管理岗4人）；D座（2号楼）持有急救证保安共27人（安保员22人，管理岗5人）。</p><p class="text-sm text-text-body leading-relaxed">SOS物资配置：C座（1号楼）配置AED和FAK各13个；D座（2号楼）配置AED和FAK各11个。</p>',
      updateTime: '2026-03-15 10:00'
    },
    '秩序风险': {
      name: '秩序风险',
      riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">吸烟违规：部分员工在非吸烟区吸烟，存在火灾隐患，影响办公环境。</p><p class="text-sm text-text-body leading-relaxed">噪音干扰：办公区噪音超标，影响员工工作效率，易引发矛盾冲突。</p>',
      protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">人防配置：加强巡逻检查，在重点区域设置禁烟标识，安排专人劝阻违规行为。</p><p class="text-sm text-text-body leading-relaxed">管理措施：制定办公区秩序管理制度，开展文明办公宣传，建立违规举报机制。</p>',
      updateTime: '2026-03-15 10:00'
    },
    '财产风险': {
      name: '财产风险',
      riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">资产丢失：园区面积大，出入口多，存在贵重物品丢失风险。</p><p class="text-sm text-text-body leading-relaxed">监控盲区：部分区域监控覆盖不足，发生事件后难以追溯。</p>',
      protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">技防配置：全量覆盖 3472 个监控探头，定期检查监控设备运行状态。</p><p class="text-sm text-text-body leading-relaxed">管理措施：建立资产登记管理制度，加强贵重物品保管，定期开展安全巡查。</p>',
      updateTime: '2026-03-15 10:00'
    }
  });

  const [isRiskDrawerOpen, setIsRiskDrawerOpen] = useState(false);
  const [editingRiskTab, setEditingRiskTab] = useState<string>('');
  const [editingRiskFeatures, setEditingRiskFeatures] = useState('');
  const [editingProtectionMeasures, setEditingProtectionMeasures] = useState('');
  const [activeEditor, setActiveEditor] = useState<'riskFeatures' | 'protectionMeasures' | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleStableCard = (id: string) => {
    setExpandedStableCards(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAllStableCards = () => {
    const stableRiskTypes = SAFETY_RISK_TYPES.slice(2);
    if (expandedStableCards.length === stableRiskTypes.length) {
      setExpandedStableCards([]);
    } else {
      setExpandedStableCards(stableRiskTypes.map(r => r.id));
    }
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
    const firstRiskType = SAFETY_RISK_TYPES[0];
    setCalibratingRiskTypeId(firstRiskType.id);
    const existingCalibration = manualCalibrations[firstRiskType.id];
    setCalibratingIndicators(existingCalibration 
      ? [...existingCalibration.calibratedIndicators] 
      : [...firstRiskType.indicators]);
    setIsCalibrationDrawerOpen(true);
  };

  const saveCalibration = () => {
    setManualCalibrations(prev => ({
      ...prev,
      [calibratingRiskTypeId]: {
        riskTypeId: calibratingRiskTypeId,
        calibratedIndicators: calibratingIndicators,
        calibratedAt: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '-')
      }
    }));
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

  const switchCalibratingRiskType = (riskTypeId: string) => {
    setCalibratingRiskTypeId(riskTypeId);
    const existingCalibration = manualCalibrations[riskTypeId];
    const riskType = SAFETY_RISK_TYPES.find(r => r.id === riskTypeId);
    if (riskType) {
      setCalibratingIndicators(existingCalibration 
        ? [...existingCalibration.calibratedIndicators] 
        : [...riskType.indicators]);
    }
  };

  const updateIndicatorStatus = (index: number, status: 'green' | 'orange' | 'red') => {
    setCalibratingIndicators(prev => prev.map((indicator, i) => 
      i === index ? { ...indicator, status } : indicator
    ));
  };

  const updateIndicatorValue = (index: number, value: string) => {
    setCalibratingIndicators(prev => prev.map((indicator, i) => 
      i === index ? { ...indicator, value } : indicator
    ));
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
    const refs = { safety: safetyRef, rectification: rectificationRef, risk: riskRef, office: officeRef };
    const target = refs[section]?.current;
    if (target && contentRef.current) {
      const offset = target.offsetTop - 120;
      contentRef.current.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const scrollTop = contentRef.current.scrollTop;
      const refs = { 
        safety: safetyRef, 
        rectification: rectificationRef, 
        risk: riskRef, 
        office: officeRef 
      };
      
      let currentSection: TabType = 'safety';
      
      Object.entries(refs).forEach(([key, ref]) => {
        if (ref.current) {
          const offsetTop = ref.current.offsetTop - 150;
          if (scrollTop >= offsetTop) {
            currentSection = key as TabType;
          }
        }
      });
      
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
    <div className="flex flex-col h-screen overflow-hidden font-sans">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.nav 
          animate={{ width: collapsed ? 72 : 180 }}
          className="bg-bg-body border-r border-divider-light flex flex-col shrink-0 overflow-y-auto overflow-x-hidden"
        >
          <div className="flex-1 p-2">
            <SidebarItem icon={LayoutDashboard} label="数据驾驶舱" collapsed={collapsed} />
            <SidebarItem icon={ShieldCheck} label="安全档案" active collapsed={collapsed} />
            <SidebarItem icon={ClipboardCheck} label="巡检管理" collapsed={collapsed} />
            <SidebarItem icon={AlertTriangle} label="事件中心" collapsed={collapsed} />
            <SidebarItem icon={BookOpen} label="规章制度" collapsed={collapsed} />
            <SidebarItem icon={Users} label="人员管理" collapsed={collapsed} />
            <SidebarItem icon={HardDrive} label="设备管理" collapsed={collapsed} />
            <SidebarItem icon={LifeBuoy} label="应急预案" collapsed={collapsed} />
          </div>
          <div 
            className="flex items-center gap-2 px-3.5 py-3 cursor-pointer text-text-caption hover:bg-black/5 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronLeft size={20} />
            </motion.div>
            {!collapsed && <span className="text-sm">收起</span>}
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-bg-body" ref={contentRef}>
            <div className="max-w-full pb-10">
              {/* Hero Banner */}
              <div className="relative rounded-xl mx-3 mt-3 border border-divider-light bg-bg-overlay">
                
                <div className="absolute right-4 top-4 text-text-placeholder text-xs flex items-center gap-1.5 z-10">
                  更新时间 2025/2/3 23:59 (GMT+8)
                </div>

                <div className="relative z-10 p-4 flex gap-10 h-full flex-wrap lg:flex-nowrap">
                  <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-semibold text-text-title">北京大钟寺广场</h2>
                      <button className="inline-flex items-center gap-1.5 px-1.5 py-1.5 bg-white rounded-lg text-primary text-sm font-medium hover:bg-divider-light transition-all">
                        <ArrowLeftRight size={14} />
                        切换职场
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-y-2 mt-3">
                      <div className="text-text-caption text-sm">
                        地址：北京市海淀区北下关街道大钟寺广场
                      </div>
                      <div className="w-[1px] h-3 bg-divider mx-2" />
                      <div className="text-text-caption text-sm">
                        占地面积：32,250 ㎡
                      </div>
                      <div className="w-[1px] h-3 bg-divider mx-2" />
                      <div className="text-text-caption text-sm">
                        出入口数量：199 个
                      </div>
                      <div className="w-[1px] h-3 bg-divider mx-2" />
                      <div className="text-text-caption text-sm">
                        可用工位数：12,345 个
                      </div>
                    </div>

                    <div className="flex gap-8 mt-4 pt-4 border-t border-divider" style={{borderTopWidth: '0.5px'}}>
                      <div className="flex flex-col gap-1.5 w-32">
                        <span className="text-sm text-text-caption">安全状态</span>
                        <div className="flex items-center h-8">
                          <span className="text-2xl font-semibold text-text-title">黄灯</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 w-32">
                        <span className="text-sm text-text-caption">持续安全天数</span>
                        <div className="flex items-center gap-1 h-8">
                          <span className="text-2xl font-semibold text-text-title">48</span>
                          <span className="text-sm font-medium text-text-caption mt-1">天</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-[48px] flex-1">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm text-text-caption">待整改事项</span>
                          <div className="flex items-center gap-1 h-8">
                            <span className="text-2xl font-semibold text-text-title">{rectificationStats.total}</span>
                            <span className="text-sm font-medium text-text-caption mt-1">个</span>
                          </div>
                        </div>
                        
                        {/* Mini Donut */}
                        <div className="flex items-center gap-3 pt-0.5">
                          <div 
                            className="relative w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              scrollToSection('rectification');
                              setTimeout(() => {
                                setDropdownOpen('整改进度');
                              }, 500);
                            }}
                          >
                            <svg viewBox="0 0 36 36" className="rotate-[-90deg]">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-divider-light)" strokeWidth="6" />
                              <circle 
                                cx="18" 
                                cy="18" 
                                r="14" 
                                fill="none" 
                                stroke="var(--color-status-green)" 
                                strokeWidth="6" 
                                strokeDasharray={`${(rectificationStats.completed / rectificationStats.total) * 88} 88`} 
                                strokeLinecap="round" 
                              />
                              <circle 
                                cx="18" 
                                cy="18" 
                                r="14" 
                                fill="none" 
                                stroke="var(--color-status-orange)" 
                                strokeWidth="6" 
                                strokeDasharray={`${(rectificationStats.pending / rectificationStats.total) * 88} 88`} 
                                strokeDashoffset={`-${(rectificationStats.completed / rectificationStats.total) * 88}`} 
                                strokeLinecap="round" 
                              />
                              <circle 
                                cx="18" 
                                cy="18" 
                                r="14" 
                                fill="none" 
                                stroke="var(--color-status-grey)" 
                                strokeWidth="6" 
                                strokeDasharray={`${(rectificationStats.overdue / rectificationStats.total) * 88} 88`} 
                                strokeDashoffset={`-${((rectificationStats.completed + rectificationStats.pending) / rectificationStats.total) * 88}`} 
                                strokeLinecap="round" 
                              />
                            </svg>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div 
                              className="flex items-center gap-1.5 text-[11px] text-text-caption cursor-pointer hover:text-text-body transition-colors"
                              onClick={() => {
                                scrollToSection('rectification');
                                setTimeout(() => {
                                  setDropdownOpen('整改进度');
                                }, 500);
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-status-green" /> 已整改 {rectificationStats.completed}
                            </div>
                            <div 
                              className="flex items-center gap-1.5 text-[11px] text-text-caption cursor-pointer hover:text-text-body transition-colors"
                              onClick={() => {
                                scrollToSection('rectification');
                                setTimeout(() => {
                                  setDropdownOpen('整改进度');
                                }, 500);
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-status-orange" /> 待整改 {rectificationStats.pending}
                            </div>
                            <div 
                              className="flex items-center gap-1.5 text-[11px] text-text-caption cursor-pointer hover:text-text-body transition-colors"
                              onClick={() => {
                                scrollToSection('rectification');
                                setTimeout(() => {
                                  setDropdownOpen('整改进度');
                                }, 500);
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-status-grey" /> 已逾期 {rectificationStats.overdue}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Removed Rectification Completion Rate section */}
                </div>
              </div>

              {/* Sticky Tabs */}
              <div className="sticky top-0 z-10 bg-bg-body px-3 pt-3">
                <div className="bg-bg-overlay rounded-xl border border-divider-light">
                  <div className="flex px-4 gap-10">
                    {(['safety', 'rectification', 'risk', 'office'] as TabType[]).map((tab) => (
                      <div 
                        key={tab}
                        className={`relative py-3.5 text-base cursor-pointer transition-colors ${
                          activeTab === tab ? 'text-primary font-semibold' : 'text-text-title'
                        }`}
                        onClick={() => scrollToSection(tab)}
                      >
                        <span>{tab === 'safety' ? '安全状态' : tab === 'rectification' ? '整改进度' : tab === 'risk' ? '风险评估' : '办公室信息'}</span>
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

              {/* Cards Container */}
              <div className="px-3 mt-3 flex flex-col gap-4">
                {/* Safety Status Card */}
                <section id="card-safety" ref={safetyRef} className="bg-bg-overlay rounded-xl border border-divider-light overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <h3 className="text-base font-medium text-text-title">安全状态</h3>
                    <button onClick={openCalibrationDrawer} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary rounded-lg text-primary text-sm font-medium hover:bg-divider-light transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10.2506 4.22599L10.2467 4.22234L10.4623 4.0067C10.6897 3.77932 10.6902 3.41081 10.4634 3.18283L8.46015 1.16901L8.45906 1.16792C8.23126 0.940119 7.86191 0.940119 7.63411 1.16792L7.22271 1.57932L7.22845 1.58509L1.16797 7.69221V9.91705C1.16797 10.2392 1.42914 10.5004 1.7513 10.5004H3.97615L10.2506 4.22599ZM8.34127 4.4529L7.16606 3.27768L8.03296 2.39383L9.21313 3.5802L8.34127 4.4529ZM6.3491 4.11064L7.51672 5.27827L3.48411 9.31476H3.48233L2.35361 8.18603V8.18425L6.3491 4.11064Z" fill="#1456F0"/>
                        <path d="M1.7513 11.6671C1.42914 11.6671 1.16797 11.9282 1.16797 12.2504C1.16797 12.5726 1.42914 12.8337 1.7513 12.8337H12.2513C12.5735 12.8337 12.8346 12.5726 12.8346 12.2504C12.8346 11.9282 12.5735 11.6671 12.2513 11.6671H1.7513Z" fill="#1456F0"/>
                      </svg>
                      校准
                    </button>
                  </div>
                  <div className="px-4 pb-6">
                    {/* Warning Group */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={16} className="text-tag-orange-text" />
                        <span className="text-sm font-semibold text-tag-orange-text">需要关注（2项）</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {SAFETY_RISK_TYPES.slice(0, 2).map((riskType) => {
                          const calibration = manualCalibrations[riskType.id];
                          const indicators = calibration ? calibration.calibratedIndicators : riskType.indicators;
                          return (
                            <div key={riskType.id} className="bg-bg-overlay border border-stroke-border rounded-xl p-4 hover:border-divider transition-colors">
                              <div className="flex items-center justify-start gap-1.5 pb-2.5 mb-3 border-b border-divider-light">
                                <span className="text-sm font-semibold text-text-title">{riskType.name}</span>
                                {calibration && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-tag-green-bg text-tag-green-text text-[10px] rounded-full">
                                    人工校准
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                {indicators.map((indicator, idx) => {
                                  const statusColor = indicator.status === 'green' ? 'text-tag-green-text' : indicator.status === 'orange' ? 'text-tag-orange-text' : 'text-red-600';
                                  const StatusIcon = indicator.status === 'green' ? CheckCircle2 : AlertCircle;
                                  return (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                      <span className="text-text-caption">{indicator.label}</span>
                                      <div className="w-24 flex items-center gap-1.5">
                                        <span className={`${statusColor} font-medium flex items-center gap-1.5`}>
                                          <StatusIcon size={14} />
                                          {indicator.value}
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
                    </div>
                    {/* Stable Group */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-tag-green-text" />
                          <span className="text-sm font-semibold text-tag-green-text">运行平稳（6项）</span>
                        </div>
                        <button 
                          onClick={toggleAllStableCards}
                          className="text-xs text-text-body hover:underline font-medium"
                        >
                          {expandedStableCards.length === SAFETY_RISK_TYPES.slice(2).length ? '全部收起' : '全部展开'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                        {SAFETY_RISK_TYPES.slice(2).map(riskType => {
                          const calibration = manualCalibrations[riskType.id];
                          const indicators = calibration ? calibration.calibratedIndicators : riskType.indicators;
                          const isExpanded = expandedStableCards.includes(riskType.id);
                          return (
                            <div 
                              key={riskType.id} 
                              className="bg-bg-overlay border border-stroke-border rounded-xl p-3 flex flex-col cursor-pointer hover:border-divider transition-all duration-200"
                              onClick={() => toggleStableCard(riskType.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-text-title">{riskType.name}</span>
                                      {calibration && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 bg-tag-green-bg text-tag-green-text text-[10px] rounded-full">
                                          人工校准
                                        </span>
                                      )}
                                    </div>
                                  {!isExpanded && (
                                    <span className="text-[11px] text-text-caption flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-tag-green-text"></span>
                                      {indicators.map(i => i.value).join(' / ')}
                                    </span>
                                  )}
                                </div>
                                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown size={16} className="text-text-placeholder" />
                                </motion.div>
                              </div>
                              
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-2.5 mt-2.5 border-t border-divider-light flex flex-col gap-2">
                                      {indicators.map((indicator, idx) => {
                                        const statusColor = indicator.status === 'green' ? 'text-tag-green-text' : indicator.status === 'orange' ? 'text-tag-orange-text' : 'text-red-600';
                                        const StatusIcon = indicator.status === 'green' ? CheckCircle2 : AlertCircle;
                                        return (
                                          <div key={idx} className="flex items-center justify-between text-xs">
                                            <span className="text-text-caption">{indicator.label}</span>
                                            <div className="w-24 flex items-center gap-1.5">
                                              <span className={`${statusColor} font-medium flex items-center gap-1.5`}>
                                                <StatusIcon size={14} />
                                                {indicator.value}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Rectification Progress Card */}
                <section id="card-rectification" ref={rectificationRef} className="bg-bg-overlay rounded-xl border border-divider-light overflow-hidden">
                  <div className="pt-4 px-4 pb-0 flex items-center justify-between">
                    <h3 className="text-base font-medium text-text-title">整改进度</h3>
                  </div>
                  
                  {/* Rectification Goal */}
                  <div className="mx-4 mt-4 p-4 border border-stroke-border rounded-xl">
                    <h4 className="text-sm font-semibold text-text-title mb-2">整改目标</h4>
                    <p className="text-sm text-text-body leading-relaxed">
                      确保园区安全风险得到有效管控，通过系统性整改措施，将所有风险项的安全状态提升至绿灯水平。重点关注出入风险、消防风险和客诉风险三大核心领域，在2026年第二季度前完成全部整改任务，建立长效安全管理机制，保障园区人员和财产安全。
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="px-4 py-3 flex flex-wrap items-center gap-3">
                    {['风险类型', '安全状态', '整改进度'].map(filter => (
                      <div key={filter} className="relative">
                        <div 
                          className={`flex items-center gap-1 px-3 py-1.5 border rounded-lg cursor-pointer transition-all min-w-[120px] ${
                            dropdownOpen === filter ? 'border-primary text-text-body' : 'border-divider hover:border-text-placeholder'
                          }`}
                          onClick={() => setDropdownOpen(dropdownOpen === filter ? null : filter)}
                        >
                          <span className="text-sm flex-1">{filter}</span>
                          <ChevronDown size={16} className={`transition-transform ${dropdownOpen === filter ? 'rotate-180' : ''}`} />
                        </div>
                        <AnimatePresence>
                          {dropdownOpen === filter && (
                            <motion.div 
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-white border border-divider rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto"
                            >
                              <div className="p-1">
                                <div className="px-3 py-2 text-sm text-text-body bg-primary/10 rounded-lg cursor-pointer">不限</div>
                                <div className="px-3 py-2 text-sm hover:bg-bg-content-base rounded-lg cursor-pointer">选项 1</div>
                                <div className="px-3 py-2 text-sm hover:bg-bg-content-base rounded-lg cursor-pointer">选项 2</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    <button className="text-sm text-text-placeholder hover:text-text-body transition-colors">重置</button>
                  </div>

                  {/* Table */}
                  <div className="px-4 pb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-bg-content-base border-b border-divider">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">风险类型</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">安全状态</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">归因分析</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">整改方案</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">整改进度</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">整改责任人</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">计划完成时间</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">整改完成时间</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-caption uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RECTIFICATION_DATA.map(row => (
                          <React.Fragment key={row.id}>
                            <tr className="hover:bg-bg-content-base transition-colors border-b border-divider-light">
                              <td className="px-4 py-3 text-sm text-text-body">
                                <div className="flex items-center gap-2">
                                  <button 
                                    className={`w-5 h-5 flex items-center justify-center transition-transform ${expandedRows.includes(row.id) ? 'rotate-90' : ''}`}
                                    onClick={() => toggleRow(row.id)}
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                                  {row.type}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-text-body">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${
                                    row.status === 'red' ? 'bg-status-red' : row.status === 'yellow' ? 'bg-status-yellow' : 'bg-status-green'
                                  }`} />
                                  {row.status === 'red' ? '红灯' : row.status === 'yellow' ? '黄灯' : '绿灯'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-text-body">{row.analysis}</td>
                              <td className="px-4 py-3 text-sm text-text-body"></td>
                              <td className="px-4 py-3 text-sm text-text-body"><StatusBadge type={row.progress} /></td>
                              <td className="px-4 py-3 text-sm text-text-body"></td>
                              <td className="px-4 py-3 text-sm text-text-body"></td>
                              <td className="px-4 py-3 text-sm text-text-body">{row.finishDate || ''}</td>
                              <td className="px-4 py-3 text-sm text-text-body"></td>
                            </tr>
                            <AnimatePresence>
                              {expandedRows.includes(row.id) && row.children?.map(child => (
                                <motion.tr 
                                  key={child.id}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-bg-content-base/50 border-b border-divider-light"
                                >
                                  <td className="px-4 py-3 text-sm text-text-body pl-10"></td>
                                  <td className="px-4 py-3 text-sm text-text-body"></td>
                                  <td className="px-4 py-3 text-sm text-text-body">{child.analysis}</td>
                                  <td className="px-4 py-3 text-sm text-text-body">{child.solution}</td>
                                  <td className="px-4 py-3 text-sm text-text-body"><StatusBadge type={child.progress} /></td>
                                  <td className="px-4 py-3 text-sm text-text-body">
                                    <div className="flex items-center gap-1.5">
                                      <Users size={14} className="text-text-caption" />
                                      {child.owner}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-text-body cursor-pointer hover:text-primary">{child.planDate}</td>
                                  <td className="px-4 py-3 text-sm text-text-body">{child.finishDate || '-'}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <button className="text-primary font-medium hover:underline">查看详情</button>
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
              </section>

                {/* Risk Assessment Card */}
                <section id="card-risk" ref={riskRef} className="bg-bg-overlay rounded-xl border border-divider-light overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <h3 className="text-base font-medium text-text-title">风险评估</h3>
                    <button onClick={() => openRiskDrawer(riskTabs[activeRiskTab])} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary rounded-lg text-primary text-sm font-medium hover:bg-divider-light transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10.2506 4.22599L10.2467 4.22234L10.4623 4.0067C10.6897 3.77932 10.6902 3.41081 10.4634 3.18283L8.46015 1.16901L8.45906 1.16792C8.23126 0.940119 7.86191 0.940119 7.63411 1.16792L7.22271 1.57932L7.22845 1.58509L1.16797 7.69221V9.91705C1.16797 10.2392 1.42914 10.5004 1.7513 10.5004H3.97615L10.2506 4.22599ZM8.34127 4.4529L7.16606 3.27768L8.03296 2.39383L9.21313 3.5802L8.34127 4.4529ZM6.3491 4.11064L7.51672 5.27827L3.48411 9.31476H3.48233L2.35361 8.18603V8.18425L6.3491 4.11064Z" fill="#1456F0"/>
                        <path d="M1.7513 11.6671C1.42914 11.6671 1.16797 11.9282 1.16797 12.2504C1.16797 12.5726 1.42914 12.8337 1.7513 12.8337H12.2513C12.5735 12.8337 12.8346 12.5726 12.8346 12.2504C12.8346 11.9282 12.5735 11.6671 12.2513 11.6671H1.7513Z" fill="#1456F0"/>
                      </svg>
                      编辑
                    </button>
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
                      该园区存在三大安全风险：一是出入风险，园区由商场改建，出入口近 200 个，外部人员尾随误入频繁，已通过增设固定岗、闸机、监控探头及报警联动机制应对；二是客诉风险，因外墙 Logo 及地图标注为 "总部"，承接北京区域 53% 客诉量，极端闹访易引发舆情，已组建防暴队并配合警方分流引导处置；三是消防风险，外围设施距主楼较远，应急响应超 5 分钟，已前置 AED 和急救包、扩充持证急救人员并开展针对性培训。整体采用人防、技防、物防与管理机制四位一体防控。
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
                            <h4 className="text-base font-bold text-text-title mb-2">{data.name}</h4>
                            <p className="text-sm text-text-caption mb-6">更新时间：{data.updateTime}</p>

                            <div className="mb-8">
                              <h5 className="text-sm font-bold text-text-title mb-3">风险特征</h5>
                              <div dangerouslySetInnerHTML={{ __html: data.riskFeatures }} />
                            </div>

                            <div>
                              <h5 className="text-sm font-bold text-text-title mb-3">防护手段</h5>
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
                      <h3 className="text-base font-medium text-text-title">办公室信息</h3>
                      {hasEditPermission && (
                        <button 
                          onClick={openOfficeDrawer}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary rounded-lg text-primary text-sm font-medium hover:bg-divider-light transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M10.2506 4.22599L10.2467 4.22234L10.4623 4.0067C10.6897 3.77932 10.6902 3.41081 10.4634 3.18283L8.46015 1.16901L8.45906 1.16792C8.23126 0.940119 7.86191 0.940119 7.63411 1.16792L7.22271 1.57932L7.22845 1.58509L1.16797 7.69221V9.91705C1.16797 10.2392 1.42914 10.5004 1.7513 10.5004H3.97615L10.2506 4.22599ZM8.34127 4.4529L7.16606 3.27768L8.03296 2.39383L9.21313 3.5802L8.34127 4.4529ZM6.3491 4.11064L7.51672 5.27827L3.48411 9.31476H3.48233L2.35361 8.18603V8.18425L6.3491 4.11064Z" fill="#1456F0"/>
                            <path d="M1.7513 11.6671C1.42914 11.6671 1.16797 11.9282 1.16797 12.2504C1.16797 12.5726 1.42914 12.8337 1.7513 12.8337H12.2513C12.5735 12.8337 12.8346 12.5726 12.8346 12.2504C12.8346 11.9282 12.5735 11.6671 12.2513 11.6671H1.7513Z" fill="#1456F0"/>
                          </svg>
                          编辑
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-text-title mb-4">基础信息</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-text-caption mb-1">办公室建成年份</p>
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

                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-text-title mb-4">人员分布</h4>
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

                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-text-title mb-4">特殊空间</h4>
                      <div className="flex flex-wrap gap-2">
                        {['KP区域', '实验室', 'EMDF机房', 'IDF机房', '开火厨房', '储藏室'].map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary/10 text-text-body rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-text-title mb-4">应急资源</h4>
                      
                      <div className="mb-6">
                        <h5 className="text-sm font-medium text-text-title mb-3">周边消防队</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {officeInfo.emergencyResources.fireStations.map(station => (
                            <div key={station.id} className="border border-divider-light rounded-lg overflow-hidden">
                              <div className="bg-bg-content-base px-4 py-3 border-b border-divider-light">
                                <h6 className="text-sm font-bold text-text-title">{station.name}</h6>
                              </div>
                              <div className="p-4 space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">距离：</span>
                                  <span className="text-sm text-text-body">{station.distance} km</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">地址：</span>
                                  <span className="text-sm text-text-body">{station.address}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">电话：</span>
                                  <span className="text-sm text-text-body">{station.phone}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">车程：</span>
                                  <span className="text-sm text-text-body">预估车程 {station.driveTime} 分钟</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-sm font-medium text-text-title mb-3">周边医院</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {officeInfo.emergencyResources.hospitals.map(hospital => (
                            <div key={hospital.id} className="border border-divider-light rounded-lg overflow-hidden">
                              <div className="bg-bg-content-base px-4 py-3 border-b border-divider-light">
                                <h6 className="text-sm font-bold text-text-title">{hospital.name}</h6>
                              </div>
                              <div className="p-4 space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">距离：</span>
                                  <span className="text-sm text-text-body">{hospital.distance} km</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">地址：</span>
                                  <span className="text-sm text-text-body">{hospital.address}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">电话：</span>
                                  <span className="text-sm text-text-body">{hospital.phone}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">车程：</span>
                                  <span className="text-sm text-text-body">预估车程 {hospital.driveTime} 分钟</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-text-title mb-3">周边派出所</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {officeInfo.emergencyResources.policeStations.map(station => (
                            <div key={station.id} className="border border-divider-light rounded-lg overflow-hidden">
                              <div className="bg-bg-content-base px-4 py-3 border-b border-divider-light">
                                <h6 className="text-sm font-bold text-text-title">{station.name}</h6>
                              </div>
                              <div className="p-4 space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">距离：</span>
                                  <span className="text-sm text-text-body">{station.distance} km</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">地址：</span>
                                  <span className="text-sm text-text-body">{station.address}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">电话：</span>
                                  <span className="text-sm text-text-body">{station.phone}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-sm text-text-caption shrink-0">车程：</span>
                                  <span className="text-sm text-text-body">预估车程 {station.driveTime} 分钟</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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
                            ? 'bg-primary text-white'
                            : 'bg-bg-content-base text-text-body hover:bg-divider-light'
                        }`}
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

                <div className="p-4 border-b border-divider-light">
                  <label className="text-sm font-medium text-text-title mb-2 block">选择风险类型</label>
                  <div className="flex flex-wrap gap-2">
                    {SAFETY_RISK_TYPES.map((riskType) => {
                      const hasCalibration = !!manualCalibrations[riskType.id];
                      return (
                        <button
                          key={riskType.id}
                          onClick={() => switchCalibratingRiskType(riskType.id)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                            calibratingRiskTypeId === riskType.id
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-text-body border-divider-light hover:border-primary/50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {riskType.name}
                            {hasCalibration && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-tag-green-bg text-tag-green-text text-[10px] rounded-full">
                                人工校准
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {(() => {
                    const currentCalibration = manualCalibrations[calibratingRiskTypeId];
                    const currentRiskType = SAFETY_RISK_TYPES.find(r => r.id === calibratingRiskTypeId);
                    return (
                      <div className="space-y-4">
                        {currentCalibration && (
                          <div className="p-3 bg-tag-green-bg/30 border border-tag-green-bg rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 bg-tag-green-bg text-tag-green-text text-xs rounded-full">
                                  人工校准
                                </span>
                                <span className="text-xs text-text-caption">校准时间：{currentCalibration.calibratedAt}</span>
                              </div>
                              <button
                                onClick={() => deleteCalibration(calibratingRiskTypeId)}
                                className="text-xs text-red-500 hover:text-red-600 transition-colors"
                              >
                                删除校准
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <h3 className="text-base font-bold text-text-title">
                          {currentRiskType?.name}
                        </h3>
                        
                        <div className="space-y-3">
                          {calibratingIndicators.map((indicator, index) => (
                            <div key={index} className="p-4 bg-bg-content-base rounded-lg border border-divider-light">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-text-title">{indicator.label}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateIndicatorStatus(index, 'green')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                      indicator.status === 'green'
                                        ? 'bg-status-green border-status-green'
                                        : 'bg-white border-divider-light hover:border-status-green'
                                    }`}
                                  >
                                    {indicator.status === 'green' && <CheckCircle2 size={16} className="text-white" />}
                                  </button>
                                  <button
                                    onClick={() => updateIndicatorStatus(index, 'orange')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                      indicator.status === 'orange'
                                        ? 'bg-status-orange border-status-orange'
                                        : 'bg-white border-divider-light hover:border-status-orange'
                                    }`}
                                  >
                                    {indicator.status === 'orange' && <AlertCircle size={16} className="text-white" />}
                                  </button>
                                  <button
                                    onClick={() => updateIndicatorStatus(index, 'red')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                      indicator.status === 'red'
                                        ? 'bg-status-red border-status-red'
                                        : 'bg-white border-divider-light hover:border-status-red'
                                    }`}
                                  >
                                    {indicator.status === 'red' && <AlertCircle size={16} className="text-white" />}
                                  </button>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={indicator.value}
                                onChange={(e) => updateIndicatorValue(index, e.target.value)}
                                className="w-full px-3 py-2 border border-divider-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="输入指标值"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
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
                  <h2 className="text-lg font-bold text-text-title">编辑办公室信息</h2>
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
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-text-title mb-4">基础信息</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-text-title mb-2 block">办公室建成年份</label>
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
                      <h3 className="text-base font-bold text-text-title mb-4">应急资源</h3>
                      
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-text-title">周边消防队</h4>
                          <button
                            onClick={() => addEmergencyResource('fireStations')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 1.1665C7.3866 1.1665 7.7 1.4799 7.7 1.8665V6.30017H12.1337C12.5203 6.30017 12.8337 6.61357 12.8337 7.00017C12.8337 7.38677 12.5203 7.70017 12.1337 7.70017H7.7V12.1338C7.7 12.5204 7.3866 12.8338 7 12.8338C6.6134 12.8338 6.3 12.5204 6.3 12.1338V7.70017H1.86633C1.47973 7.70017 1.16633 7.38677 1.16633 7.00017C1.16633 6.61357 1.47973 6.30017 1.86633 6.30017H6.3V1.8665C6.3 1.4799 6.6134 1.1665 7 1.1665Z" fill="#1456F0"/>
                            </svg>
                            新增
                          </button>
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
                          <button
                            onClick={() => addEmergencyResource('hospitals')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 1.1665C7.3866 1.1665 7.7 1.4799 7.7 1.8665V6.30017H12.1337C12.5203 6.30017 12.8337 6.61357 12.8337 7.00017C12.8337 7.38677 12.5203 7.70017 12.1337 7.70017H7.7V12.1338C7.7 12.5204 7.3866 12.8338 7 12.8338C6.6134 12.8338 6.3 12.5204 6.3 12.1338V7.70017H1.86633C1.47973 7.70017 1.16633 7.38677 1.16633 7.00017C1.16633 6.61357 1.47973 6.30017 1.86633 6.30017H6.3V1.8665C6.3 1.4799 6.6134 1.1665 7 1.1665Z" fill="#1456F0"/>
                            </svg>
                            新增
                          </button>
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
                          <button
                            onClick={() => addEmergencyResource('policeStations')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 1.1665C7.3866 1.1665 7.7 1.4799 7.7 1.8665V6.30017H12.1337C12.5203 6.30017 12.8337 6.61357 12.8337 7.00017C12.8337 7.38677 12.5203 7.70017 12.1337 7.70017H7.7V12.1338C7.7 12.5204 7.3866 12.8338 7 12.8338C6.6134 12.8338 6.3 12.5204 6.3 12.1338V7.70017H1.86633C1.47973 7.70017 1.16633 7.38677 1.16633 7.00017C1.16633 6.61357 1.47973 6.30017 1.86633 6.30017H6.3V1.8665C6.3 1.4799 6.6134 1.1665 7 1.1665Z" fill="#1456F0"/>
                            </svg>
                            新增
                          </button>
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
      </div>
    </div>
  );
}
