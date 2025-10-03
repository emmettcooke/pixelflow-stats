import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Metric } from '../types';

interface AddMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMetric: (metric: Omit<Metric, 'id'>) => void;
}

const AddMetricModal: React.FC<AddMetricModalProps> = ({ isOpen, onClose, onAddMetric }) => {
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    unit: '',
    changePercent: '',
    changeTimeframe: 'Last 30 days'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMetric: Omit<Metric, 'id'> = {
      title: formData.title,
      value: parseFloat(formData.value) || 0,
      unit: formData.unit || undefined,
      changePercent: formData.changePercent ? parseFloat(formData.changePercent) : undefined,
      changeTimeframe: formData.changeTimeframe || undefined,
      data: generateInitialData(parseFloat(formData.value) || 0),
      color: '#3b82f6'
    };

    onAddMetric(newMetric);
    setFormData({
      title: '',
      value: '',
      unit: '',
      changePercent: '',
      changeTimeframe: 'Last 30 days'
    });
    onClose();
  };

  const generateInitialData = (baseValue: number) => {
    const months = [
      'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025',
      'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025'
    ];
    
    return months.map((month, index) => {
      const trend = Math.sin((index / months.length) * Math.PI * 2) * 0.3;
      const random = (Math.random() - 0.5) * 0.2;
      const value = Math.max(0, baseValue * (1 + trend + random));
      return { date: month, value: Math.round(value * 100) / 100 };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Metric</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metric Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Revenue, Users, etc."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="$">Dollar ($)</option>
                <option value="%">Percentage (%)</option>
                <option value="users">Users</option>
                <option value="orders">Orders</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change %
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.changePercent}
                onChange={(e) => setFormData({ ...formData, changePercent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeframe
              </label>
              <select
                value={formData.changeTimeframe}
                onChange={(e) => setFormData({ ...formData, changeTimeframe: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 90 days">Last 90 days</option>
                <option value="Last year">Last year</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Add Metric
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMetricModal;

