import { useRef, useEffect, useState } from 'react';
import { MapPin, Users } from 'lucide-react';

const PinOnImagePresenterView = ({ slide, pinResults = [], totalResponses = 0 }) => {
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = slide?.pinOnImageSettings?.imageUrl;
  const hasResponses = totalResponses > 0 && Array.isArray(pinResults) && pinResults.length > 0;

  useEffect(() => {
    setImageLoaded(false);
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center py-16 text-[#6C6C6C]">
        <p className="text-sm">No image configured</p>
      </div>
    );
  }

  // Add slight jitter to overlapping pins for visibility
  const jitteredPins = pinResults.map((pin, index) => {
    // Check for nearby pins
    const nearby = pinResults.filter((p, i) => {
      if (i >= index) return false;
      const distance = Math.sqrt(
        Math.pow(p.x - pin.x, 2) + Math.pow(p.y - pin.y, 2)
      );
      return distance < 3; // Within 3% distance
    });

    if (nearby.length > 0) {
      // Add small random offset
      const angle = (index * 137.5) % 360; // Golden angle for distribution
      const offset = 1.5;
      return {
        ...pin,
        x: pin.x + Math.cos(angle * Math.PI / 180) * offset,
        y: pin.y + Math.sin(angle * Math.PI / 180) * offset
      };
    }

    return pin;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl sm:rounded-3xl border border-[#2A2A2A] bg-[#1F1F1F] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#E0E0E0]">
              {slide?.question || 'Pin on Image Results'}
            </h2>
            <div className="flex items-center gap-2 rounded-full bg-[#1D2A20] border border-[#2E7D32]/30 px-4 py-2">
              <Users className="h-4 w-4 text-[#4CAF50]" />
              <span className="text-sm font-medium text-[#4CAF50]">
                {totalResponses} response{totalResponses === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Image with Pins */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
            <div className="flex-1 w-full">
              {!hasResponses ? (
                <div className="flex items-center justify-center py-24 sm:py-32 text-[#6C6C6C] bg-[#2A2A2A] rounded-xl border-2 border-dashed border-[#2F2F2F]">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50 text-[#4CAF50]" />
                    <p className="text-sm">Waiting for responses...</p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-[#2A2A2A] bg-[#2A2A2A]">
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Pin placement results"
                    onLoad={() => setImageLoaded(true)}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '600px' }}
                  />

                  {/* Render all pins */}
                  {imageLoaded && jitteredPins.map((pin, index) => (
                    <div
                      key={index}
                      className="absolute transform -translate-x-1/2 -translate-y-full animate-pin-drop"
                      style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <MapPin 
                        className="w-6 h-6 text-[#4CAF50] drop-shadow-lg opacity-80 hover:opacity-100 transition-opacity" 
                        fill="currentColor"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats Panel */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-[#2A2A2A] rounded-xl p-4 border border-[#2F2F2F]">
                <h3 className="text-sm font-semibold text-[#E0E0E0] mb-3">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#B0B0B0]">Total Pins:</span>
                    <span className="text-lg font-bold text-[#4CAF50]">{pinResults.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#B0B0B0]">Responses:</span>
                    <span className="text-lg font-bold text-[#E0E0E0]">{totalResponses}</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 bg-[#1D2A20] border border-[#2E7D32]/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[#4CAF50] flex-shrink-0 mt-0.5" fill="currentColor" />
                  <div className="text-xs text-[#B0B0B0]">
                    Each pin represents a participant's response. Overlapping pins are slightly offset for visibility.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pin-drop {
          0% {
            transform: translateX(-50%) translateY(-200%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateX(-50%) translateY(-100%) scale(1.2);
          }
          100% {
            transform: translateX(-50%) translateY(-100%) scale(1);
            opacity: 0.8;
          }
        }
        .animate-pin-drop {
          animation: pin-drop 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PinOnImagePresenterView;
