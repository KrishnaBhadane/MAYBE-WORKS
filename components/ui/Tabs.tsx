import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-1 border-b-2 border-black/10 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer select-none ${
              isActive
                ? "text-black border-b-2 border-black bg-black/5 -mb-[2px]"
                : "text-black/50 hover:text-black hover:bg-black/[0.02]"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-2 px-1.5 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-[#FAFF00] text-black" : "bg-black/10 text-black/70"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
