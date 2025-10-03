import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateSampleMetrics } from './utils/generateSampleData';
import { Metric, MonthlyMetricEntry } from './types';
import Header from './components/Header';
import SortableMetricCard from './components/SortableMetricCard';
import EditCompanyMetricsModal from './components/EditCompanyMetricsModal';

function App() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [metrics, setMetrics] = useLocalStorage('metrics', generateSampleMetrics());
  const [monthlyEntries, setMonthlyEntries] = useLocalStorage<MonthlyMetricEntry[]>('monthlyEntries', []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [selectedYear, setSelectedYear] = useState(2025);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSaveMetrics = (entry: MonthlyMetricEntry) => {
    const existingIndex = monthlyEntries.findIndex(
      e => e.month === entry.month && e.year === entry.year
    );
    
    if (existingIndex >= 0) {
      const updatedEntries = [...monthlyEntries];
      updatedEntries[existingIndex] = entry;
      setMonthlyEntries(updatedEntries);
    } else {
      setMonthlyEntries([...monthlyEntries, entry]);
    }
    
    // Update metrics with new data
    updateMetricsFromEntry(entry);
  };

  const updateMetricsFromEntry = (entry: MonthlyMetricEntry) => {
    const updatedMetrics = metrics.map(metric => {
      let newValue = metric.value;
      let newChangePercent = metric.changePercent;
      
      switch (metric.id) {
        case 'mrr':
          newValue = entry.mrr;
          break;
        case 'trial-to-paid':
          newValue = entry.newTrials > 0 ? (entry.activeSubscriptions / entry.newTrials) * 100 : 0;
          break;
        case 'customers':
          newValue = entry.customers;
          break;
        case 'active-subscriptions':
          newValue = entry.activeSubscriptions;
          break;
        case 'new-trials':
          newValue = entry.newTrials;
          break;
        case 'churn-rate':
          newValue = entry.churnRate;
          break;
      }
      
      return { ...metric, value: newValue };
    });
    
    setMetrics(updatedMetrics);
  };

  const handleDeleteMetric = (metricId: string) => {
    setMetrics(metrics.filter(metric => metric.id !== metricId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = metrics.findIndex(m => m.id === active.id);
    const newIndex = metrics.findIndex(m => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setMetrics(arrayMove(metrics, oldIndex, newIndex));
  };

  const handleSettings = () => {
    // Placeholder for settings functionality
    console.log('Settings clicked');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onAddMetric={() => setIsEditModalOpen(true)}
        onSettings={handleSettings}
      />
      
      <main className="p-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={metrics.map(m => m.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric) => (
                <SortableMetricCard
                  key={metric.id}
                  metric={metric}
                  onDelete={handleDeleteMetric}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {metrics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No metrics yet</div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Add Your First Metric
            </button>
          </div>
        )}
      </main>
      
      <EditCompanyMetricsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveMetrics={handleSaveMetrics}
      />
    </div>
  );
}

export default App;

