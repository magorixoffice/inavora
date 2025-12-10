import React from 'react';

const MiroParticipantView = ({ slide, isPreview = false }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">{slide.question}</h2>
          
          <div className="aspect-video bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg">
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/20">
              <div className="text-center p-6">
                <div className="mx-auto w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Miro Board Interaction</h3>
                <p className="text-gray-300 mb-4">Click below to open the Miro board in a new tab</p>
                <a 
                  href={slide.miroUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200"
                >
                  Open Miro Board
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
            You'll be redirected to the Miro board in a new tab
          </div>
        </div>
      )}
    </div>
  );
};

export default MiroParticipantView;