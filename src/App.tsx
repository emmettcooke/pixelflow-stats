import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFirebaseMetrics } from './hooks/useFirebaseMetrics';
import { initializeFirebaseData } from './utils/initializeFirebase';
import { MonthlyMetricEntry } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import SortableMetricCard from './components/SortableMetricCard';
import EditCompanyMetricsModal from './components/EditCompanyMetricsModal';
import Login from './components/Login';
import ErrorBoundary from './ErrorBoundary';
import TestPage from './TestPage';

function Dashboard() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const { currentUser, logout } = useAuth();
  const {
    metrics,
    monthlyEntries,
    loading,
    error,
    updateMetric,
    deleteMetric,
    addMonthlyEntry,
    updateMonthlyEntry
  } = useFirebaseMetrics();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSaveMetrics = async (entry: MonthlyMetricEntry) => {
    const existingEntry = monthlyEntries.find(
      e => e.month === entry.month && e.year === entry.year
    );
    
    if (existingEntry && existingEntry.id) {
      await updateMonthlyEntry(existingEntry.id, entry);
    } else {
      await addMonthlyEntry(entry);
    }
    
    // Update metrics with new data
    updateMetricsFromEntry(entry);
  };

  const updateMetricsFromEntry = async (entry: MonthlyMetricEntry) => {
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
      
      if (newValue !== metric.value) {
        // Use docId (Firebase document ID) for updates, fallback to id if docId not available
        const documentId = metric.docId || metric.id;
        await updateMetric(documentId, { value: newValue });
      }
    }
  };

  const handleDeleteMetric = async (metricId: string) => {
    // Find the metric to get its document ID
    const metric = metrics.find(m => m.id === metricId);
    if (metric) {
      const documentId = metric.docId || metric.id;
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
    // Placeholder for settings functionality
    console.log('Settings clicked');
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
        onAddMetric={() => setIsEditModalOpen(true)}
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
          </>
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

function App() {
  const { currentUser } = useAuth();

  // Initialize Firebase data on first load
  useEffect(() => {
    initializeFirebaseData();
  }, []);

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

