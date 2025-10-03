import { Metric, MetricDataPoint } from '../types';

const generateTrendData = (baseValue: number, volatility: number = 0.3): MetricDataPoint[] => {
  const months = [
    'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025',
    'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025'
  ];
  
  return months.map((month, index) => {
    const trend = Math.sin((index / months.length) * Math.PI * 2) * volatility;
    const random = (Math.random() - 0.5) * 0.2;
    const value = Math.max(0, baseValue * (1 + trend + random));
    return { date: month, value: Math.round(value * 100) / 100 };
  });
};

export const generateSampleMetrics = (): Metric[] => [
  {
    id: 'mrr',
    title: 'MRR',
    value: 23,
    unit: '$',
    data: generateTrendData(25, 0.4),
    color: '#3b82f6'
  },
  {
    id: 'trial-to-paid',
    title: 'Trial to Paid',
    value: 23.0,
    unit: '%',
    data: generateTrendData(25, 0.3),
    color: '#3b82f6'
  },
  {
    id: 'customers',
    title: 'Customers',
    value: 23,
    changePercent: -98.41,
    changeTimeframe: 'Last 30 days',
    data: generateTrendData(30, 0.5),
    color: '#3b82f6'
  },
  {
    id: 'active-subscriptions',
    title: 'Active Subscriptions',
    value: 23,
    changePercent: -98.08,
    changeTimeframe: 'Last 30 days',
    data: generateTrendData(30, 0.5),
    color: '#3b82f6'
  },
  {
    id: 'new-trials',
    title: 'New Trials',
    value: 23,
    changePercent: -69.33,
    changeTimeframe: 'Last 30 days',
    data: generateTrendData(25, 0.6),
    color: '#3b82f6'
  },
  {
    id: 'churn-rate',
    title: 'Churn Rate',
    value: 2.0,
    unit: '%',
    changePercent: 53.85,
    changeTimeframe: 'Last 30 days',
    data: generateTrendData(2.5, 0.4),
    color: '#3b82f6'
  }
];

