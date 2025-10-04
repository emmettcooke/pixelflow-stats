import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface FirestoreState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useFirestore<T>(
  collectionName: string,
  orderByField?: string
): FirestoreState<T> & {
  add: (item: Omit<T, 'id'>) => Promise<void>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
} {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = orderByField 
      ? query(collection(db, collectionName), orderBy(orderByField))
      : collection(db, collectionName);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, orderByField]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      setLoading(true);
      await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error adding document:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, collectionName, id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error updating document:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    add,
    update,
    delete: deleteItem
  };
}
