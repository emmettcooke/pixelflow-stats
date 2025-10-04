import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
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
          id: doc.id,
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
    const q = query(collection(db, 'monthlyEntries'), orderBy('year', 'desc'), orderBy('month', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as MonthlyMetricEntry[];
        setMonthlyEntries(entriesData);
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

  return {
    metrics,
    monthlyEntries,
    loading,
    error,
    addMetric,
    updateMetric,
    deleteMetric,
    addMonthlyEntry,
    updateMonthlyEntry
  };
}
