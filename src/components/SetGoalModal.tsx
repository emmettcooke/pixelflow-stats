import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { Metric } from '../types';

interface SetGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: Metric | null;
  onSaveGoal: (metricId: string, goal: number | undefined) => void;
}

const SetGoalModal: React.FC<SetGoalModalProps> = ({ isOpen, onClose, metric, onSaveGoal }) => {
  const [goalValue, setGoalValue] = useState<string>('');

  useEffect(() => {
    if (metric?.goal !== undefined && metric.goal > 0) {
      setGoalValue(metric.goal.toString());
    } else {
      setGoalValue('');
    }
  }, [metric, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metric) return;

    const parsedGoal = parseFloat(goalValue);
    if (goalValue === '' || isNaN(parsedGoal) || parsedGoal <= 0) {
      // Remove goal if empty or invalid
      onSaveGoal(metric.docId || metric.id, undefined);
    } else {
      onSaveGoal(metric.docId || metric.id, parsedGoal);
    }
    onClose();
  };

  const handleRemoveGoal = () => {
    if (!metric) return;
    onSaveGoal(metric.docId || metric.id, undefined);
    onClose();
  };

  if (!isOpen || !metric) return null;

  const formatValue = (value: number, unit?: string) => {
    if (unit === '$') {
      return `$${value.toLocaleString()}`;
    }
    if (unit === '%') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Set Goal for {metric.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Current value: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatValue(metric.value, metric.unit)}</span>
            </div>
            {metric.goal && metric.goal > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Current goal: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatValue(metric.goal, metric.unit)}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Goal Value {metric.unit && `(${metric.unit})`}
            </label>
            <input
              type="number"
              min="0"
              step={metric.unit === '%' ? '0.1' : '0.01'}
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              placeholder="Enter goal value (leave empty to remove goal)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Leave empty and save to remove the goal
            </p>
          </div>
          
          <div className="flex justify-between items-center gap-3">
            {metric.goal && metric.goal > 0 && (
              <button
                type="button"
                onClick={handleRemoveGoal}
                className="px-4 py-2 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
              >
                Remove Goal
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Save Goal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetGoalModal;

