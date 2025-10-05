import React, { useState } from 'react';
import { X, Plus, Trash2, AlertTriangle, Edit } from 'lucide-react';
import { Metric } from '../types';

interface ManageMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMetric: (metric: Omit<Metric, 'id' | 'userId' | 'docId'>) => void;
  onUpdateMetric: (metricId: string, updates: Partial<Metric>) => void;
  onDeleteMetric: (metricId: string) => void;
  metrics: Metric[];
}

const ManageMetricsModal: React.FC<ManageMetricsModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddMetric,
  onUpdateMetric,
  onDeleteMetric,
  metrics 
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'edit' | 'delete'>('add');
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    unit: ''
  });
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    unit: ''
  });

  // Filter out default metrics - only allow deletion of custom metrics
  const customMetrics = metrics.filter(m => 
    !['mrr', 'trial-to-paid', 'customers', 'average-ltv', 'new-trials', 'churn-rate'].includes(m.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMetric: Omit<Metric, 'id' | 'userId' | 'docId'> = {
      title: formData.title,
      value: parseFloat(formData.value) || 0,
      unit: formData.unit || undefined,
      data: [],
      color: '#3b82f6'
    };

    onAddMetric(newMetric);
    setFormData({
      title: '',
      value: '',
      unit: ''
    });
    setActiveTab('delete'); // Switch to delete tab to show the new metric
  };

  const handleDelete = (metricId: string, metricTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${metricTitle}"? This will also delete all monthly data for this metric.`)) {
      onDeleteMetric(metricId);
    }
  };

  const handleEditClick = (metric: Metric) => {
    setEditingMetric(metric);
    setEditFormData({
      title: metric.title,
      unit: metric.unit || ''
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMetric) {
      onUpdateMetric(editingMetric.docId || editingMetric.id, {
        title: editFormData.title,
        unit: editFormData.unit || undefined
      });
      setEditingMetric(null);
      setEditFormData({ title: '', unit: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingMetric(null);
    setEditFormData({ title: '', unit: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Metrics</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Add
          </button>
          <button
            onClick={() => {
              setActiveTab('edit');
              setEditingMetric(null);
            }}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'edit'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Edit className="h-4 w-4 inline mr-2" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'delete'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Trash2 className="h-4 w-4 inline mr-2" />
            Delete
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'add' ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Metric Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Website Visitors, App Downloads, etc."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="$">Dollar ($)</option>
                    <option value="%">Percentage (%)</option>
                    <option value="users">Users</option>
                    <option value="orders">Orders</option>
                  </select>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <strong>Note:</strong> Charts and growth percentages will automatically populate when you add monthly data using the "Add Data" button.
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
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
          ) : activeTab === 'edit' ? (
            <div className="p-6">
              {!editingMetric ? (
                <>
                  {metrics.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertTriangle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No metrics to edit.</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Add a metric first to edit it.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Click on a metric to edit its name and unit.
                      </p>
                      {metrics.map((metric) => (
                        <div
                          key={metric.id}
                          onClick={() => handleEditClick(metric)}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                        >
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {metric.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {metric.unit ? `Unit: ${metric.unit}` : 'No unit'}
                              {' • '}
                              Current value: {metric.value}
                            </p>
                          </div>
                          <Edit className="h-5 w-5 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Metric Title
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Website Visitors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                    </label>
                    <select
                      value={editFormData.unit}
                      onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      <option value="$">Dollar ($)</option>
                      <option value="%">Percentage (%)</option>
                      <option value="users">Users</option>
                      <option value="orders">Orders</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                    <strong>Note:</strong> Editing will only change the title and unit. All existing data will be preserved.
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="p-6">
              {customMetrics.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No custom metrics to delete.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Default metrics (MRR, Trial to Paid, etc.) cannot be deleted.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Click the delete button to remove a custom metric. Default metrics cannot be deleted.
                  </p>
                  {customMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {metric.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {metric.unit ? `Unit: ${metric.unit}` : 'No unit'}
                          {' • '}
                          Current value: {metric.value}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(metric.docId || metric.id, metric.title)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete metric"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMetricsModal;

