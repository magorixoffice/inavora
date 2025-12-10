import React from 'react';

const PowerPointParticipantView = ({ slide, isPreview = false }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">{slide.question}</h2>
          
          <div className="aspect-video bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg">
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-900/20 to-red-900/20">
              <div className="text-center p-6">
                <div className="mx-auto w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">PowerPoint Presentation</h3>
                <p className="text-gray-300 mb-4">Click below to view the PowerPoint presentation</p>
                <a 
                  href={slide.powerpointUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition duration-200"
                >
                  View Presentation
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isPreview && (
        <div className="bg-[#1A1A1A] border-t border-[#3B3B3B] p-4">
          <div className="text-center text-sm text-gray-400">
            You'll be redirected to view the PowerPoint presentation
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerPointParticipantView;