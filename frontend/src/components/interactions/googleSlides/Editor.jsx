import React, { useState, useEffect, useRef } from 'react';
import SlideTypeHeader from '../common/SlideTypeHeader';
import { useTranslation } from 'react-i18next';

const GoogleSlidesEditor = ({ slide, onUpdate }) => {
  const { t } = useTranslation();
  const [question, setQuestion] = useState(slide?.question || '');
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState(slide?.googleSlidesUrl || '');
  const isMounted = useRef(false);

  useEffect(() => {
    // Skip the first render to avoid infinite loop
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    
    // Update parent component when state changes
    onUpdate({
      question: question.trim(),
      googleSlidesUrl: googleSlidesUrl.trim()
    });
  }, [question, googleSlidesUrl, onUpdate]);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-[#1F1F1F] text-[#E0E0E0]">
      <SlideTypeHeader type="google_slides" />
      
      <div className="p-4 border-b border-[#2A2A2A]">
        <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
          {t('slide_editors.google_slides.question_label')}
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('slide_editors.google_slides.question_placeholder')}
          className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3B3B3B] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          rows="3"
        />
      </div>

      <div className="p-4 border-b border-[#2A2A2A]">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('slide_editors.google_slides.url_label')}
        </label>
        <input
          type="url"
          value={googleSlidesUrl}
          onChange={(e) => setGoogleSlidesUrl(e.target.value)}
          placeholder={t('slide_editors.google_slides.url_placeholder')}
          className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3B3B3B] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          {t('slide_editors.google_slides.url_description')}
        </p>
      </div>

      {googleSlidesUrl && (
        <div className="p-4 border-b border-[#2A2A2A]">
          <h4 className="text-sm font-medium text-gray-300 mb-2">{t('slide_editors.google_slides.preview_title')}</h4>
          <div className="aspect-video bg-[#1F1F1F] rounded overflow-hidden">
            <iframe 
              src={`${googleSlidesUrl.replace('/edit', '/embed')}?start=false&loop=false&delayms=3000`} 
              title={t('slide_editors.google_slides.preview_title')} 
              className="w-full h-full"
              frameBorder="0" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSlidesEditor;