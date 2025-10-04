import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateSampleMetrics } from './generateSampleData';

// Track initialization to prevent multiple calls
let isInitialized = false;

async function removeDuplicateMetrics(metricsSnapshot: any) {
  const metrics = metricsSnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Group metrics by their id field
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
    
    // Delete duplicate metrics
    for (const duplicate of duplicates) {
      await deleteDoc(doc(db, 'metrics', duplicate.id));
      console.log(`Deleted duplicate metric: ${duplicate.title}`);
    }
    
    console.log('Duplicate metrics removed successfully!');
  } else {
    console.log('No duplicate metrics found.');
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
    }
    
    // Mark as initialized
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
  }
}
