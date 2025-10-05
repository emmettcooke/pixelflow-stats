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
  query,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Metric, MonthlyMetricEntry, CustomMetricEntry } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useFirebaseMetrics() {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [monthlyEntries, setMonthlyEntries] = useState<MonthlyMetricEntry[]>([]);
  const [customMetricEntries, setCustomMetricEntries] = useState<CustomMetricEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load metrics
  useEffect(() => {
    if (!currentUser) {
      setMetrics([]);
      setLoading(false);
      return;
    }

    const metricsQuery = query(
      collection(db, 'metrics'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      metricsQuery,
      (snapshot) => {
        const metricsData = snapshot.docs.map(doc => ({
          id: doc.id, // Firebase document ID
          docId: doc.id, // Keep Firebase document ID for updates
          ...doc.data()
        })) as unknown as Metric[];
        
        // Sort by order field
        const sortedMetrics = metricsData.sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : 999;
          const orderB = b.order !== undefined ? b.order : 999;
          return orderA - orderB;
        });
        
        setMetrics(sortedMetrics);
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
  }, [currentUser]);

  // Load monthly entries
  useEffect(() => {
    if (!currentUser) {
      setMonthlyEntries([]);
      return;
    }

    const monthlyEntriesQuery = query(
      collection(db, 'monthlyEntries'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      monthlyEntriesQuery,
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
  }, [currentUser]);

  // Load custom metric entries
  useEffect(() => {
    if (!currentUser) {
      setCustomMetricEntries([]);
      return;
    }

    const customEntriesQuery = query(
      collection(db, 'customMetricEntries'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      customEntriesQuery,
      (snapshot) => {
        const entriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as CustomMetricEntry[];
        
        setCustomMetricEntries(entriesData);
      },
      (err) => {
        console.error('Error loading custom metric entries:', err);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const addMetric = async (metric: Omit<Metric, 'id' | 'userId'>) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      
      // Filter out undefined values - Firestore doesn't accept them
      const cleanMetric = Object.fromEntries(
        Object.entries(metric).filter(([_, value]) => value !== undefined)
      );
      
      await addDoc(collection(db, 'metrics'), {
        ...cleanMetric,
        userId: currentUser.uid,
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
      
      // Filter out undefined values - Firestore doesn't accept them
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(doc(db, 'metrics', id), {
        ...cleanUpdates,
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

  const addMonthlyEntry = async (entry: Omit<MonthlyMetricEntry, 'id' | 'userId'>) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      
      // Filter out undefined values - Firestore doesn't accept them
      const cleanEntry = Object.fromEntries(
        Object.entries(entry).filter(([_, value]) => value !== undefined)
      );
      
      await addDoc(collection(db, 'monthlyEntries'), {
        ...cleanEntry,
        userId: currentUser.uid,
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
      
      // Filter out undefined values - Firestore doesn't accept them
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(doc(db, 'monthlyEntries', id), {
        ...cleanUpdates,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error updating monthly entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to update monthly entry');
    } finally {
      setLoading(false);
    }
  };

  const deleteMonthlyEntry = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'monthlyEntries', id));
    } catch (err) {
      console.error('Error deleting monthly entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete monthly entry');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllMetrics = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      
      // Delete all metrics for current user only
      const metricsQuery = query(
        collection(db, 'metrics'),
        where('userId', '==', currentUser.uid)
      );
      const metricsSnapshot = await getDocs(metricsQuery);
      if (!metricsSnapshot.empty) {
        const batch = writeBatch(db);
        metricsSnapshot.docs.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });
        await batch.commit();
      }

      // Delete all monthly entries for current user only
      const monthlyQuery = query(
        collection(db, 'monthlyEntries'),
        where('userId', '==', currentUser.uid)
      );
      const monthlySnapshot = await getDocs(monthlyQuery);
      if (!monthlySnapshot.empty) {
        const batch = writeBatch(db);
        monthlySnapshot.docs.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });
        await batch.commit();
      }

      // Delete all custom metric entries for current user only
      const customEntriesQuery = query(
        collection(db, 'customMetricEntries'),
        where('userId', '==', currentUser.uid)
      );
      const customEntriesSnapshot = await getDocs(customEntriesQuery);
      if (!customEntriesSnapshot.empty) {
        const batch = writeBatch(db);
        customEntriesSnapshot.docs.forEach((docSnapshot) => {
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

  const addCustomMetricEntry = async (entry: Omit<CustomMetricEntry, 'id' | 'userId'>) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      
      const cleanEntry = Object.fromEntries(
        Object.entries(entry).filter(([_, value]) => value !== undefined)
      );
      
      await addDoc(collection(db, 'customMetricEntries'), {
        ...cleanEntry,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error adding custom metric entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to add custom metric entry');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomMetricEntry = async (id: string, updates: Partial<CustomMetricEntry>) => {
    try {
      setLoading(true);
      
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(doc(db, 'customMetricEntries', id), {
        ...cleanUpdates,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error updating custom metric entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to update custom metric entry');
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomMetricEntry = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'customMetricEntries', id));
    } catch (err) {
      console.error('Error deleting custom metric entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete custom metric entry');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
