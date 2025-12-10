import { BarChart2 } from 'lucide-react';
import PickAnswerPresenterResults from './PresenterResults';

const PickAnswerPresenterView = ({
  slide,
  responses = [],
  sendSocketMessage
}) => {
  // Count votes for each option
  const voteCounts = {};
  if (slide.options) {
    slide.options.forEach(option => {
      voteCounts[option] = 0;
    });
  }

  responses.forEach(response => {
    if (voteCounts.hasOwnProperty(response.answer)) {
      voteCounts[response.answer]++;
    }
  });

  const totalResponses = responses.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-[#1F1F1F] rounded-2xl sm:rounded-3xl border border-[#2A2A2A] shadow-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#E0E0E0] leading-tight">
              {slide?.question || 'Pick your answer'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6C6C6C] mt-2 flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              Live results updating in real-time
            </p>
          </div>
          
          <div className={`px-4 py-3 rounded-2xl border border-[#2A2A2A] bg-[#2A2A2A] text-[#6C6C6C] flex flex-col items-start gap-1 min-w-[12rem]`}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BarChart2 className="h-4 w-4" />
              <span>{totalResponses} responses</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <PickAnswerPresenterResults 
          options={slide.options || []} 
          voteCounts={voteCounts} 
          totalResponses={totalResponses} 
        />
      </div>
    </div>
  );
};

export default PickAnswerPresenterView;