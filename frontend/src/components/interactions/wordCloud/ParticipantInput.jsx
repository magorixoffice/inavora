import { Send } from 'lucide-react';

const MAX_WORD_LENGTH = 20;

const WordCloudParticipantInput = ({
  slide,
  textAnswer,
  onTextChange,
  hasSubmitted,
  onSubmit,
  submissionCount = 0,
  maxSubmissions = 1,
}) => {
  if (!slide) return null;

  const handleInputChange = (value) => {
    if (hasSubmitted) return;
    const firstWord = value.trim().split(/\s+/)[0] || '';
    const limitedWord = firstWord.slice(0, MAX_WORD_LENGTH);
    onTextChange(limitedWord);
  };

  const remainingSubmissions = Math.max(0, maxSubmissions - submissionCount);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#E0E0E0] text-center leading-tight">
          {slide.question}
        </h2>
        {typeof slide.maxWordsPerParticipant === 'number' && (
          <div className="text-center text-[#B0B0B0] mt-3 sm:mt-4 text-xs sm:text-sm space-y-1">
            <p>
              Enter up to {slide.maxWordsPerParticipant} word{slide.maxWordsPerParticipant > 1 ? 's' : ''}. One word per submission, {MAX_WORD_LENGTH}-character limit.
            </p>
            <p className="font-medium text-[#4CAF50]">
              Remaining submissions: {remainingSubmissions}
            </p>
          </div>
        )}
      </div>

      {!hasSubmitted ? (
        <div className="space-y-4 mb-6 sm:mb-8">
          <input
            type="text"
            value={textAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type your word(s)"
            maxLength={MAX_WORD_LENGTH}
            disabled={hasSubmitted}
            className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#2F2F2F] text-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] outline-none placeholder-[#6C6C6C] transition-all"
          />
          <button
            onClick={onSubmit}
            disabled={!textAnswer.trim() || hasSubmitted}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#388E3C] to-[#2E7D32] hover:from-[#4CAF50] hover:to-[#388E3C] disabled:from-[#1F1F1F] disabled:to-[#1F1F1F] disabled:text-[#6C6C6C] text-white rounded-xl text-lg sm:text-xl font-semibold transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-[#4CAF50]/20 disabled:shadow-none"
          >
            <Send className="h-5 w-5" />
            Submit
          </button>
        </div>
      ) : (
        <div className="bg-[#2A2A2A] border border-[#2F2F2F] rounded-xl p-6">
          <p className="text-center text-[#B0B0B0]">Submission limit reached for this slide. Thanks for participating!</p>
        </div>
      )}
    </div>
  );
};

export default WordCloudParticipantInput;
