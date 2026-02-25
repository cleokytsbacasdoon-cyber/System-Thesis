import React from 'react';

interface TabsProps {
  activeTab: string;
  tabs: { id: string; label: string }[];
  onTabChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, tabs, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-200 gap-1 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 font-medium transition ${
            activeTab === tab.id
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
