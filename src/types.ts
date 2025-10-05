export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface Metric {
  id: string;
  docId?: string; // Firebase document ID for updates
  userId?: string; // User ID for data isolation (optional for forms, added by hooks)
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
  userId?: string; // User ID for data isolation (optional for forms, added by hooks)
  month: string;
  year: number;
  mrr: number;
  trialToPaid: number; // Changed from revenue to trialToPaid
  customers: number;
  averageLtv: number; // Changed from activeSubscriptions to averageLtv
  newTrials: number;
  churnRate: number;
}

// Store monthly data for custom metrics
export interface CustomMetricEntry {
  id?: string;
  userId?: string;
  metricId: string; // ID of the custom metric this data belongs to
  month: string;
  year: number;
  value: number;
}

export interface DashboardState {
  metrics: Metric[];
  monthlyEntries: MonthlyMetricEntry[];
  darkMode: boolean;
}

