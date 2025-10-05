import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { MonthlyMetricEntry } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAllMetrics: () => void;
  monthlyEntries?: MonthlyMetricEntry[];
  onDeleteMonthlyEntry?: (id: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onDeleteAllMetrics,
  monthlyEntries = [],
  onDeleteMonthlyEntry
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleDeleteAll = () => {
    onDeleteAllMetrics();
    setShowDeleteConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 border border-transparent dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your dashboard settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6">
          {!showDeleteConfirmation ? (
            <div className="space-y-6">
              {/* Monthly Entries Management */}
              {monthlyEntries && monthlyEntries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Monthly Entries
                  </h3>
                  <div className="space-y-2">
                    {monthlyEntries
                      .sort((a, b) => {
                        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                                            'July', 'August', 'September', 'October', 'November', 'December'];
                        if (a.year !== b.year) return b.year - a.year;
                        return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
                      })
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {entry.month} {entry.year}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              MRR: ${entry.mrr.toLocaleString()}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (entry.id && onDeleteMonthlyEntry && window.confirm(`Delete data for ${entry.month} ${entry.year}?`)) {
                                onDeleteMonthlyEntry(entry.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete this month"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Delete All Danger Zone */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      This will permanently delete all your metrics and monthly entries. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Metrics
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Are you absolutely sure?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will permanently delete all metrics and monthly entries. This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Yes, Delete All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
