import { collection, getDocs, deleteDoc, doc, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Track initialization to prevent multiple calls
let isInitialized = false;

async function removeDuplicateMetrics(metricsSnapshot: any) {
  const metrics = metricsSnapshot.docs.map((doc: any) => ({
    docId: doc.id, // Firebase document ID
    ...doc.data()
  }));
  
  // Group metrics by their metric id field (not Firebase doc ID)
  const metricsById = new Map();
  const duplicates = [];
  
  for (const metric of metrics) {
    if (metricsById.has(metric.id)) {
      // This is a duplicate, mark for deletion
      duplicates.push(metric);
    } else {
      metricsById.set(metric.id, metric);
    }
  }
  
  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate metrics, removing...`);
    
    // Delete duplicate metrics (keep the first one, delete the rest)
    for (const duplicate of duplicates) {
      await deleteDoc(doc(db, 'metrics', duplicate.docId));
      console.log(`Deleted duplicate metric: ${duplicate.title} (docId: ${duplicate.docId})`);
    }
    
    console.log('Duplicate metrics removed successfully!');
  } else {
    console.log('No duplicate metrics found.');
  }
}

// Function to completely reset metrics collection
export async function resetMetricsCollection() {
  try {
    console.log('Resetting metrics collection...');
    
    // Get all metrics
    const metricsSnapshot = await getDocs(collection(db, 'metrics'));
    
    if (!metricsSnapshot.empty) {
      // Delete all existing metrics
      const batch = writeBatch(db);
      metricsSnapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });
      await batch.commit();
      console.log('All existing metrics deleted.');
    }
    
    console.log('Metrics collection cleared. Dashboard will start with empty state.');
    
    // Reset initialization flag
    isInitialized = false;
  } catch (error) {
    console.error('Error resetting metrics collection:', error);
  }
}

// Function to create empty metric cards
export async function createEmptyMetrics() {
  try {
    console.log('Creating empty metric cards...');
    
    const emptyMetrics = [
      {
        id: 'mrr',
        title: 'MRR',
        value: 0,
        unit: '$',
        data: [],
        color: '#3b82f6',
        order: 0
      },
      {
        id: 'trial-to-paid',
        title: 'Trial to Paid',
        value: 0,
        unit: '%',
        data: [],
        color: '#8b5cf6',
        order: 1
      },
      {
        id: 'customers',
        title: 'Customers',
        value: 0,
        data: [],
        color: '#10b981',
        order: 2
      },
      {
        id: 'average-ltv',
        title: 'Average LTV',
        value: 0,
        unit: '$',
        data: [],
        color: '#3b82f6',
        order: 3
      },
      {
        id: 'new-trials',
        title: 'New Trials',
        value: 0,
        data: [],
        color: '#f59e0b',
        order: 4
      },
      {
        id: 'churn-rate',
        title: 'Churn Rate',
        value: 0,
        unit: '%',
        data: [],
        color: '#ef4444',
        order: 5
      }
    ];

    for (const metric of emptyMetrics) {
      await addDoc(collection(db, 'metrics'), {
        ...metric,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('Empty metric cards created successfully!');
  } catch (error) {
    console.error('Error creating empty metrics:', error);
  }
}

export async function initializeFirebaseData() {
  // Prevent multiple initializations
  if (isInitialized) {
    console.log('Firebase data already initialized, skipping.');
    return;
  }

  try {
    // Check if metrics already exist
    const metricsSnapshot = await getDocs(collection(db, 'metrics'));
    
    if (metricsSnapshot.empty) {
      console.log('No metrics found. Creating empty metric cards...');
      await createEmptyMetrics();
    } else {
      console.log('Firebase already has data, checking for duplicates...');
      
      // Check for and remove duplicates
      await removeDuplicateMetrics(metricsSnapshot);
      
      // If we still have too many metrics, reset the collection
      const updatedSnapshot = await getDocs(collection(db, 'metrics'));
      if (updatedSnapshot.size > 6) {
        console.log('Too many metrics detected, resetting collection...');
        await resetMetricsCollection();
        await createEmptyMetrics();
      }
    }
    
    // Mark as initialized
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
  }
}
