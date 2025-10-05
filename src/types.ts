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
  goal?: number; // Optional goal value for this metric
}

export interface MonthlyMetricEntry {
  id?: string;
  month: string;
  year: number;
  mrr: number;
  trialToPaid: number; // Changed from revenue to trialToPaid
  customers: number;
  averageLtv: number; // Changed from activeSubscriptions to averageLtv
  newTrials: number;
  churnRate: number;
}

export interface DashboardState {
  metrics: Metric[];
  monthlyEntries: MonthlyMetricEntry[];
  darkMode: boolean;
}

