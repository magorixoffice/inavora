import React from 'react';
import { BookOpen } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const InstructionPresenterView = ({ slide, presentation }) => {
  // Get the presentation access code
  const accessCode = presentation?.accessCode || '000000';
  
  // Construct the URL for joining the presentation
  const joinUrl = `${window.location.origin}/join/${btoa(accessCode)}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 text-teal-500 mr-3" />
            <h2 className="text-2xl font-bold text-white">Instructions</h2>
          </div>
          
          <div className="bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Website and Access Code */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#2A2A2A] rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Join via Website</h3>
                <p className="text-gray-300 mb-4 text-center">
                  Participants should go to <span className="font-semibold text-teal-400">www.inavora.com</span> and enter the code below to join
                </p>
                <div className="bg-[#1A1A1A] rounded-lg p-4 mb-4">
                  <p className="text-3xl font-bold text-teal-400 tracking-wider">{accessCode}</p>
                </div>
                <div className="text-sm text-gray-400 text-center">
                  <p>This is the access code for your presentation</p>
                </div>
              </div>
              
              {/* Right Column - QR Code */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#2A2A2A] rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Scan QR Code</h3>
                <p className="text-gray-300 mb-4 text-center">
                  Participants can scan this QR code to join directly
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG 
                    value={joinUrl} 
                    size={128} 
                    level={'H'} 
                    includeMargin={true}
                  />
                </div>
                <div className="text-sm text-gray-400 text-center mt-3">
                  <p>QR code automatically directs to this presentation</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-400">
              <p>
                Participants who are not signed in will be prompted to enter their name before joining.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionPresenterView;