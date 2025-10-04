import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateSampleMetrics } from './generateSampleData';

export async function initializeFirebaseData() {
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
      console.log('Firebase already has data, skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
  }
}
