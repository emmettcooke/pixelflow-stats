import React from 'react';
import { resetMetricsCollection } from './utils/initializeFirebase';

export default function TestPage() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '600px',
      margin: '50px auto'
    }}>
      <h1 style={{ color: '#3b82f6', marginBottom: '20px' }}>
        🚀 Dashboard Test Page
      </h1>
      <p style={{ marginBottom: '20px', color: '#6b7280' }}>
        If you can see this page, the deployment is working!
      </p>
      <div style={{ 
        background: '#f3f4f6', 
        padding: '16px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '12px' }}>Environment Variables:</h3>
        <div style={{ textAlign: 'left', fontSize: '14px' }}>
          <p>API Key: {process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
          <p>Auth Domain: {process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</p>
          <p>Project ID: {process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</p>
          <p>Storage Bucket: {process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing'}</p>
          <p>Messaging Sender ID: {process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing'}</p>
          <p>App ID: {process.env.REACT_APP_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing'}</p>
          <p>Measurement ID: {process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go to Dashboard
        </button>
        <button 
          onClick={async () => {
            if (window.confirm('This will delete all metrics and reset to sample data. Continue?')) {
              await resetMetricsCollection();
              window.alert('Metrics reset! Refresh the page to see changes.');
            }
          }}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔄 Reset Metrics
        </button>
      </div>
    </div>
  );
}
