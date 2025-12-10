import React from 'react';
import ResultCard from './ResultCard';
import { useTranslation } from 'react-i18next';

const UploadResult = ({ slide, data }) => {
  const { t } = useTranslation();
  const { responses = [] } = data;
  
  return (
    <ResultCard 
      slide={slide}
      totalResponses={responses.length}
    >
      <div className="space-y-6">
        <div className="bg-[#1F1F1F] rounded-lg p-6 border border-[#2A2A2A]">
          <h3 className="text-xl font-semibold text-white mb-4">{slide.question || t('slide_editors.upload.default_title')}</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-300 mb-2">{t('slide_editors.upload.question_instruction')}</h4>
            <p className="text-gray-400">{slide.question}</p>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-300 mb-2">{t('slide_editors.upload.uploaded_file')}</h4>
            <div className="bg-[#242424] rounded-lg p-4 border border-[#3B3B3B]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">{slide.uploadedFileName || t('slide_editors.upload.no_file_name')}</p>
                  <p className="text-sm text-gray-400">{t('slide_editors.upload.uploaded_presentation_file')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#242424] p-4 rounded-lg border border-[#3B3B3B]">
              <div className="text-2xl font-bold text-teal-400">{responses.length}</div>
              <div className="text-sm text-gray-400">{t('slide_editors.upload.views')}</div>
            </div>
            <div className="bg-[#242424] p-4 rounded-lg border border-[#3B3B3B]">
              <div className="text-2xl font-bold text-orange-400">{t('slide_editors.upload.source')}</div>
              <div className="text-sm text-gray-400">{t('slide_editors.upload.source_label')}</div>
            </div>
            <div className="bg-[#242424] p-4 rounded-lg border border-[#3B3B3B]">
              <div className="text-2xl font-bold text-purple-400">{t('slide_editors.upload.content_type')}</div>
              <div className="text-sm text-gray-400">{t('slide_editors.upload.content_type_label')}</div>
            </div>
          </div>
        </div>
      </div>
    </ResultCard>
  );
};

export default UploadResult;