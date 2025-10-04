import { collection, getDocs, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateSampleMetrics } from './generateSampleData';

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
    
    // Add fresh sample metrics
    const sampleMetrics = generateSampleMetrics();
    const batch = writeBatch(db);
    
    for (const metric of sampleMetrics) {
      const docRef = doc(collection(db, 'metrics'));
      batch.set(docRef, {
        ...metric,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await batch.commit();
    console.log('Fresh sample data added successfully!');
    
    // Reset initialization flag
    isInitialized = false;
  } catch (error) {
    console.error('Error resetting metrics collection:', error);
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
      console.log('Initializing Firebase with sample data...');
      
      // Add sample metrics
      const sampleMetrics = generateSampleMetrics();
      for (const metric of sampleMetrics) {
        await addDoc(collection(db, 'metrics'), {
          ...metric,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log('Sample data initialized successfully!');
    } else {
      console.log('Firebase already has data, checking for duplicates...');
      
      // Check for and remove duplicates
      await removeDuplicateMetrics(metricsSnapshot);
      
      // If we still have too many metrics, reset the collection
      const updatedSnapshot = await getDocs(collection(db, 'metrics'));
      if (updatedSnapshot.size > 6) {
        console.log('Too many metrics detected, resetting collection...');
        await resetMetricsCollection();
      }
    }
    
    // Mark as initialized
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
  }
}
