import { useState, useEffect, useRef } from 'react';
import { LoaderCircle, Download } from 'lucide-react';
import * as presentationService from '../../services/presentationService';

// Import new Result Components
import MCQResult from '../interactions/Results/MCQResult';
import WordCloudResult from '../interactions/Results/WordCloudResult';
import OpenEndedResult from '../interactions/Results/OpenEndedResult';
import ScalesResult from '../interactions/Results/ScalesResult';
import RankingResult from '../interactions/Results/RankingResult';
import HundredPointsResult from '../interactions/Results/HundredPointsResult';
import QuizResult from '../interactions/Results/QuizResult';
import LeaderboardResult from '../interactions/Results/LeaderboardResult';
import QnaResult from '../interactions/Results/QnaResult';
import GuessNumberResult from '../interactions/Results/GuessNumberResult';
import GridResult from '../interactions/Results/GridResult';
import PinOnImageResult from '../interactions/Results/PinOnImageResult';
import PickAnswerResult from '../interactions/Results/PickAnswerResult';
import TypeAnswerResult from '../interactions/Results/TypeAnswerResult';
import MiroResult from '../interactions/Results/MiroResult';
import PowerPointResult from '../interactions/Results/PowerPointResult';
import GoogleSlidesResult from '../interactions/Results/GoogleSlidesResult';
import UploadResult from '../interactions/Results/UploadResult';
import InstructionResult from '../interactions/Results/InstructionResult';
import TextResult from '../interactions/Results/TextResult';
import ImageResult from '../interactions/Results/ImageResult';
import VideoResult from '../interactions/Results/VideoResult';

