import React, { useState, useCallback } from 'react';
import { Notice, Button, Tag, Input, Tooltip } from '@universe-design/react';
import ReportFilled from '@universe-design/icons-react/ReportFilled';
import YesFilled from '@universe-design/icons-react/YesFilled';
import CloseOutlined from '@universe-design/icons-react/CloseOutlined';
import LeftOutlined from '@universe-design/icons-react/LeftOutlined';
import AddOutlined from '@universe-design/icons-react/AddOutlined';
import { motion, AnimatePresence } from 'motion/react';
import type { SafetyRiskType, ManualCalibration } from '../types';

type RiskStatus = 'red' | 'orange' | 'green';
type ViewMode =
  | { type: 'overview' }
  | { type: 'edit'; riskId: string }
  | { type: 'detail'; riskId: string };

interface RiskCalibrationModalProps {
  visible: boolean;
  onClose: () => void;
  riskTypes: SafetyRiskType[];
  manualCalibrations: Record<string, ManualCalibration>;
  onSaveCalibration?: (riskTypeId: string, targetStatus: RiskStatus, reason: string) => void;
  onDeleteCalibration?: (riskTypeId: string) => void;
}

/* ─── Constants ─── */

const STATUS_DOT_COLORS: Record<string, string> = {
  red: '#F54A45',
  orange: '#FF811A',
  green: '#32A645',
};

const RISK_DISPLAY_NAMES: Record<string, string> = {
  entry: '出入风险',
  fire: '消防风险',
  personal: '人身安全风险',
  complaint: '客诉风险',
  disaster: '极端天气/自然灾害风险',
  traffic: '交通事故/拥堵风险',
  order: '办公/园区秩序风险',
  property: '财产损失风险',
};

const STATUS_LABEL: Record<RiskStatus, string> = { green: '绿灯', orange: '黄灯', red: '红灯' };

const STATUS_PILL_FILL: Record<RiskStatus, { bg: string; text: string }> = {
  green: { bg: '#E4FAE1', text: '#1A7526' },
  orange: { bg: '#FFF3E5', text: '#C25705' },
  red: { bg: '#FEF0F0', text: '#E22E28' },
};

const STATUS_RANK: Record<RiskStatus, number> = { green: 0, orange: 1, red: 2 };

/* ─── Helpers ─── */

function getOverallStatus(rt: SafetyRiskType, cal?: ManualCalibration): RiskStatus {
  if (cal) return cal.calibratedStatus;
  if (rt.indicators.some((i) => i.status === 'red')) return 'red';
  if (rt.indicators.some((i) => i.status === 'orange')) return 'orange';
  return 'green';
}

function getNaturalStatus(rt: SafetyRiskType): RiskStatus {
  if (rt.indicators.some((i) => i.status === 'red')) return 'red';
  if (rt.indicators.some((i) => i.status === 'orange')) return 'orange';
  return 'green';
}

/* ─── Shared tiny components ─── */

function StatusDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span className="inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />
      </svg>
    </span>
  );
}

function FilledPill({ status }: { status: RiskStatus }) {
  const s = STATUS_PILL_FILL[status];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-sm leading-[22px]"
      style={{ width: 56, height: 32, backgroundColor: s.bg, color: s.text }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function SelectablePill({
  status,
  selected,
  onClick,
}: {
  status: RiskStatus;
  selected: boolean;
  onClick?: () => void;
}) {
  const s = STATUS_PILL_FILL[status];
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center rounded-full text-sm leading-[22px] transition-colors"
      style={{
        width: 56,
        height: 32,
        backgroundColor: selected ? s.bg : 'transparent',
        color: selected ? s.text : '#646A73',
        border: selected ? 'none' : '1px solid #D0D3D6',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {STATUS_LABEL[status]}
    </button>
  );
}

function DialogHeader({
  onBack,
  onClose,
  title,
}: {
  onBack?: () => void;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="flex items-start shrink-0" style={{ padding: '20px 12px 20px 24px' }}>
      <div className="flex-1 flex items-center pr-7" style={{ gap: 4 }}>
        {onBack && (
          <button
            onClick={onBack}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F2F3F5] transition-colors text-[#646A73]"
          >
            <LeftOutlined />
          </button>
        )}
        <h2 className="text-base font-medium text-[#1F2329] leading-6 whitespace-nowrap">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#F2F3F5] transition-colors text-[#646A73]"
      >
        <CloseOutlined />
      </button>
    </div>
  );
}

function IndicatorCard({
  riskType,
  calibration,
  actionSlot,
}: {
  riskType: SafetyRiskType;
  calibration?: ManualCalibration;
  actionSlot?: React.ReactNode;
}) {
  const status = getOverallStatus(riskType, calibration);
  const displayName = RISK_DISPLAY_NAMES[riskType.id] || riskType.name;
  const indicators = calibration ? calibration.calibratedIndicators : riskType.indicators;
  const isCalibrated = !!calibration;

  return (
    <div
      className="bg-white flex flex-col overflow-hidden rounded-xl shrink-0"
      style={{ border: '0.5px solid #DEE0E3', padding: 12, gap: 10 }}
    >
      <div className="flex items-center justify-between" style={{ height: 22 }}>
        <div className="flex items-center gap-2">
          <StatusDot color={STATUS_DOT_COLORS[status]} />
          <span className="text-sm font-medium text-[#1F2329] whitespace-nowrap">{displayName}</span>
          {isCalibrated && <Tag size="small" color="neutral">人工校准</Tag>}
        </div>
        {actionSlot}
      </div>
      <div
        className="w-full"
        style={{ height: 0.5, backgroundColor: '#DEE0E3', width: 'calc(100% + 24px)', margin: '0 -12px' }}
      />
      <div className="flex justify-between gap-4">
        <div className="flex flex-col" style={{ gap: 4 }}>
          {indicators.map((ind, idx) => (
            <span key={idx} className="text-xs text-[#1F2329] leading-5 whitespace-nowrap">{ind.label}</span>
          ))}
        </div>
        <div className="flex flex-col shrink-0" style={{ gap: 4, width: 80 }}>
          {indicators.map((ind, idx) => (
            <div key={idx} className="flex items-center leading-5" style={{ gap: 4 }}>
              <StatusDot color={STATUS_DOT_COLORS[ind.status]} />
              <span className="text-xs text-[#1F2329] whitespace-nowrap">{ind.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FormLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div style={{ paddingBottom: 6 }}>
      <span className="text-sm text-[#646A73] leading-[22px]">{label}</span>
      {required && <span className="text-sm font-medium text-[#E22E28]">*</span>}
    </div>
  );
}

/* ─── RiskCard (used in overview grid) ─── */

function RiskCard({
  riskType,
  calibration,
  onCalibrate,
  onViewDetail,
}: {
  riskType: SafetyRiskType;
  calibration?: ManualCalibration;
  onCalibrate?: () => void;
  onViewDetail?: () => void;
}) {
  const overallStatus = getOverallStatus(riskType, calibration);
  const isCalibrated = !!calibration;
  const isHighestLevel = overallStatus === 'red' && !isCalibrated;

  const action = isCalibrated ? (
    <Button type="text" size="small" color="primary" onClick={onViewDetail}>校准详情</Button>
  ) : isHighestLevel ? (
    <Tooltip title="红灯风险不可校准">
      <span><Button type="text" size="small" color="primary" disabled>校准</Button></span>
    </Tooltip>
  ) : (
    <Button type="text" size="small" color="primary" onClick={onCalibrate}>校准</Button>
  );

  return (
    <IndicatorCard riskType={riskType} calibration={calibration} actionSlot={action} />
  );
}

/* ============================================================
   VIEW 1 — Overview (list of all risks grouped by severity)
   ============================================================ */

function OverviewView({
  riskTypes,
  manualCalibrations,
  onCalibrate,
  onViewDetail,
  onClose,
}: {
  riskTypes: SafetyRiskType[];
  manualCalibrations: Record<string, ManualCalibration>;
  onCalibrate: (id: string) => void;
  onViewDetail: (id: string) => void;
  onClose: () => void;
}) {
  const grouped = React.useMemo(() => {
    const red: SafetyRiskType[] = [];
    const orange: SafetyRiskType[] = [];
    const green: SafetyRiskType[] = [];
    riskTypes.forEach((r) => {
      const s = getOverallStatus(r, manualCalibrations[r.id]);
      if (s === 'red') red.push(r);
      else if (s === 'orange') orange.push(r);
      else green.push(r);
    });
    return { red, orange, green };
  }, [riskTypes, manualCalibrations]);

  return (
    <>
      <DialogHeader title="风险校准" onClose={onClose} />

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 24px' }}>
        <div className="flex flex-col" style={{ gap: 16 }}>
          <div style={{ paddingBottom: 8 }}>
            <Notice showIcon type="info" message="仅支持将风险校准为更高风险等级，不可降级校准。" />
          </div>

          {grouped.red.length > 0 && (
            <>
              <div className="flex items-center" style={{ gap: 6 }}>
                <ReportFilled style={{ color: '#F54A45', fontSize: 16 }} />
                <span className="text-sm font-medium text-[#1F2329]">异常风险</span>
              </div>
              <div className="grid grid-cols-2" style={{ gap: 16 }}>
                {grouped.red.map((r) => (
                  <RiskCard key={r.id} riskType={r} calibration={manualCalibrations[r.id]}
                    onCalibrate={() => onCalibrate(r.id)} onViewDetail={() => onViewDetail(r.id)} />
                ))}
              </div>
            </>
          )}

          {grouped.orange.length > 0 && (
            <div className="grid grid-cols-2" style={{ gap: 16, marginBottom: 20 }}>
              {grouped.orange.map((r) => (
                <RiskCard key={r.id} riskType={r} calibration={manualCalibrations[r.id]}
                  onCalibrate={() => onCalibrate(r.id)} onViewDetail={() => onViewDetail(r.id)} />
              ))}
            </div>
          )}

          {grouped.green.length > 0 && (
            <>
              <div className="flex items-center" style={{ gap: 6, marginTop: 12 }}>
                <YesFilled style={{ color: '#32A645', fontSize: 16 }} />
                <span className="text-sm font-medium text-[#1F2329]">平稳风险</span>
              </div>
              <div className="grid grid-cols-2" style={{ gap: 16 }}>
                {grouped.green.map((r) => (
                  <RiskCard key={r.id} riskType={r} calibration={manualCalibrations[r.id]}
                    onCalibrate={() => onCalibrate(r.id)} onViewDetail={() => onViewDetail(r.id)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

    </>
  );
}

/* ============================================================
   VIEW 2 — Edit / New calibration form
   ============================================================ */

function EditView({
  riskType,
  calibration,
  onBack,
  onClose,
  onSave,
}: {
  riskType: SafetyRiskType;
  calibration?: ManualCalibration;
  onBack: () => void;
  onClose: () => void;
  onSave: (targetStatus: RiskStatus, reason: string) => void;
}) {
  const currentStatus = getOverallStatus(riskType, calibration);
  const displayName = RISK_DISPLAY_NAMES[riskType.id] || riskType.name;

  const higherStatuses: RiskStatus[] = (['orange', 'red'] as RiskStatus[]).filter(
    (s) => STATUS_RANK[s] > STATUS_RANK[currentStatus],
  );

  const [targetStatus, setTargetStatus] = useState<RiskStatus | null>(
    higherStatuses.length === 1 ? higherStatuses[0] : null,
  );
  const [reason, setReason] = useState(calibration?.calibratedReason || '');
  const maxLen = 100;
  const canSubmit = targetStatus !== null && reason.trim().length > 0;

  return (
    <>
      <DialogHeader title={`校准 ${displayName}`} onBack={onBack} onClose={onClose} />

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 24px', gap: 20, display: 'flex', flexDirection: 'column' }}>
        <IndicatorCard
          riskType={riskType}
          calibration={calibration}
          actionSlot={<Button type="text" size="small" disabled>校准</Button>}
        />

        {/* 原始状态 & 校准为 */}
        <div className="flex shrink-0" style={{ gap: 20 }}>
          <div className="flex-1 flex flex-col" style={{ gap: 2 }}>
            <FormLabel label="原始状态" />
            <FilledPill status={currentStatus} />
          </div>
          <div className="flex-1 flex flex-col" style={{ gap: 2 }}>
            <FormLabel label="校准为" required />
            <div className="flex items-center" style={{ gap: 12 }}>
              {higherStatuses.map((s) => (
                <SelectablePill key={s} status={s} selected={targetStatus === s} onClick={() => setTargetStatus(s)} />
              ))}
            </div>
          </div>
        </div>

        {/* 校准原因 */}
        <div className="flex flex-col shrink-0" style={{ gap: 2 }}>
          <FormLabel label="校准原因" required />
          <Input.TextArea
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              if (e.target.value.length <= maxLen) setReason(e.target.value);
            }}
            placeholder="请输入校准原因"
            showCount maxLength={maxLen} rows={4}
            style={{ width: '100%' }}
          />
        </div>

        {/* 附件 */}
        <div className="flex flex-col shrink-0" style={{ gap: 12 }}>
          <div className="flex flex-col" style={{ gap: 2 }}>
            <FormLabel label="附件" />
            <span className="text-sm text-[#8F959E] leading-[22px]">仅支持：JPG、PNG、PDF，大小不超过 10MB</span>
          </div>
          <button
            type="button"
            className="flex items-center justify-center rounded-lg text-[#8F959E] hover:bg-[#E5E6E8] transition-colors"
            style={{ width: 56, height: 56, backgroundColor: '#EFF0F1' }}
          >
            <AddOutlined style={{ fontSize: 20 }} />
          </button>
        </div>
      </div>

      <div
        className="flex items-center justify-end shrink-0"
        style={{ padding: 24, gap: 12, borderTop: '1px solid rgba(31,35,41,0.15)' }}
      >
        <Button type="outlined" onClick={onBack}>取消</Button>
        <Button type="primary" disabled={!canSubmit} onClick={() => { if (targetStatus && reason.trim()) onSave(targetStatus, reason.trim()); }}>
          确定
        </Button>
      </div>
    </>
  );
}

/* ============================================================
   VIEW 3 — Read-only calibration detail
   ============================================================ */

function CalibrationDetailView({
  riskType,
  calibration,
  onBack,
  onClose,
  onEdit,
  onDelete,
}: {
  riskType: SafetyRiskType;
  calibration: ManualCalibration;
  onBack: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const originalStatus = getNaturalStatus(riskType);

  return (
    <>
      <DialogHeader title="校准详情" onBack={onBack} onClose={onClose} />

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 24px', gap: 20, display: 'flex', flexDirection: 'column' }}>
        {/* Risk card (read-only, shows "人工校准" tag) */}
        <IndicatorCard riskType={riskType} calibration={calibration} />

        {/* 校准结果 */}
        <div className="flex flex-col shrink-0" style={{ gap: 2 }}>
          <FormLabel label="校准结果" />
          <div className="flex items-center" style={{ gap: 8 }}>
            <FilledPill status={originalStatus} />
            <span className="text-[#646A73]" style={{ fontSize: 16 }}>→</span>
            <FilledPill status={calibration.calibratedStatus} />
          </div>
        </div>

        {/* 校准原因 */}
        <div className="flex flex-col shrink-0" style={{ gap: 2 }}>
          <FormLabel label="校准原因" />
          <p className="text-sm text-[#1F2329] leading-[22px]" style={{ wordBreak: 'break-all' }}>
            {calibration.calibratedReason || '—'}
          </p>
        </div>

        {/* 附件 (placeholder) */}
        <div className="flex flex-col shrink-0" style={{ gap: 2 }}>
          <FormLabel label="附件" />
          <span className="text-sm text-[#8F959E] leading-[22px]">暂无附件</span>
        </div>

        {/* 校准人 & 校准时间 */}
        <div className="flex shrink-0" style={{ gap: 20 }}>
          <div className="flex-1 flex flex-col" style={{ gap: 4 }}>
            <span className="text-sm text-[#646A73] leading-[22px]">校准人</span>
            <span className="text-sm text-[#1F2329] leading-[22px]">李天天</span>
          </div>
          <div className="flex-1 flex flex-col" style={{ gap: 4 }}>
            <span className="text-sm text-[#646A73] leading-[22px]">校准时间</span>
            <span className="text-sm text-[#1F2329] leading-[22px]">{calibration.calibratedAt}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-end shrink-0"
        style={{ padding: 24, gap: 12, borderTop: '1px solid rgba(31,35,41,0.15)' }}
      >
        <Button type="outlined" onClick={onDelete}>删除校准</Button>
        <Button type="outlined" color="primary" onClick={onEdit}>编辑校准</Button>
      </div>
    </>
  );
}

/* ============================================================
   Main Modal — orchestrates the three views
   ============================================================ */

export default function RiskCalibrationModal({
  visible,
  onClose,
  riskTypes,
  manualCalibrations,
  onSaveCalibration,
  onDeleteCalibration,
}: RiskCalibrationModalProps) {
  const [view, setView] = useState<ViewMode>({ type: 'overview' });

  const handleClose = useCallback(() => {
    setView({ type: 'overview' });
    onClose();
  }, [onClose]);

  const handleBack = useCallback(() => setView({ type: 'overview' }), []);

  React.useEffect(() => {
    if (!visible) setView({ type: 'overview' });
  }, [visible]);

  const findRisk = (id: string) => riskTypes.find((r) => r.id === id);

  const renderContent = () => {
    if (view.type === 'edit') {
      const rt = findRisk(view.riskId);
      if (!rt) return null;
      return (
        <EditView
          riskType={rt}
          calibration={manualCalibrations[rt.id]}
          onBack={handleBack}
          onClose={handleClose}
          onSave={(targetStatus, reason) => {
            onSaveCalibration?.(rt.id, targetStatus, reason);
            setView({ type: 'overview' });
          }}
        />
      );
    }

    if (view.type === 'detail') {
      const rt = findRisk(view.riskId);
      const cal = rt ? manualCalibrations[rt.id] : undefined;
      if (!rt || !cal) return null;
      return (
        <CalibrationDetailView
          riskType={rt}
          calibration={cal}
          onBack={handleBack}
          onClose={handleClose}
          onEdit={() => setView({ type: 'edit', riskId: view.riskId })}
          onDelete={() => {
            onDeleteCalibration?.(rt.id);
            setView({ type: 'overview' });
          }}
        />
      );
    }

    return (
      <OverviewView
        riskTypes={riskTypes}
        manualCalibrations={manualCalibrations}
        onCalibrate={(id) => setView({ type: 'edit', riskId: id })}
        onViewDetail={(id) => setView({ type: 'detail', riskId: id })}
        onClose={handleClose}
      />
    );
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div
              className="bg-white pointer-events-auto flex flex-col overflow-hidden"
              style={{
                width: 900,
                maxHeight: '85vh',
                borderRadius: 8,
                boxShadow: '0px 6px 12px -10px rgba(31,35,41,0.06), 0px 8px 24px 0px rgba(31,35,41,0.04), 0px 10px 36px 10px rgba(31,35,41,0.04)',
              }}
            >
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
