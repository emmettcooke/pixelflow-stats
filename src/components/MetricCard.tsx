import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Metric } from '../types';

interface MetricCardProps {
  metric: Metric;
  onEdit?: (metric: Metric) => void;
  onDelete?: (metricId: string) => void;
  onViewChart?: (metric: Metric) => void;
  currentMonth?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, onEdit, onDelete, onViewChart, currentMonth }) => {
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

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewChart?.(metric)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{metric.title}</h3>
        {metric.changePercent !== undefined && (
          <div className="text-right">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeBgColor(metric.changePercent)} dark:bg-opacity-20 ${getChangeColor(metric.changePercent)} dark:text-opacity-90`}>
              {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(2)}%
            </div>
            {metric.changeTimeframe && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.changeTimeframe}</div>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {formatValue(metric.value, metric.unit)}
        </div>
      </div>
      
      <div className="h-20">
        {metric.data && metric.data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metric.data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={metric.color || '#3b82f6'} 
                strokeWidth={2}
                dot={metric.data.length <= 5}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm">
            No data yet
          </div>
        )}
      </div>
      
      {/* Display months with actual data at the bottom */}
      {metric.data && metric.data.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            {metric.data.map((dataPoint, index) => {
              const [month, year] = dataPoint.date.split(' ');
              return (
                <div key={index} className="text-center">
                  <div className="font-medium">{month}</div>
                  <div className="text-gray-400 dark:text-gray-500">{year}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

