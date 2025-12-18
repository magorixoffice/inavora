import React, { useState, useEffect } from 'react';

const PowerPointParticipantView = ({ slide, isPreview = false }) => {
  const powerpointUrl = slide?.powerpointUrl;
  const powerpointPublicId = slide?.powerpointPublicId;
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if it's an uploaded file (has publicId) or an embeddable URL
  const isUploadedFile = !!powerpointPublicId;
  const isEmbeddableUrl = powerpointUrl && (
    powerpointUrl.includes('onedrive.live.com/embed') ||
    powerpointUrl.includes('office.com/embed') ||
    powerpointUrl.includes('sharepoint.com/embed') ||
    powerpointUrl.includes('view.officeapps.live.com')
  );

  // For uploaded files, use Google Docs Viewer as an alternative
  // Office Online Viewer doesn't work with Cloudinary URLs
  // Google Docs Viewer can display PowerPoint files
  const getEmbedUrl = () => {
    if (!powerpointUrl || !powerpointUrl.trim()) return null;
    
    const trimmedUrl = powerpointUrl.trim();
    
    // Don't try to embed blob URLs - they're temporary and won't work
    if (trimmedUrl.startsWith('blob:')) {
      return null;
    }
    
    // If it's already an embeddable URL, use it directly
    if (isEmbeddableUrl) {
      return trimmedUrl;
    }
    
    // For all PowerPoint URLs (uploaded or external), try Google Docs Viewer
    // Ensure URL is properly formatted (HTTPS)
    let urlToEncode = trimmedUrl;
    if (!urlToEncode.startsWith('http://') && !urlToEncode.startsWith('https://')) {
      urlToEncode = `https://${urlToEncode}`;
    }
    
    // Encode the URL properly
    const encodedUrl = encodeURIComponent(urlToEncode);
    // Try the standard viewer endpoint first (more reliable)
    return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
  };

  const embedUrl = getEmbedUrl();

  // Reset loading state when URL changes
  useEffect(() => {
    if (embedUrl) {
      setIsLoading(true);
      
      // Set a timeout to hide loading after a reasonable time
      // Google Docs Viewer can take time to load, but we'll hide loading after 8 seconds
      // This ensures content is visible even if onLoad doesn't fire
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 8000);
      
      return () => clearTimeout(loadingTimeout);
    } else {
      setIsLoading(false);
    }
  }, [embedUrl]);

  // Handle iframe load success
  const handleIframeLoad = (e) => {
    // Add delay to ensure content is rendered
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {slide?.question && (
            <h2 className="text-2xl font-bold text-white mb-4 text-center">{slide.question}</h2>
          )}
          
          {powerpointUrl && !powerpointUrl.trim().startsWith('blob:') ? (
            embedUrl ? (
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
                  key={embedUrl} // Force re-render when URL changes
                  src={embedUrl}
                  title="PowerPoint Presentation"
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  onLoad={handleIframeLoad}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  style={{ 
                    minHeight: '600px', 
                    opacity: isLoading ? 0.3 : 1, 
                    transition: 'opacity 0.5s ease-in-out',
                    visibility: isLoading ? 'visible' : 'visible'
                  }}
                />
              </div>
            ) : (
              // Fallback: Generate embed URL on the fly if it wasn't generated
              <div className="w-full bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg relative" style={{ minHeight: '600px', height: '80vh' }}>
                {(() => {
                  const trimmedUrl = powerpointUrl.trim();
                  let urlToEncode = trimmedUrl;
                  if (!urlToEncode.startsWith('http://') && !urlToEncode.startsWith('https://')) {
                    urlToEncode = `https://${urlToEncode}`;
                  }
                  const encodedUrl = encodeURIComponent(urlToEncode);
                  const fallbackEmbedUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
                  
                  return (
                    <>
                      {isLoading && (
                        <div className="absolute inset-0 bg-[#1F1F1F] flex items-center justify-center z-10">
                          <div className="text-center p-6">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mb-4"></div>
                            <p className="text-[#E0E0E0]">Loading presentation...</p>
                          </div>
                        </div>
                      )}
                      <iframe 
                        key={fallbackEmbedUrl}
                        src={fallbackEmbedUrl}
                        title="PowerPoint Presentation"
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                        onLoad={handleIframeLoad}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        style={{ 
                          minHeight: '600px', 
                          opacity: isLoading ? 0.3 : 1, 
                          transition: 'opacity 0.5s ease-in-out',
                          visibility: isLoading ? 'visible' : 'visible'
                        }}
                      />
                    </>
                  );
                })()}
              </div>
            )
          ) : powerpointUrl && powerpointUrl.trim().startsWith('blob:') ? (
            <div className="aspect-video bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg">
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-900/20 to-red-900/20">
                <div className="text-center p-6">
                  <div className="mx-auto w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">PowerPoint Presentation</h3>
                  <p className="text-yellow-400 mb-2">⚠️ Temporary file detected</p>
                  <p className="text-gray-300 mb-4">The presentation is being processed. Please wait...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-[#1F1F1F] rounded-xl overflow-hidden border border-[#3B3B3B] shadow-lg">
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-900/20 to-red-900/20">
                <div className="text-center p-6">
                  <div className="mx-auto w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">PowerPoint Presentation</h3>
                  <p className="text-gray-300 mb-4">No presentation URL configured</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerPointParticipantView;