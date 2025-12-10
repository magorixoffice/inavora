import React from 'react';

const MiroPresenterView = ({ slide, responses = [] }) => {
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
                <p className="text-gray-300 mb-4">Participants are interacting with the Miro board</p>
                <div className="inline-flex items-center px-4 py-2 bg-purple-600 rounded-full">
                  <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  <span className="text-white">Live Collaboration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border-t border-[#3B3B3B] p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Participants can interact with the Miro board in real-time
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
              <span className="text-white font-medium">{responses.length}</span>
              <span className="text-gray-400 ml-1">interactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiroPresenterView;