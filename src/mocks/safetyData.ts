import type { SafetyRiskType, RiskAssessmentData, OfficeInfo } from '../types';

export const SAFETY_RISK_TYPES: SafetyRiskType[] = [
  {
    id: 'entry', name: '出入安全', indicators: [
      { label: '闯入事件量级', value: '≥ 2 次', status: 'red' },
      { label: '闯入报警响应时效', value: '达标', status: 'green' },
    ],
  },
  {
    id: 'fire', name: '消防安全', indicators: [
      { label: '明火事件量级', value: '0次', status: 'green' },
      { label: '疏散演习用时', value: '3分钟', status: 'green' },
      { label: '消防手续完备性', value: '完备', status: 'green' },
      { label: '消防审计合规率', value: '< 60%', status: 'red' },
    ],
  },
  {
    id: 'personal', name: '人身安全', indicators: [
      { label: '急救响应时效', value: '达标', status: 'green' },
      { label: '急救响应质量', value: '达标', status: 'green' },
    ],
  },
  {
    id: 'complaint', name: '客诉', indicators: [
      { label: '安保处置行为', value: '处置得当', status: 'green' },
      { label: '职场伤亡/舆情后果', value: '无/轻度后果', status: 'green' },
    ],
  },
  {
    id: 'disaster', name: '极端天气/自然灾害', indicators: [
      { label: '应急预警识别', value: '全部识别', status: 'green' },
      { label: '检查表单时效', value: '时效达标', status: 'green' },
      { label: '灾害后果严重性', value: '无/轻度后果', status: 'green' },
    ],
  },
  {
    id: 'traffic', name: '交通事故/拥堵', indicators: [
      { label: '交通设施与动线规划', value: '合理', status: 'green' },
      { label: '交通管理方案合理性', value: '合理', status: 'green' },
      { label: '交通方案执行情况', value: '执行合格', status: 'green' },
      { label: '交通事故伤亡后果', value: '无/轻度后果', status: 'green' },
    ],
  },
  {
    id: 'order', name: '办公/园区秩序', indicators: [
      { label: '冲突/治安后果', value: '无/轻度后果', status: 'green' },
      { label: '应急预案执行情况', value: '符合流程', status: 'green' },
    ],
  },
  {
    id: 'property', name: '财产损失', indicators: [
      { label: '单次经济损失金额', value: '≤ 10万', status: 'green' },
      { label: '核心机密资产丢失', value: '未丢失', status: 'green' },
    ],
  },
];

export const RISK_TABS = ['出入安全', '消防安全', '人身安全', '客诉', '极端天气/自然灾害', '交通事故/拥堵', '办公/园区秩序', '财产损失'];

export const RISK_TYPE_TO_RECTIFICATION_MAP: Record<string, string> = {
  '出入安全': '出入风险',
  '消防安全': '消防风险',
};

export const INITIAL_RISK_ASSESSMENT_DATA: Record<string, RiskAssessmentData> = {
  '出入安全': {
    name: '出入安全',
    riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">北京大钟寺广场为开放式自持园区，现运营的C座和D座由商场改造成的办公室，楼宇布局复杂，需要防范的出入口数量接近200个，其中全员可通行出入口数共42个，包括23个无安保值守出入口，和14个临近商业区域出入口，外部人员（外卖、顾客、代驾等）尾随误入风险高。</p><p class="text-sm text-text-body leading-relaxed">9-11月大钟寺现场响应各类闯入报警（尾随、强开等）共2191次，外部人员真实闯入事件共10起，其中9起均为商业区域人员误入。</p>',
    protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">管控措施：对远程和现场响应安保人员定期开展出入管理专项培训和模拟演练，持续提升异常人员识别、追踪和拦截能力；临近商业出入口位置增加更为醒目的办公区域提示和商业区域引导标识，降低误入风险；增加周界门检查和测试频次，发现设备异常及时同步技防团队跟进维修。</p><p class="text-sm text-text-body leading-relaxed mb-2">人防配置：对临近商业区域且高频（月均大于3起）发生外部人员误入工区事件（如D座B2层餐厅、B1层4号电梯厅入口等），在工作时间增设2名安保固定岗值守；通行高峰期间安排巡视岗支持临近商业区的无安保值守出入口身份查验。</p><p class="text-sm text-text-body leading-relaxed mb-2">技防配置：大钟寺园区共配置矮闸机7组、高闸机10组、平开门禁7个、旋转门15组、刷卡立柱3个，以实现防线二技术手段管控；大钟寺园区共安装3,472个监控探头，可有效追踪或回查闯入人员行动轨迹。</p><p class="text-sm text-text-body leading-relaxed">人技联动：通过人/技防联动，落实闯入报警响应机制，实现安保快速响应、追踪和拦截外部入侵人员。</p>',
    updateTime: '2026-03-15 10:00',
  },
  '消防安全': {
    name: '消防安全',
    riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">固有消防风险：大钟寺C座和D座均为高层建筑（据建筑防火设计规范，超过24米的非单层公共建筑为高层建筑），且均设有中庭，建筑火灾竖向蔓延速度快，人员垂直疏散距离长，疏散困难，外部救援难度大。</p><p class="text-sm text-text-body leading-relaxed mb-2">主要消防风险：大钟寺C座和D座均配置了位于地下的餐饮楼层，电气设备数量多，电气火灾风险较高；建筑内的厨房均使用天然气，存在燃气泄漏的消防风险；地下车库设有电动车充电桩，电动车起火扑救难度大。</p><p class="text-sm text-text-body leading-relaxed">其它消防风险：大钟寺楼内隐蔽空间较多，隐蔽空间存在堆物风险；园区处于边运营、边施工建设阶段，运营与施工风险叠加易引发消防安全风险。</p>',
    protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">固有风险防护：保障消防设施的正常运行，大钟寺配置了两名维保人员日间常驻现场，夜间15分钟响应，2小时到达现场，能够确保当消防设施出现故障时及时维修；组织同学进行全楼疏散演习，确保同学熟悉疏散路径，掌握疏散知识。</p><p class="text-sm text-text-body leading-relaxed mb-2">主要风险防护：组织餐饮供应商进行每日和每周防火巡查，定期检查电气设施和燃气设施的运行状态；制定地下车库新能源汽车火灾扑救方案，采购并补充推车式水基型灭火器等初期灭火工具，完善充电桩配电设施过载、故障断电等安全保护功能。</p><p class="text-sm text-text-body leading-relaxed mb-2">其它风险防护：定期组织隐蔽空间的联合巡检，及时消除隐患；消防运营团队在做好日常运营管理的同时，与地产团队配合将新建区域消防设备设施接入消防系统，施工完成前三个月消防团队开始介入检查，监督总包整改，最终验收阶段消防团队负责承接查验，降低运营和施工交接区域的消防风险。</p><p class="text-sm text-text-body leading-relaxed mb-2">消防人力配置：大钟寺E栋设置一个集中消防控制室，全年24h双人值班，每班2人，值班人员均持证上岗(中级消防设施操作员证书)；人员配置13人：管理岗1人（消防主管）、技术员4人（消防技术员）、操作员8人。</p><p class="text-sm text-text-body leading-relaxed mb-2">安保兼职消防队：大钟寺兼职微消队共计118人（含安全经理2人，领班7人）：其中1号楼61人，2号楼57人，满足24H不间断值岗，每班不少于20人要求；每月度内部演练比赛，每季度组织开展消防应急培训演练。</p><p class="text-sm text-text-body leading-relaxed mb-2">消防系统/设施：大钟寺园区配有功能良好的消防系统和末端设备，主要包括火灾自动报警系统、电气火灾监控系统、消防电源监控系统、消火栓系统、自动喷水灭火系统、防排烟系统、防火门监控系统、气体灭火系统、疏散指示应急照明系统、燃气报警系统、厨房灭火系统、防火分隔设施（防火卷帘、挡烟垂壁）共12类。</p><p class="text-sm text-text-body leading-relaxed">微型消防站物资：大钟寺园区配有消防器材柜共3个：C座/D座和E座（消防中控室）各配置1套消防器材柜；消防应急包6套，C座和D座各配置3套，含防毒面具、应急手电、灭火器等，配置在现场安保值班室，以及B3和B4层车库岗亭内。</p>',
    updateTime: '2026-03-15 10:00',
  },
  '人身安全': {
    name: '人身安全',
    riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">大钟寺园区部分配套设施（停车场、穿梭车站等）位于园区外围，距离办公楼宇较远，现有工区SOS资源难以确保园区周边紧急医疗事件的内部响应时效（&lt;4mins到场）。</p><p class="text-sm text-text-body leading-relaxed">9-11月大钟寺园区外围SOS医疗响应事件共3起（其中中风险2起、低风险1起），平均响应时效&gt;5mins。</p>',
    protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">管控措施：通过不断开展专项培训和实操演练，持续提升SOS值班号的沟通技巧和现场安保的急救响应能力，确保能够快速且准确获取求救人员的位置信息，提升安保响应效率；外围固定岗位增配AED+FAK，可快速取用响应园区周边紧急医疗需求，保障响应时效。</p><p class="text-sm text-text-body leading-relaxed mb-2">SOS组员配置：C座（1号楼）SOS小组正式成员14人，预备3人，一共17人；D座（2号楼）SOS小组正式成员15人，预备9人，一共24人。</p><p class="text-sm text-text-body leading-relaxed mb-2">安保配置：C座（1号楼）持有急救证保安共29人（安保员25人，管理岗4人）；D座（2号楼）持有急救证保安共27人（安保员22人，管理岗5人）。</p><p class="text-sm text-text-body leading-relaxed">SOS物资配置：C座（1号楼）配置AED和FAK各13个；D座（2号楼）配置AED和FAK各11个。</p>',
    updateTime: '2026-03-15 10:00',
  },
  '客诉': {
    name: '客诉',
    riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">外墙悬挂多个字节相关业务logo，百度/高德地图中均显示"总部"字样，被外界认为是抖音北京总部，导致客诉量大，9-11月大钟寺现场共接待客诉事件425起，承接北京区域53%的客诉量，其中涉及堵门、拉横幅等中风险及以上客诉事件3起，虽风险客诉会引导至临近盈都职场处置，但仍有部分人员会折返回大钟寺采取闹访、滞留等手段施压，且园区内配有"1733商业区"，人流量大，舆情风险高。</p><p class="text-sm text-text-body leading-relaxed">引导至盈都职场原因：大钟寺园区人流量大、临近三环辅路，发生极端闹访事件易引起政府关注，盈都距离大钟寺步行10分钟，位置相对偏僻，人流量小，风险可控。</p>',
    protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">管控措施：培养并推荐更多高潜力保安参与兼职客诉经理认证培训和评估，着力提升现场客诉接待沟通能力；季度开展对现有安保人员的极端客诉应急响应培训和实操演练，持续提升现场突发事件处置能力；与PA、属地派出所紧密配合，闹访案件明确告诫客诉人前往盈都职场处理。</p><p class="text-sm text-text-body leading-relaxed mb-2">人防配置：临近的方恒职场常驻1名客诉经理，大钟寺现场常驻3名安保认证兼职客诉岗；大钟寺C/D座可抽掉各4名巡视岗和1名管理岗响应各类突发事件；防暴队伍共计20人，分为2队，均接受过属地公安机关的防暴培训和联合演练。</p><p class="text-sm text-text-body leading-relaxed mb-2">物资配置：配置防暴柜共4组，各类防暴器材50个，伞式警示围挡20组。</p><p class="text-sm text-text-body leading-relaxed mb-2">线下管控：安保及时使用围挡（或黑伞）对极端行为进行遮挡，阻止拍摄；安保对周围警戒，疏散围观人员，礼貌劝止拍摄；当客诉人员执意不删除拍摄内容，及时同步警方，劝导客诉人员删除。</p><p class="text-sm text-text-body leading-relaxed">线上联动：实时同步PR，对园区进行电子围栏布控，及时监控并处置舆情。</p>',
    updateTime: '2026-03-15 10:00',
  },
  '极端天气/自然灾害': {
    name: '极端天气/自然灾害',
    riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">极端天气风险：北京地区夏季多暴雨、雷电等极端天气，冬季多暴雪、大风等极端天气，可能对园区运营造成影响。</p><p class="text-sm text-text-body leading-relaxed">自然灾害风险：园区地处地震带边缘，存在地震风险；周边地势较低，存在内涝风险。</p>',
    protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">预警识别：建立极端天气预警机制，与气象部门保持实时联动，确保及时识别各类极端天气预警。</p><p class="text-sm text-text-body leading-relaxed mb-2">应急预案：制定极端天气和自然灾害应急预案，定期组织应急演练，确保人员熟悉应急处置流程。</p><p class="text-sm text-text-body leading-relaxed mb-2">物资储备：储备必要的应急物资，包括防汛物资、防寒物资、应急照明设备等。</p>',
    updateTime: '2026-03-15 10:00',
  },
  '交通事故/拥堵': {
    name: '交通事故/拥堵',
    riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">交通拥堵：园区临近三环辅路，早晚高峰期间交通拥堵严重，员工通勤和访客来访受影响。</p><p class="text-sm text-text-body leading-relaxed">交通事故：园区周边车流量大，存在交通事故风险；园区内停车位紧张，车辆剐蹭时有发生。</p>',
    protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">交通规划：合理规划园区交通设施和动线，确保车流和人流有序通行。</p><p class="text-sm text-text-body leading-relaxed mb-2">交通管理：制定合理的交通管理方案，安排专人指挥交通，确保高峰期通行顺畅。</p><p class="text-sm text-text-body leading-relaxed mb-2">安保执行：加强安保人员交通管理培训，确保交通管理方案有效执行。</p>',
    updateTime: '2026-03-15 10:00',
  },
  '办公/园区秩序': {
    name: '办公/园区秩序',
    riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">吸烟违规：部分员工在非吸烟区吸烟，存在火灾隐患，影响办公环境。</p><p class="text-sm text-text-body leading-relaxed">噪音干扰：办公区噪音超标，影响员工工作效率，易引发矛盾冲突。</p>',
    protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">人防配置：加强巡逻检查，在重点区域设置禁烟标识，安排专人劝阻违规行为。</p><p class="text-sm text-text-body leading-relaxed">管理措施：制定办公区秩序管理制度，开展文明办公宣传，建立违规举报机制。</p>',
    updateTime: '2026-03-15 10:00',
  },
  '财产损失': {
    name: '财产损失',
    riskFeatures: '<p class="text-sm text-text-body leading-relaxed mb-2">资产丢失：园区面积大，出入口多，存在贵重物品丢失风险。</p><p class="text-sm text-text-body leading-relaxed">监控盲区：部分区域监控覆盖不足，发生事件后难以追溯。</p>',
    protectionMeasures: '<p class="text-sm text-text-body leading-relaxed mb-2">技防配置：全量覆盖 3472 个监控探头，定期检查监控设备运行状态。</p><p class="text-sm text-text-body leading-relaxed">管理措施：建立资产登记管理制度，加强贵重物品保管，定期开展安全巡查。</p>',
    updateTime: '2026-03-15 10:00',
  },
};

export const INITIAL_OFFICE_INFO: OfficeInfo = {
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
      { id: 'fire-3', name: '五道口消防救援站', distance: '3.1', address: '海淀区成府路28号', phone: '010-62355119', driveTime: '8 ～ 12' },
    ],
    hospitals: [
      { id: 'hospital-1', name: '北京大学口腔医院', distance: '0.8', address: '海淀区中关村南大街22号', phone: '010-62179977', driveTime: '2 ～ 4' },
      { id: 'hospital-2', name: '北京博爱医院', distance: '1.5', address: '海淀区皂君庙路10号', phone: '010-62266666', driveTime: '4 ～ 6' },
      { id: 'hospital-3', name: '中关村医院', distance: '2.0', address: '海淀区中关村南路12号', phone: '010-62553000', driveTime: '5 ～ 8' },
      { id: 'hospital-4', name: '海淀医院', distance: '2.8', address: '海淀区中关村大街29号', phone: '010-82693000', driveTime: '7 ～ 12' },
    ],
    policeStations: [
      { id: 'police-1', name: '大钟寺派出所', distance: '0.6', address: '海淀区皂君庙路5号', phone: '010-62255110', driveTime: '2 ～ 3' },
      { id: 'police-2', name: '中关村派出所', distance: '1.8', address: '海淀区中关村大街27号', phone: '010-62555110', driveTime: '4 ～ 7' },
      { id: 'police-3', name: '五道口派出所', distance: '2.5', address: '海淀区成府路28号', phone: '010-62355110', driveTime: '6 ～ 10' },
      { id: 'police-4', name: '海淀派出所', distance: '3.2', address: '海淀区海淀大街30号', phone: '010-62655110', driveTime: '8 ～ 14' },
    ],
  },
};
