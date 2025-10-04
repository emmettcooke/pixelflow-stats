export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface Metric {
  id: string;
  title: string;
  value: number;
  unit?: string;
  changePercent?: number;
  changeTimeframe?: string;
  data: MetricDataPoint[];
  color?: string;
  order?: number;
}

export interface MonthlyMetricEntry {
  id?: string;
  month: string;
  year: number;
  mrr: number;
  revenue: number;
  customers: number;
  activeSubscriptions: number;
  newTrials: number;
  churnRate: number;
}

export interface DashboardState {
  metrics: Metric[];
  monthlyEntries: MonthlyMetricEntry[];
  darkMode: boolean;
}

