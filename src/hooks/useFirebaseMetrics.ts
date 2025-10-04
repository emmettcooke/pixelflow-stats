import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  getDocs,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Metric, MonthlyMetricEntry } from '../types';

export function useFirebaseMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [monthlyEntries, setMonthlyEntries] = useState<MonthlyMetricEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load metrics
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'metrics'),
      (snapshot) => {
        const metricsData = snapshot.docs.map(doc => ({
          id: doc.id, // Firebase document ID
          docId: doc.id, // Keep Firebase document ID for updates
          ...doc.data()
        })) as unknown as Metric[];
        setMetrics(metricsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading metrics:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Load monthly entries
  useEffect(() => {
    // Simple query without any ordering to avoid index requirements
    const unsubscribe = onSnapshot(
      collection(db, 'monthlyEntries'),
      (snapshot) => {
        const entriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as MonthlyMetricEntry[];
        
        // Simple sort by year and month in JavaScript
        const sortedEntries = entriesData.sort((a, b) => {
          // First sort by year (descending)
          if (a.year !== b.year) {
            return b.year - a.year;
          }
          // Then by month (descending)
          const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                             'July', 'August', 'September', 'October', 'November', 'December'];
          const aMonthIndex = monthOrder.indexOf(a.month);
          const bMonthIndex = monthOrder.indexOf(b.month);
          return bMonthIndex - aMonthIndex;
        });
        
        setMonthlyEntries(sortedEntries);
      },
      (err) => {
        console.error('Error loading monthly entries:', err);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, []);

  const addMetric = async (metric: Omit<Metric, 'id'>) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'metrics'), {
        ...metric,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error adding metric:', err);
      setError(err instanceof Error ? err.message : 'Failed to add metric');
    } finally {
      setLoading(false);
    }
  };

  const updateMetric = async (id: string, updates: Partial<Metric>) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'metrics', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error updating metric:', err);
      setError(err instanceof Error ? err.message : 'Failed to update metric');
    } finally {
      setLoading(false);
    }
  };

  const deleteMetric = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'metrics', id));
    } catch (err) {
      console.error('Error deleting metric:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete metric');
    } finally {
      setLoading(false);
    }
  };

  const addMonthlyEntry = async (entry: Omit<MonthlyMetricEntry, 'id'>) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'monthlyEntries'), {
        ...entry,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error adding monthly entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to add monthly entry');
    } finally {
      setLoading(false);
    }
  };

  const updateMonthlyEntry = async (id: string, updates: Partial<MonthlyMetricEntry>) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'monthlyEntries', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error updating monthly entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to update monthly entry');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllMetrics = async () => {
    try {
      setLoading(true);
      
      // Delete all metrics
      const metricsSnapshot = await getDocs(collection(db, 'metrics'));
      if (!metricsSnapshot.empty) {
        const batch = writeBatch(db);
        metricsSnapshot.docs.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });
        await batch.commit();
      }

      // Delete all monthly entries
      const monthlySnapshot = await getDocs(collection(db, 'monthlyEntries'));
      if (!monthlySnapshot.empty) {
        const batch = writeBatch(db);
        monthlySnapshot.docs.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });
        await batch.commit();
      }

      console.log('All metrics and monthly entries deleted successfully');
    } catch (err) {
      console.error('Error deleting all data:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete all data');
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    monthlyEntries,
    loading,
    error,
    addMetric,
    updateMetric,
    deleteMetric,
    addMonthlyEntry,
    updateMonthlyEntry,
    deleteAllMetrics
  };
}
