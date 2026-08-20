import React from 'react';
import { ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { Modal } from '../common/Modal';

interface ColumnReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  defaultColumnOrder: string[];
}

export const ColumnReorderModal: React.FC<ColumnReorderModalProps> = ({
  isOpen,
  onClose,
  columnOrder,
  setColumnOrder,
  defaultColumnOrder,
}) => {
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...columnOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setColumnOrder(newOrder);
  };

  const handleReset = () => {
    setColumnOrder([...defaultColumnOrder]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reorder Columns" maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Arrange column sequence (Top = Leftmost column):</span>
          <button
            onClick={handleReset}
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Order
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
          {columnOrder.map((colId, index) => {
            const isFirst = index === 0;
            const isLast = index === columnOrder.length - 1;

            return (
              <div
                key={colId}
                className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-slate-500 w-5 text-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-200">
                    {colId}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={isFirst}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Move earlier (Left)"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={isLast}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Move later (Right)"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
