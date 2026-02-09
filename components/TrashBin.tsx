
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';

interface TrashBinProps {
  onClick: () => void;
  count?: number;
}

const TrashBin: React.FC<TrashBinProps> = ({ onClick, count = 0 }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'trash',
  });

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`
        relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 border-2
        ${isOver 
          ? 'bg-red-50 border-red-500 text-red-600 scale-110 shadow-lg shadow-red-100' 
          : 'bg-white border-gray-100 text-gray-400 hover:text-red-400 hover:border-red-200 hover:bg-gray-50'
        }
      `}
      title="Papierkorb öffnen / Lead zum Löschen hierher ziehen"
    >
      <Trash2 size={20} className={isOver ? 'animate-bounce' : ''} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white shadow-sm ring-2 ring-white">
          {count}
        </span>
      )}
    </button>
  );
};

export default TrashBin;
