import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Metric } from '../types';

interface MetricCardProps {
  metric: Metric;
  onEdit?: (metric: Metric) => void;
  onDelete?: (metricId: string) => void;
  onViewChart?: (metric: Metric) => void;
  currentMonth?: string;
  compact?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, onEdit, onDelete, onViewChart, currentMonth, compact }) => {
  const formatValue = (value: number, unit?: string) => {
    if (unit === '$') {
      return `$${value.toLocaleString()}`;
    }
    if (unit === '%') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const getChangeColor = (changePercent?: number) => {
    if (!changePercent) return 'text-gray-500';
    return changePercent >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeBgColor = (changePercent?: number) => {
    if (!changePercent) return 'bg-gray-100';
    return changePercent >= 0 ? 'bg-green-100' : 'bg-red-100';
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{data.payload.date}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatValue(data.value, metric.unit)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`flex justify-between items-start ${compact ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-baseline gap-2 flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 dark:text-gray-100 truncate ${
            compact ? 'text-sm' : 'text-lg'
          }`}>{metric.title}</h3>
          {metric.goal !== undefined && metric.goal > 0 && !compact && (
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              (Goal: {formatValue(metric.goal, metric.unit)})
            </span>
          )}
        </div>
        {metric.changePercent !== undefined && (
          <div className="text-right ml-2">
            <div className={`inline-flex items-center rounded-full font-medium ${getChangeBgColor(metric.changePercent)} dark:bg-opacity-20 ${getChangeColor(metric.changePercent)} dark:text-opacity-90 ${
              compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
            }`}>
              {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(compact ? 0 : 2)}%
            </div>
            {metric.changeTimeframe && !compact && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.changeTimeframe}</div>
            )}
          </div>
        )}
      </div>
      
      <div className={compact ? 'mb-2' : 'mb-4'}>
        <div className={`font-bold text-gray-900 dark:text-gray-50 ${
          compact ? 'text-xl' : 'text-3xl'
        }`}>
          {formatValue(metric.value, metric.unit)}
        </div>
        {metric.goal !== undefined && metric.goal > 0 && compact && (
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            Goal: {formatValue(metric.goal, metric.unit)}
          </span>
        )}
      </div>
      
      <div 
        className={`cursor-pointer ${compact ? 'h-12' : 'h-20'}`}
        onClick={() => onViewChart?.(metric)}
      >
        {metric.data && metric.data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metric.data}>
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: metric.color || '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={metric.color || '#3b82f6'} 
                strokeWidth={compact ? 1.5 : 2}
                dot={metric.data.length <= 5}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={`flex items-center justify-center h-full text-gray-400 dark:text-gray-600 ${
            compact ? 'text-xs' : 'text-sm'
          }`}>
            No data yet
          </div>
        )}
      </div>
      
      {/* Display months with actual data at the bottom */}
      {metric.data && metric.data.length > 0 && !compact && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            {metric.data.map((dataPoint, index) => {
              const [month, year] = dataPoint.date.split(' ');
              return (
                <div 
                  key={index} 
                  className="text-center group relative cursor-help"
                  title={`${month} ${year}: ${formatValue(dataPoint.value, metric.unit)}`}
                >
                  <div className="font-medium">{month}</div>
                  <div className="text-gray-400 dark:text-gray-500">{year}</div>
                  {/* Tooltip on hover */}
                  <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap z-10">
                    {formatValue(dataPoint.value, metric.unit)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {metric.data && metric.data.length > 0 && compact && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
            {metric.data.length} month{metric.data.length !== 1 ? 's' : ''} • Click for details
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

