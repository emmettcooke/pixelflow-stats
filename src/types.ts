export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface Metric {
  id: string;
  docId?: string; // Firebase document ID for updates
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
  trialToPaid: number; // Changed from revenue to trialToPaid
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

