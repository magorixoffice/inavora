import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PdfParticipantView = ({ slide }) => {
  const { t } = useTranslation();
  const pdfPages = slide?.pdfPages || [];
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  if (!pdfPages || pdfPages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1F1F1F] text-[#E0E0E0]">
        <div className="text-center">
          <p className="text-lg mb-2">{t('slide_editors.pdf.no_pages')}</p>
        </div>
      </div>
    );
  }

  const currentPage = pdfPages[currentPageIndex];
  const totalPages = pdfPages.length;

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  return (
    <div className="w-full h-full bg-[#1F1F1F] flex flex-col">
      {/* PDF Page Display */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-auto">
        <img 
          src={currentPage?.imageUrl} 
          alt={`Page ${currentPage?.pageNumber}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Navigation Controls */}
      <div className="bg-[#2A2A2A] border-t border-[#3B3B3B] p-4 flex items-center justify-between">
        <button
          onClick={goToPreviousPage}
          disabled={currentPageIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentPageIndex === 0
              ? 'bg-[#3B3B3B] text-[#666666] cursor-not-allowed'
              : 'bg-[#4CAF50] hover:bg-[#43A047] text-white'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{t('slide_editors.pdf.previous')}</span>
        </button>

        <div className="text-[#E0E0E0] text-sm font-medium">
          {t('slide_editors.pdf.page')} {currentPageIndex + 1} / {totalPages}
        </div>

        <button
          onClick={goToNextPage}
          disabled={currentPageIndex === totalPages - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentPageIndex === totalPages - 1
              ? 'bg-[#3B3B3B] text-[#666666] cursor-not-allowed'
              : 'bg-[#4CAF50] hover:bg-[#43A047] text-white'
          }`}
        >
          <span>{t('slide_editors.pdf.next')}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PdfParticipantView;

