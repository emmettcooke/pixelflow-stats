import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Metric } from '../types';
import MetricCard from './MetricCard';

interface SortableMetricCardProps {
  metric: Metric;
  onDelete?: (metricId: string) => void;
  onViewChart?: (metric: Metric) => void;
  compact?: boolean;
}

const SortableMetricCard: React.FC<SortableMetricCardProps> = ({ metric, onDelete, onViewChart, compact }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: metric.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
    cursor: 'grab'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MetricCard metric={metric} onDelete={onDelete} onViewChart={onViewChart} compact={compact} />
    </div>
  );
};

export default SortableMetricCard;


