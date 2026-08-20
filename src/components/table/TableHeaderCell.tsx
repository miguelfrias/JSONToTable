import React from 'react';
import { flexRender, type Header } from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { ColumnFilterPopover } from './ColumnFilterPopover';
import type { TableRowData } from '../../types/table';

interface TableHeaderCellProps {
  header: Header<TableRowData, unknown>;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveColumn: (columnId: string, direction: 'left' | 'right') => void;
  onDragStartColumn?: (e: React.DragEvent, columnId: string) => void;
  onDropColumn?: (e: React.DragEvent, targetColumnId: string) => void;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  header,
  canMoveLeft,
  canMoveRight,
  onMoveColumn,
  onDragStartColumn,
  onDropColumn,
}) => {
  const column = header.column;
  const isSorted = column.getIsSorted();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStartColumn && onDragStartColumn(e, column.id)}
      onDragOver={handleDragOver}
      onDrop={(e) => onDropColumn && onDropColumn(e, column.id)}
      className="relative flex items-center justify-between px-3 py-2.5 bg-slate-900 border-r border-b border-slate-800 text-slate-200 text-xs font-semibold select-none group hover:bg-slate-850/80 transition-colors h-full"
      style={{
        width: header.getSize(),
        minWidth: 80,
      }}
    >
      {/* Left side: Reorder drag handle & Title */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span
          className="text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
          title="Drag to reorder column"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </span>

        <button
          onClick={column.getToggleSortingHandler()}
          className="flex items-center gap-1.5 min-w-0 font-semibold text-slate-200 hover:text-indigo-300 transition text-left cursor-pointer truncate"
          title={`Click to sort by ${column.id}`}
        >
          <span className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>
          <span className="shrink-0 text-slate-400">
            {isSorted === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
            ) : isSorted === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            )}
          </span>
        </button>
      </div>

      {/* Right side: Quick Move buttons & Filter */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity ml-1">
        {/* Move left / right buttons */}
        <div className="hidden group-hover:flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveColumn(column.id, 'left');
            }}
            disabled={!canMoveLeft}
            className="p-0.5 text-slate-400 hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
            title="Move column left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveColumn(column.id, 'right');
            }}
            disabled={!canMoveRight}
            className="p-0.5 text-slate-400 hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
            title="Move column right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Popover */}
        <ColumnFilterPopover column={column} />
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize select-none touch-none hover:bg-indigo-500/60 transition ${
          header.column.getIsResizing() ? 'bg-indigo-500 w-2.5' : 'bg-transparent'
        }`}
        title="Drag to resize column"
      />
    </div>
  );
};
