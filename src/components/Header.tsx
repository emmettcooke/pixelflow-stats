import React from 'react';
import { BarChart3, Settings, Plus, Moon, Sun, LogOut, User } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onAddMetric: () => void;
  onSettings: () => void;
  onLogout: () => void;
  user: FirebaseUser | null;
}

const Header: React.FC<HeaderProps> = ({ 
  darkMode, 
  onToggleDarkMode, 
  onAddMetric, 
  onSettings,
  onLogout,
  user
}) => {
  return (
    <header className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Metrics Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onSettings}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button
            onClick={onAddMetric}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Metrics</span>
          </button>

          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.email}
              </span>
            </div>
          )}
          
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
          
          <button
            onClick={onToggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