const PresentationResults = ({ slides, presentationId }) => {
    const [results, setResults] = useState(null);
    const [presentation, setPresentation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const resultsRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!presentationId) return;

            setIsLoading(true);
            try {
                // Fetch both results and presentation data
                const [resultsData, presentationData] = await Promise.all([
                    presentationService.getPresentationResults(presentationId),
                    presentationService.getPresentationById(presentationId)
                ]);
                
                setResults(resultsData);
                setPresentation(presentationData.presentation);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load results. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [presentationId]);

    const handleExportToPDF = async () => {
        if (!resultsRef.current) {
            alert('No content to export.');
            return;
        }
        
        setIsExporting(true);
        
        try {
            // Create a print-friendly version with preserved styling
            const printWindow = window.open('', '_blank');
            const content = resultsRef.current.innerHTML;
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Presentation Results</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        
                        body {
                            font-family: 'Inter', sans-serif;
                            background-color: #1a1a1a;
                            color: #e0e0e0;
                            padding: 20px;
                            margin: 0;
                        }
                        
                        .pdf-header {
                            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 12px;
                            margin-bottom: 30px;
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                        }
                        
                        .pdf-title {
                            font-size: 28px;
                            font-weight: 700;
                            margin-bottom: 10px;
                        }
                        
                        .pdf-subtitle {
                            font-size: 16px;
                            opacity: 0.8;
                        }
                        
                        .pdf-slide {
                            page-break-inside: avoid;
                            margin-bottom: 30px;
                            background: #1f1f1f;
                            border-radius: 12px;
                            padding: 20px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                            border: 1px solid #2a2a2a;
                        }
                        
                        .pdf-slide-title {
                            font-size: 20px;
                            font-weight: 600;
                            color: #e0e0e0;
                            margin-bottom: 15px;
                            padding-bottom: 10px;
                            border-bottom: 1px solid #2a2a2a;
                        }
                        
                        /* Result Card Styles */
                        .result-card {
                            background-color: #1f1f1f;
                            border-radius: 12px;
                            border: 1px solid #2a2a2a;
                            padding: 20px;
                        }
                        
                        .result-header {
                            margin-bottom: 20px;
                            padding-bottom: 15px;
                            border-bottom: 1px solid #2a2a2a;
                        }
                        
                        .result-title {
                            font-size: 18px;
                            font-weight: 600;
                            color: #e0e0e0;
                            margin-bottom: 5px;
                        }
                        
                        .result-meta {
                            display: flex;
                            gap: 15px;
                            font-size: 14px;
                            color: #94a3b8;
                        }
                        
                        /* Progress Bar Styles */
                        .progress-bar-container {
                            position: relative;
                            height: 56px;
                            background: #334155;
                            border-radius: 12px;
                            overflow: hidden;
                            margin-bottom: 10px;
                        }
                        
                        .progress-bar-fill {
                            height: 100%;
                            background: linear-gradient(90deg, #3b82f6, #2563eb);
                            border-radius: 12px;
                        }
                        
                        .progress-bar-content {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 0 24px;
                            color: #e0e0e0;
                        }
                        
                        /* Scale Result Styles */
                        .scale-container {
                            margin-bottom: 20px;
                        }
                        
                        .scale-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                            margin-bottom: 8px;
                        }
                        
                        .scale-label {
                            font-size: 16px;
                            font-weight: 500;
                            color: #e2e8f0;
                        }
                        
                        .scale-value {
                            font-size: 24px;
                            font-weight: 700;
                            color: #f97316;
                        }
                        
                        .scale-bar {
                            position: relative;
                            height: 16px;
                            background: #334155;
                            border-radius: 9999px;
                            overflow: hidden;
                        }
                        
                        .scale-fill {
                            height: 100%;
                            background: linear-gradient(90deg, #f97316, #ea580c);
                            border-radius: 9999px;
                        }
                        
                        .scale-labels {
                            display: flex;
                            justify-content: space-between;
                            font-size: 12px;
                            color: #94a3b8;
                            font-weight: 500;
                            margin-top: 4px;
                        }
                        
                        /* Word Cloud Styles */
                        .word-cloud-container {
                            background: #2a2a2a;
                            border-radius: 12px;
                            padding: 20px;
                            min-height: 300px;
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: center;
                            align-items: center;
                            gap: 10px;
                        }
                        
                        .word-cloud-word {
                            display: inline-block;
                            font-weight: bold;
                            color: #cbd5e1;
                            margin: 5px;
                        }
                        
                        /* Quiz Result Styles */
                        .quiz-option {
                            position: relative;
                            margin-bottom: 12px;
                        }
                        
                        .quiz-bar-container {
                            position: relative;
                            height: 64px;
                            background: #334155;
                            border-radius: 12px;
                            overflow: hidden;
                        }
                        
                        .quiz-bar-fill {
                            height: 100%;
                            background: linear-gradient(90deg, #8b5cf6, #7c3aed);
                            border-radius: 12px;
                        }
                        
                        .quiz-correct .quiz-bar-fill {
                            background: linear-gradient(90deg, #10b981, #059669);
                        }
                        
                        .quiz-bar-content {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 0 24px;
                            color: #e0e0e0;
                        }
                        
                        .quiz-option-text {
                            font-size: 16px;
                            font-weight: 500;
                        }
                        
                        .quiz-stats {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        }
                        
                        .quiz-votes {
                            font-size: 14px;
                            color: #94a3b8;
                        }
                        
                        .quiz-percentage {
                            font-size: 18px;
                            font-weight: 700;
                        }
                        
                        .quiz-correct .quiz-percentage {
                            color: #10b981;
                        }
                        
                        /* Hide interactive elements */
                        button, input, textarea, .interactive-element {
                            display: none !important;
                        }
                        
                        /* Ensure all elements are visible */
                        * {
                            visibility: visible !important;
                        }
                        
                        /* Print specific styles */
                        @media print {
                            body {
                                background-color: #1a1a1a;
                                color: #e0e0e0;
                                -webkit-print-color-adjust: exact;
                                color-adjust: exact;
                            }
                            
                            .pdf-header, .pdf-slide {
                                box-shadow: none;
                                border: 1px solid #2a2a2a;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="pdf-header">
                        <div class="pdf-title">Presentation Results Report</div>
                        <div class="pdf-subtitle">Detailed Analysis of All Responses Collected</div>
                        <div class="pdf-subtitle">Generated on: ${new Date().toLocaleString()}</div>
                    </div>
                    ${content}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.focus();
            
            // Wait a bit for content to load then print
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
                setIsExporting(false);
            }, 1500);
        } catch (err) {
            console.error('Failed to export PDF:', err);
            alert(`Failed to export PDF. Error: ${err.message || 'Unknown error'}.`);
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 bg-[#1A1A1A] p-4 sm:p-6 md:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto h-full flex items-center justify-center">
                    <LoaderCircle className="animate-spin text-[#4CAF50]" size={40} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 bg-[#1A1A1A] p-4 sm:p-6 md:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto h-full flex items-center justify-center">
                    <div className="text-center p-4 text-[#EF5350] text-sm sm:text-base">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!slides || slides.length === 0) {
        return (
            <div className="flex-1 bg-[#1A1A1A] p-4 sm:p-6 md:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto h-full flex items-center justify-center">
                    <div className="text-center p-4 text-[#B0B0B0] text-sm sm:text-base">
                        No slides in this presentation.
                    </div>
                </div>
            </div>
        );
    }

    const getSlideResults = (slide) => {
        if (!results) return {};
        return results[slide.id] || results[slide._id] || {};
    };

    const renderSlideResult = (slide) => {
        const slideResults = getSlideResults(slide);

        switch (slide.type) {
            case 'multiple_choice':
                return <MCQResult slide={slide} data={slideResults} />;
            case 'word_cloud':
                return <WordCloudResult slide={slide} data={slideResults} />;
            case 'open_ended':
                return <OpenEndedResult slide={slide} data={slideResults} />;
            case 'scales':
                return <ScalesResult slide={slide} data={slideResults} />;
            case 'ranking':
                return <RankingResult slide={slide} data={slideResults} />;
            case 'hundred_points':
                return <HundredPointsResult slide={slide} data={slideResults} />;
            case 'quiz':
                return <QuizResult slide={slide} data={slideResults} />;
            case 'leaderboard':
                return <LeaderboardResult slide={slide} data={slideResults} />;
            case 'qna':
                return <QnaResult slide={slide} data={slideResults} />;
            case 'guess_number':
                return <GuessNumberResult slide={slide} data={slideResults} />;
            case '2x2_grid':
                return <GridResult slide={slide} data={slideResults} />;
            case 'pin_on_image':
                return <PinOnImageResult slide={slide} data={slideResults} />;
            case 'pick_answer':
                return <PickAnswerResult slide={slide} data={slideResults} />;
            case 'type_answer':
                return <TypeAnswerResult slide={slide} data={slideResults} />;
            case 'miro':
                return <MiroResult slide={slide} data={slideResults} />;
            case 'powerpoint':
                return <PowerPointResult slide={slide} data={slideResults} />;
            case 'google_slides':
                return <GoogleSlidesResult slide={slide} data={slideResults} />;
            case 'upload':
                return <UploadResult slide={slide} data={slideResults} />;
            case 'instruction':
                return <InstructionResult slide={slide} data={slideResults} presentation={presentation} />;
            case 'text':
                return <TextResult slide={slide} data={slideResults} />;
            case 'image':
                return <ImageResult slide={slide} data={slideResults} />;
            case 'video':
                return <VideoResult slide={slide} data={slideResults} />;
            default:
                return (
                    <div className="text-center text-[#B0B0B0] py-6 sm:py-8 bg-[#1F1F1F] rounded-xl border border-[#2A2A2A]">
                        <p className="mb-2 font-medium text-[#E0E0E0] text-sm sm:text-base">{slide.question || 'Untitled Slide'}</p>
                        <p className="text-xs sm:text-sm text-[#6C6C6C]">Results visualization coming soon for {slide.type}.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex-1 bg-[#1A1A1A] p-4 sm:p-6 md:p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-12 sm:pb-16 md:pb-20">
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E0E0E0] mb-1 sm:mb-2">Presentation Results</h2>
                            <p className="text-sm sm:text-base text-[#B0B0B0]">Overview of all responses collected</p>
                        </div>
                        <button
                            onClick={handleExportToPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl"
                        >
                            <Download className="w-4 h-4" />
                            {isExporting ? 'Exporting...' : 'Export to PDF'}
                        </button>
                    </div>
                </div>

                <div ref={resultsRef}>
                    {slides.map((slide, index) => (
                        <div key={slide.id || slide._id || index} className="w-full mb-6 sm:mb-8 pdf-slide">
                            <h3 className="text-xl font-semibold text-[#E0E0E0] mb-4 pdf-slide-title">
                                Slide {index + 1}: {slide.question || slide.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            {renderSlideResult(slide)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PresentationResults;