import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFirebaseMetrics } from './hooks/useFirebaseMetrics';
import { MonthlyMetricEntry, Metric } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import SortableMetricCard from './components/SortableMetricCard';
import EditCompanyMetricsModal from './components/EditCompanyMetricsModal';
import ManageMetricsModal from './components/ManageMetricsModal';
import SettingsModal from './components/SettingsModal';
import ChartModal from './components/ChartModal';
import SetGoalModal from './components/SetGoalModal';
import Login from './components/Login';
import ErrorBoundary from './ErrorBoundary';
import TestPage from './TestPage';

function Dashboard() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const { currentUser, logout } = useAuth();
  const {
    metrics,
    monthlyEntries,
    customMetricEntries,
    loading,
    error,
    addMetric,
    updateMetric,
    deleteMetric,
    addMonthlyEntry,
    updateMonthlyEntry,
    deleteMonthlyEntry,
    deleteAllMetrics,
    addCustomMetricEntry,
    updateCustomMetricEntry,
    deleteCustomMetricEntry
  } = useFirebaseMetrics();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageMetricsModalOpen, setIsManageMetricsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [selectedYear, setSelectedYear] = useState(2025);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Find existing monthly entry for the selected month/year
  const getExistingEntry = () => {
    return monthlyEntries.find(
      entry => entry.month === selectedMonth && entry.year === selectedYear
    );
  };


  const handleSaveMetrics = async (entry: MonthlyMetricEntry, customMetricValues?: Record<string, number>) => {
    const existingEntry = monthlyEntries.find(
      e => e.month === entry.month && e.year === entry.year
    );
    
    if (existingEntry && existingEntry.id) {
      // Update existing entry
      await updateMonthlyEntry(existingEntry.id, entry);
    } else {
      // Check for duplicates before adding
      const duplicateCheck = monthlyEntries.find(
        e => e.month === entry.month && e.year === entry.year
      );
      
      if (duplicateCheck) {
        alert(`Data for ${entry.month} ${entry.year} already exists. Please edit the existing entry instead.`);
        return;
      }
      
      await addMonthlyEntry(entry);
    }
    
    // Update metrics with new data
    await updateMetricsFromEntry(entry);
    
    // Save custom metric entries if provided
    if (customMetricValues) {
      for (const [metricId, value] of Object.entries(customMetricValues)) {
        // Check if entry already exists for this metric/month/year
        const existingCustomEntry = customMetricEntries.find(
          e => e.metricId === metricId && e.month === entry.month && e.year === entry.year
        );
        
        if (existingCustomEntry && existingCustomEntry.id) {
          // Update existing entry
          await updateCustomMetricEntry(existingCustomEntry.id, { value });
        } else {
          // Add new entry
          await addCustomMetricEntry({
            metricId,
            month: entry.month,
            year: entry.year,
            value
          });
        }
      }
    }
    
    // Generate chart data immediately after updating
    await generateChartDataFromEntries();
  };

  const updateMetricsFromEntry = useCallback(async (entry: MonthlyMetricEntry) => {
    // Update the current value and trigger chart data generation
    for (const metric of metrics) {
      let newValue = metric.value;
      
      switch (metric.id) {
        case 'mrr':
          newValue = entry.mrr;
          break;
        case 'trial-to-paid':
          newValue = entry.trialToPaid;
          break;
        case 'customers':
          newValue = entry.customers;
          break;
        case 'average-ltv':
          newValue = entry.averageLtv;
          break;
        case 'new-trials':
          newValue = entry.newTrials;
          break;
        case 'churn-rate':
          newValue = entry.churnRate;
          break;
      }
      
      // Update the value
      const documentId = metric.docId || metric.id;
      await updateMetric(documentId, { 
        value: newValue
      });
    }
    
    // Chart data will be generated by the calling function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, updateMetric]);

  // Simple chart data generation from monthly entries
  const generateChartDataFromEntries = useCallback(async () => {
    if (monthlyEntries.length === 0 || metrics.length === 0) return;

    // Get unique entries and sort them chronologically
    const uniqueEntries = monthlyEntries.reduce((acc, entry) => {
      const key = `${entry.month}-${entry.year}`;
      if (!acc[key]) {
        acc[key] = entry;
      }
      return acc;
    }, {} as Record<string, MonthlyMetricEntry>);
    
    const sortedEntries = Object.values(uniqueEntries).sort((a, b) => {
      const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
      if (a.year !== b.year) return a.year - b.year;
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    // Update each metric with real data
    for (const metric of metrics) {
      let chartData: any[] = [];
      let changePercent = 0;
      let currentValue = 0;

      // Check if this is a custom metric (not in the default 6)
      const isCustomMetric = !['mrr', 'trial-to-paid', 'customers', 'average-ltv', 'new-trials', 'churn-rate'].includes(metric.id);
      
      if (isCustomMetric) {
        // Handle custom metrics
        const metricEntries = customMetricEntries.filter(e => e.metricId === metric.id);
        
        if (metricEntries.length > 0) {
          // Sort entries chronologically
          const sortedMetricEntries = metricEntries.sort((a, b) => {
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'];
            if (a.year !== b.year) return a.year - b.year;
            return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
          });
          
          // Filter out zero values
          const nonZeroEntries = sortedMetricEntries.filter(e => e.value > 0);
          
          if (nonZeroEntries.length > 0) {
            chartData = nonZeroEntries.map(e => ({ date: `${e.month} ${e.year}`, value: e.value }));
            currentValue = nonZeroEntries[nonZeroEntries.length - 1].value;
            
            // Calculate change percent if we have at least 2 data points
            if (nonZeroEntries.length >= 2) {
              const latest = nonZeroEntries[nonZeroEntries.length - 1];
              const previous = nonZeroEntries[nonZeroEntries.length - 2];
              changePercent = previous.value > 0 ? ((latest.value - previous.value) / previous.value) * 100 : 0;
            }
          }
        }
        
        // Update the custom metric with its data
        const documentId = metric.docId || metric.id;
        await updateMetric(documentId, { 
          value: currentValue,
          data: chartData,
          changePercent: changePercent
        });
        continue; // Skip to next metric
      }

      // Get data for default metrics
      switch (metric.id) {
        case 'mrr':
          const mrrData = sortedEntries.filter(e => e.mrr > 0);
          chartData = mrrData.map(e => ({ date: `${e.month} ${e.year}`, value: e.mrr }));
          currentValue = mrrData.length > 0 ? mrrData[mrrData.length - 1].mrr : 0;
          if (mrrData.length >= 2) {
            const latest = mrrData[mrrData.length - 1];
            const previous = mrrData[mrrData.length - 2];
            changePercent = previous.mrr > 0 ? ((latest.mrr - previous.mrr) / previous.mrr) * 100 : 0;
          }
          break;
        case 'trial-to-paid':
          const trialData = sortedEntries.filter(e => e.trialToPaid > 0);
          chartData = trialData.map(e => ({ date: `${e.month} ${e.year}`, value: e.trialToPaid }));
          currentValue = trialData.length > 0 ? trialData[trialData.length - 1].trialToPaid : 0;
          if (trialData.length >= 2) {
            const latest = trialData[trialData.length - 1];
            const previous = trialData[trialData.length - 2];
            changePercent = previous.trialToPaid > 0 ? ((latest.trialToPaid - previous.trialToPaid) / previous.trialToPaid) * 100 : 0;
          }
          break;
        case 'customers':
          const customerData = sortedEntries.filter(e => e.customers > 0);
          chartData = customerData.map(e => ({ date: `${e.month} ${e.year}`, value: e.customers }));
          currentValue = customerData.length > 0 ? customerData[customerData.length - 1].customers : 0;
          if (customerData.length >= 2) {
            const latest = customerData[customerData.length - 1];
            const previous = customerData[customerData.length - 2];
            changePercent = previous.customers > 0 ? ((latest.customers - previous.customers) / previous.customers) * 100 : 0;
          }
          break;
        case 'average-ltv':
          const ltvData = sortedEntries.filter(e => e.averageLtv > 0);
          chartData = ltvData.map(e => ({ date: `${e.month} ${e.year}`, value: e.averageLtv }));
          currentValue = ltvData.length > 0 ? ltvData[ltvData.length - 1].averageLtv : 0;
          if (ltvData.length >= 2) {
            const latest = ltvData[ltvData.length - 1];
            const previous = ltvData[ltvData.length - 2];
            changePercent = previous.averageLtv > 0 ? ((latest.averageLtv - previous.averageLtv) / previous.averageLtv) * 100 : 0;
          }
          break;
        case 'new-trials':
          const trialsData = sortedEntries.filter(e => e.newTrials > 0);
          chartData = trialsData.map(e => ({ date: `${e.month} ${e.year}`, value: e.newTrials }));
          currentValue = trialsData.length > 0 ? trialsData[trialsData.length - 1].newTrials : 0;
          if (trialsData.length >= 2) {
            const latest = trialsData[trialsData.length - 1];
            const previous = trialsData[trialsData.length - 2];
            changePercent = previous.newTrials > 0 ? ((latest.newTrials - previous.newTrials) / previous.newTrials) * 100 : 0;
          }
          break;
        case 'churn-rate':
          const churnData = sortedEntries.filter(e => e.churnRate > 0);
          chartData = churnData.map(e => ({ date: `${e.month} ${e.year}`, value: e.churnRate }));
          currentValue = churnData.length > 0 ? churnData[churnData.length - 1].churnRate : 0;
          if (churnData.length >= 2) {
            const latest = churnData[churnData.length - 1];
            const previous = churnData[churnData.length - 2];
            changePercent = previous.churnRate > 0 ? ((latest.churnRate - previous.churnRate) / previous.churnRate) * 100 : 0;
          }
          break;
      }

      // Update metric with real data
      const documentId = metric.docId || metric.id;
      await updateMetric(documentId, { 
        value: currentValue,
        data: chartData,
        changePercent: changePercent
      });
    }
  }, [monthlyEntries, metrics, customMetricEntries, updateMetric]);

  // Auto-regenerate charts when monthly entries change (but only after initial load)
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if ((monthlyEntries.length > 0 || customMetricEntries.length > 0) && metrics.length > 0) {
      if (hasInitialized) {
        // Only regenerate if we've already initialized (prevents first load issues)
        generateChartDataFromEntries();
      } else {
        setHasInitialized(true);
        generateChartDataFromEntries();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyEntries.length, metrics.length, customMetricEntries.length]);

  const handleDeleteMetric = async (metricId: string) => {
    // Find the metric to get its document ID
    const metric = metrics.find(m => m.id === metricId);
    if (metric) {
      const documentId = metric.docId || metric.id;
      
      // Delete all custom metric entries for this metric
      const entriesToDelete = customMetricEntries.filter(e => e.metricId === metricId);
      for (const entry of entriesToDelete) {
        if (entry.id) {
          await deleteCustomMetricEntry(entry.id);
        }
      }
      
      // Delete the metric itself
      await deleteMetric(documentId);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = metrics.findIndex(m => m.id === active.id);
    const newIndex = metrics.findIndex(m => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    
    // Update order in Firebase
    const reorderedMetrics = arrayMove(metrics, oldIndex, newIndex);
    for (let i = 0; i < reorderedMetrics.length; i++) {
      const documentId = reorderedMetrics[i].docId || reorderedMetrics[i].id;
      await updateMetric(documentId, { order: i });
    }
  };

  const handleSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleDeleteMonthlyEntry = async (id: string) => {
    await deleteMonthlyEntry(id);
    // Charts will auto-regenerate when monthlyEntries updates via the useEffect
  };

  const handleViewChart = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsChartModalOpen(true);
  };

  const handleSetGoal = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (metricId: string, goal: number | undefined) => {
    await updateMetric(metricId, { goal });
  };

  const handleAddMetric = async (metric: Omit<Metric, 'id' | 'userId' | 'docId'>) => {
    // Get the highest order number and add 1
    const maxOrder = metrics.length > 0 
      ? Math.max(...metrics.map(m => m.order || 0))
      : -1;
    
    await addMetric({
      ...metric,
      order: maxOrder + 1,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onAddMetric={() => setIsManageMetricsModalOpen(true)}
        onAddMonthlyData={() => setIsEditModalOpen(true)}
        onSettings={handleSettings}
        onLogout={handleLogout}
        user={currentUser}
      />
      
      <main className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 text-lg">Loading metrics...</div>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={metrics.map(m => m.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metrics.map((metric) => (
                    <SortableMetricCard
                      key={metric.id}
                      metric={metric}
                      onDelete={handleDeleteMetric}
                      onViewChart={handleViewChart}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            {metrics.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No metrics yet</div>
                <button
                  onClick={() => setIsManageMetricsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Add Your First Metric
                </button>
              </div>
            )}
          </>
        )}
      </main>
      
      <EditCompanyMetricsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveMetrics={handleSaveMetrics}
        existingEntry={getExistingEntry()}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        metrics={metrics}
        customMetricEntries={customMetricEntries}
      />
      
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onDeleteAllMetrics={deleteAllMetrics}
        monthlyEntries={monthlyEntries}
        onDeleteMonthlyEntry={handleDeleteMonthlyEntry}
      />
      
      <ChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        metric={selectedMetric}
        onSetGoal={handleSetGoal}
      />
      
      <SetGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        metric={selectedMetric}
        onSaveGoal={handleSaveGoal}
      />
      
      <ManageMetricsModal
        isOpen={isManageMetricsModalOpen}
        onClose={() => setIsManageMetricsModalOpen(false)}
        onAddMetric={handleAddMetric}
        onUpdateMetric={updateMetric}
        onDeleteMetric={handleDeleteMetric}
        metrics={metrics}
      />
    </div>
  );
}

function App() {
  const { currentUser } = useAuth();

  // User data is now automatically loaded by useFirebaseMetrics hook
  // No global initialization needed

  // Show test page first to debug deployment
  if (window.location.search.includes('test=true')) {
    return <TestPage />;
  }

  if (!currentUser) {
    return <Login darkMode={false} />;
  }

  return <Dashboard />;
}

export default function AppWithAuth() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  );
}

