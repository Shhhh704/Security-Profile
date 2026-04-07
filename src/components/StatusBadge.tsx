import React from 'react';
import { Tag } from '@universe-design/react';
import type { RectificationItem } from '../types';

export const StatusBadge = ({ type }: { type: RectificationItem['progress'] }) => {
  const styles = {
    overdue: 'bg-red-50 text-red-600',
    pending: 'bg-blue-50 text-blue-600',
    completed: 'bg-green-50 text-green-600',
    accepting: 'bg-purple-50 text-purple-600',
  };
  const labels = {
    overdue: '已逾期',
    pending: '进行中',
    completed: '已完成',
    accepting: '验收中',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
};

const SAFETY_TAG_COLOR: Record<string, string> = {
  red: 'red',
  yellow: 'warning',
  green: 'green',
};

const SAFETY_TAG_LABEL: Record<string, string> = {
  red: '红灯',
  yellow: '黄灯',
  green: '绿灯',
};

const WARNING_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.732 2c-.77-1.333-2.694-1.333-3.464 0L.742 19c-.77 1.334.192 3 1.732 3h19.052c1.54 0 2.502-1.666 1.733-3L13.732 2ZM10.75 8.25a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1-.75-.75v-6Zm0 8.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1-.75-.75v-1Z" fill="currentColor" />
  </svg>
);

const CHECK_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1.5 14.06-3.53-3.53a.75.75 0 0 1 1.06-1.06l2.47 2.47 5.47-5.47a.75.75 0 0 1 1.06 1.06l-6.53 6.53Z" fill="currentColor" />
  </svg>
);

const CIRCLE_WARNING_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11ZM11 7.5v6a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5Zm0 8v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5Z" fill="currentColor" />
  </svg>
);

const SAFETY_TAG_ICON: Record<string, React.ReactNode> = {
  red: WARNING_ICON,
  yellow: CIRCLE_WARNING_ICON,
  green: CHECK_ICON,
};

export const SafetyStatusBadge = ({ status }: { status: RectificationItem['status'] }) => (
  <Tag size="small" color={SAFETY_TAG_COLOR[status]} icon={SAFETY_TAG_ICON[status]}>
    {SAFETY_TAG_LABEL[status]}
  </Tag>
);

export const getAggregatedProgress = (children: RectificationItem[]): RectificationItem['progress'] => {
  const priority: Record<string, number> = {
    'overdue': 4,
    'pending': 3,
    'accepting': 2,
    'completed': 1,
  };

  let highestPriority = 0;
  let aggregatedProgress: RectificationItem['progress'] = 'completed';

  children.forEach(child => {
    const currentPriority = priority[child.progress] || 0;
    if (currentPriority > highestPriority) {
      highestPriority = currentPriority;
      aggregatedProgress = child.progress;
    }
  });

  return aggregatedProgress;
};
