import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Metric } from '../types';

interface AddMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMetric: (metric: Omit<Metric, 'id' | 'userId' | 'docId'>) => void;
}

const AddMetricModal: React.FC<AddMetricModalProps> = ({ isOpen, onClose, onAddMetric }) => {
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    unit: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMetric: Omit<Metric, 'id' | 'userId' | 'docId'> = {
      title: formData.title,
      value: parseFloat(formData.value) || 0,
      unit: formData.unit || undefined,
      data: [], // Start with empty data - will be populated when monthly data is added
      color: '#3b82f6'
    };

    onAddMetric(newMetric);
    setFormData({
      title: '',
      value: '',
      unit: ''
    });
    onClose();
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
          
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
            <strong>Note:</strong> Charts and growth percentages will automatically populate when you add monthly data using the "Add Data" button.
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

