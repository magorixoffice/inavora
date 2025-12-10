import { Send } from 'lucide-react';

const MCQParticipantInput = ({
  slide,
  selectedAnswer,
  onSelect,
  hasSubmitted,
  voteCounts,
  onSubmit
}) => {
  if (!slide) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#E0E0E0] text-center leading-tight">
          {slide.question}
        </h2>
      </div>

      {!hasSubmitted ? (
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {slide.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => onSelect(option)}
              className={`w-full p-4 sm:p-6 rounded-xl text-left text-base sm:text-xl font-semibold transition-all active:scale-[0.98] ${selectedAnswer === option
                ? 'bg-gradient-to-r from-[#388E3C] to-[#2E7D32] text-white shadow-lg shadow-[#4CAF50]/30 scale-[1.02]'
                : 'bg-[#2A2A2A] text-[#E0E0E0] hover:bg-[#333333] border border-[#2F2F2F]'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {slide.options?.map((option, index) => {
            const voteCount = voteCounts[option] || 0;
            const maxVotes = Math.max(...Object.values(voteCounts || {}), 1);
            const percentage = maxVotes > 0 ? (voteCount / maxVotes) * 100 : 0;

            return (
              <div key={index} className="relative">
                <div className="relative h-14 sm:h-16 bg-[#2A2A2A] rounded-xl overflow-hidden border border-[#2F2F2F]">
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${selectedAnswer === option
                      ? 'bg-gradient-to-r from-[#388E3C] to-[#4CAF50]'
                      : 'bg-gradient-to-r from-[#2A2A2A] to-[#333333]'
                      }`}
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative h-full flex items-center justify-between px-4 sm:px-6">
                    <span className="text-base sm:text-lg font-semibold text-[#E0E0E0]">
                      {option}
                      {selectedAnswer === option && (
                        <span className="ml-2 text-[#4CAF50]">✓</span>
                      )}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-[#E0E0E0]">
                      {voteCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!hasSubmitted && (
        <button
          onClick={onSubmit}
          disabled={!selectedAnswer}
          className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#388E3C] to-[#2E7D32] hover:from-[#4CAF50] hover:to-[#388E3C] disabled:from-[#1F1F1F] disabled:to-[#1F1F1F] disabled:text-[#6C6C6C] text-white rounded-xl text-lg sm:text-xl font-semibold transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-[#4CAF50]/20 disabled:shadow-none"
        >
          <Send className="h-5 w-5" />
          Submit Answer
        </button>
      )}

      {hasSubmitted && (
        <div className="text-center py-4">
          <p className="text-base sm:text-lg text-[#4CAF50] font-semibold">
            ✓ Response submitted! Waiting for next slide...
          </p>
        </div>
      )}
    </div>
  );
};

export default MCQParticipantInput;
