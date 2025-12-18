import React, { useState, useEffect } from 'react';

const UploadPresenterView = ({ slide, responses = [] }) => {
  const fileUrl = slide?.uploadedFileUrl;
  const fileName = slide?.uploadedFileName || '';
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  
  const isPDF = fileName.toLowerCase().endsWith('.pdf') || (fileUrl && fileUrl.toLowerCase().includes('.pdf'));
  const isPowerPoint = fileName.toLowerCase().endsWith('.ppt') || fileName.toLowerCase().endsWith('.pptx') || 
                       (fileUrl && (fileUrl.toLowerCase().includes('.ppt') || fileUrl.toLowerCase().includes('.pptx')));
  const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                  (fileUrl && fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i));

  // Get embed URL for PowerPoint files using Google Docs Viewer
  const getPowerPointEmbedUrl = () => {
    if (!fileUrl || !isPowerPoint) return null;
    
    const trimmedUrl = fileUrl.trim();
    
    // Don't try to embed blob URLs - they're temporary and won't work
    if (trimmedUrl.startsWith('blob:')) {
      return null;
    }
    
    // Ensure URL is properly formatted (HTTPS)
    let urlToEncode = trimmedUrl;
    if (!urlToEncode.startsWith('http://') && !urlToEncode.startsWith('https://')) {
      urlToEncode = `https://${urlToEncode}`;
    }
    
    // Encode the URL properly
    const encodedUrl = encodeURIComponent(urlToEncode);
    // Use the standard viewer endpoint (more reliable)
    return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
  };

  const powerpointEmbedUrl = getPowerPointEmbedUrl();

  // Reset loading state when URL changes
  useEffect(() => {
    if (powerpointEmbedUrl) {
      setIsLoading(true);
      setIframeError(false);
      
      // Set a timeout to hide loading after a reasonable time
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 8000);
      
      return () => clearTimeout(loadingTimeout);
    } else {
      setIsLoading(false);
    }
  }, [powerpointEmbedUrl]);

  // Handle iframe load success
  const handleIframeLoad = (e) => {
    // Check if the iframe loaded an error page
    try {
      const iframe = e.target;
      // If we can access the content, check for error messages
      // This is a best-effort check since cross-origin restrictions apply
      setTimeout(() => {
        setIsLoading(false);
        // Additional check: if iframe shows error, set error state
        // We'll rely on the timeout and visual inspection
      }, 2000);
    } catch (err) {
      // Cross-origin error is expected, just hide loading
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  // Handle iframe load error
  const handleIframeError = () => {
    setIframeError(true);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {slide?.question && (
            <h2 className="text-2xl font-bold text-white mb-4 text-center">{slide.question}</h2>
          )}
          
          {fileUrl ? (
            <>
              {isPDF ? (
                <div className="aspect-video bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg">
                  <iframe 
                    src={`${fileUrl}#toolbar=0`}
                    title="Uploaded PDF"
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              ) : isImage ? (
                <div className="bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg">
                  <img 
                    src={fileUrl}
                    alt={slide?.question || "Uploaded image"}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>
              ) : isPowerPoint && powerpointEmbedUrl ? (
                <div className="w-full bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg relative" style={{ minHeight: '600px', height: '80vh' }}>
                  {/* Loading overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-[#1F1F1F] flex items-center justify-center z-10">
                      <div className="text-center p-6">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mb-4"></div>
                        <p className="text-[#E0E0E0]">Loading presentation...</p>
                      </div>
                    </div>
                  )}
                  <iframe 
                    key={powerpointEmbedUrl}
                    src={powerpointEmbedUrl}
                    title="PowerPoint Presentation"
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    onError={handleIframeError}
                    onLoad={handleIframeLoad}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    style={{ 
                      minHeight: '600px', 
                      opacity: isLoading ? 0.3 : 1, 
                      transition: 'opacity 0.5s ease-in-out',
                      visibility: isLoading ? 'visible' : 'visible'
                    }}
                  />
                  {/* Error overlay */}
                  {iframeError && (
                    <div className="absolute inset-0 bg-[#1F1F1F] flex items-center justify-center z-10">
                      <div className="text-center p-6">
                        <p className="text-yellow-400 mb-4">Unable to embed presentation</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => {
                              setIframeError(false);
                              setIsLoading(true);
                              // Force iframe reload by changing key
                              window.location.reload();
                            }}
                            className="text-sm px-4 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-lg transition"
                          >
                            Try again
                          </button>
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition inline-flex items-center justify-center"
                          >
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : isPowerPoint && fileUrl && fileUrl.startsWith('blob:') ? (
                <div className="aspect-video bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg">
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/20 to-blue-900/20">
                    <div className="text-center p-6">
                      <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">PowerPoint Presentation</h3>
                      <p className="text-gray-300 mb-4">Click below to view or download the PowerPoint presentation</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a 
                          href={fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                        >
                          View Presentation
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                        <a 
                          href={fileUrl} 
                          download
                          className="inline-flex items-center justify-center px-6 py-3 bg-[#2A2A2A] hover:bg-[#333333] text-white font-medium rounded-lg transition duration-200 border border-[#3B3B3B]"
                        >
                          Download
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg">
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/20 to-blue-900/20">
                    <div className="text-center p-6">
                      <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Uploaded File</h3>
                      <p className="text-gray-300 mb-4">Click below to view the uploaded file</p>
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                      >
                        View File
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="aspect-video bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg">
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/20 to-blue-900/20">
                <div className="text-center p-6">
                  <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Uploaded Presentation</h3>
                  <p className="text-gray-300 mb-4">No file uploaded</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1A1A1A] border-t border-[#3B3B3B] p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Participants are viewing the uploaded presentation
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
              <span className="text-white font-medium">{responses.length}</span>
              <span className="text-gray-400 ml-1">views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPresenterView;