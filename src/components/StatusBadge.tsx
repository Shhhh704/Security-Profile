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

export const SafetyStatusBadge = ({ status }: { status: RectificationItem['status'] }) => {
  const styles = {
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-600',
  };
  const labels = {
    red: '红灯',
    yellow: '黄灯',
    green: '绿灯',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

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
