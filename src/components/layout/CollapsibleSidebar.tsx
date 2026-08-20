import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  isCollapsed,
  onToggle,
  children,
}) => {
  return (
    <div className="relative flex shrink-0 transition-all duration-300 ease-in-out h-full select-none">
      {/* Main sidebar container */}
      <div
        className={`h-full transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
          isCollapsed ? 'w-0 opacity-0' : 'w-96 lg:w-[440px] opacity-100'
        }`}
      >
        <div className="w-96 lg:w-[440px] h-full flex flex-col">
          {children}
        </div>
      </div>

      {/* Floating or edge collapse toggle button */}
      <div className="relative z-20 flex items-center justify-center">
        <button
          onClick={onToggle}
          className="absolute left-0 -translate-x-1/2 top-6 flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white shadow-xl transition-all cursor-pointer group"
          title={isCollapsed ? 'Expand Input Panel' : 'Collapse Input Panel (Expand Table)'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
};
