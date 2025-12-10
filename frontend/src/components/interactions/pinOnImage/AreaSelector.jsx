import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const AreaSelector = ({ imageUrl, onSave, onCancel, initialArea }) => {
  const [selection, setSelection] = useState(initialArea || null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setStartPoint({ x, y });
    setIsSelecting(true);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !startPoint || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const x = Math.min(startPoint.x, currentX);
    const y = Math.min(startPoint.y, currentY);
    const width = Math.abs(currentX - startPoint.x);
    const height = Math.abs(currentY - startPoint.y);
    
    setSelection({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setStartPoint(null);
  };

  useEffect(() => {
    if (isSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line
  }, [isSelecting, startPoint]);

  const handleSave = () => {
    if (selection) {
      onSave(selection);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#232323] text-[#E0E0E0] rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col border border-[#2F2F2F]">
        {/* Header */}
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#E0E0E0]">Select Correct Area</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <p className="text-sm text-[#B0B0B0] mb-4">
            Click and drag to select the correct area on the image. Participants who click inside this area will be marked as correct.
          </p>
          
          <div 
            ref={containerRef}
            className="relative inline-block max-w-full"
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Select area"
              className="max-w-full h-auto cursor-crosshair select-none"
              onMouseDown={handleMouseDown}
              draggable={false}
            />
            
            {/* Selection overlay */}
            {selection && (
              <div
                className="absolute border-2 border-[#4FC3F7] bg-[#4FC3F7]/25"
                style={{
                  left: `${selection.x}%`,
                  top: `${selection.y}%`,
                  width: `${selection.width}%`,
                  height: `${selection.height}%`,
                  pointerEvents: 'none'
                }}
              >
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A2A2A] flex items-center justify-between">
          <button
            onClick={() => setSelection(null)}
            className="px-4 py-2 text-sm text-[#E0E0E0] hover:bg-[#2A2A2A] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!selection}
          >
            Clear Selection
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-[#E0E0E0] hover:bg-[#2A2A2A] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selection}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#388E3C] hover:bg-[#2E7D32] disabled:bg-[#555555] text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Save Area
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaSelector;
