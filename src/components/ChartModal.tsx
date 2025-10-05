import React from 'react';
import { X, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Metric } from '../types';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: Metric | null;
  onSetGoal?: (metric: Metric) => void;
}

const ChartModal: React.FC<ChartModalProps> = ({ isOpen, onClose, metric, onSetGoal }) => {
  if (!isOpen || !metric) return null;

  const formatValue = (value: number, unit?: string) => {
    if (unit === '$') {
      return `$${value.toLocaleString()}`;
    }
    if (unit === '%') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  // const getChangeColor = (changePercent?: number) => {
  //   if (!changePercent) return 'text-gray-500';
  //   return changePercent >= 0 ? 'text-red-600' : 'text-green-600';
  // };

  const getChangeIcon = (changePercent?: number) => {
    if (!changePercent) return null;
    return changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-sm" style={{ color: metric.color }}>
            {formatValue(payload[0].value, metric.unit)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 border border-transparent dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{metric.title}</h2>
            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatValue(metric.value, metric.unit)}
              </span>
              {metric.changePercent !== undefined && (
                <div className={`ml-4 flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                  metric.changePercent >= 0 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {getChangeIcon(metric.changePercent)}
                  <span className="ml-1">
                    {metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            {metric.changeTimeframe && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{metric.changeTimeframe}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSetGoal?.(metric);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Target className="h-4 w-4" />
              {metric.goal ? 'Edit Goal' : 'Set Goal'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metric.data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                  tickFormatter={(value) => formatValue(value, metric.unit)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={metric.color} 
                  strokeWidth={3}
                  dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: metric.color, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Data Points Table */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Data Points</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {metric.data.map((point, index) => {
                    const previousValue = index > 0 ? metric.data[index - 1].value : null;
                    const change = previousValue ? ((point.value - previousValue) / previousValue) * 100 : null;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {point.date}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {formatValue(point.value, metric.unit)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {change !== null ? (
                            <span className={`inline-flex items-center ${
                              change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
