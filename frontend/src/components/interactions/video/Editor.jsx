import { useState, useEffect } from 'react';
import { Video, Link } from 'lucide-react';
import SlideTypeHeader from '../common/SlideTypeHeader';
import { useTranslation } from 'react-i18next';

const VideoEditor = ({ slide, onUpdate }) => {
  const { t } = useTranslation();
  const [question, setQuestion] = useState(slide?.question || '');
  const [videoUrl, setVideoUrl] = useState(slide?.videoUrl || '');

  useEffect(() => {
    if (slide) {
      setQuestion(slide.question || '');
      setVideoUrl(slide.videoUrl || '');
    }
  }, [slide]);

  const handleQuestionChange = (value) => {
    setQuestion(value);
    onUpdate({ ...slide, question: value });
  };

  const handleVideoUrlChange = (value) => {
    setVideoUrl(value);
    onUpdate({ ...slide, videoUrl: value });
  };

  // Extract video ID from YouTube URL for preview
  const getYoutubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Check if URL is a valid video URL
  const isValidVideoUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-[#1F1F1F] text-[#E0E0E0]">
      <SlideTypeHeader type="video" />

      <div className="p-4 border-b border-[#2A2A2A]">
        <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
          {t('slide_editors.video.title_label')}
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          className="w-full px-3 py-2 border border-[#2A2A2A] rounded-lg text-sm bg-[#232323] text-[#E0E0E0] placeholder-[#8A8A8A] focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent outline-none"
          placeholder={t('slide_editors.video.title_placeholder')}
        />
      </div>

      <div className="p-4 border-b border-[#2A2A2A]">
        <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
          {t('slide_editors.video.url_label')}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-4 w-4 text-[#9E9E9E]" />
            </div>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-[#2A2A2A] rounded-lg text-sm bg-[#232323] text-[#E0E0E0] placeholder-[#8A8A8A] focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent outline-none"
              placeholder={t('slide_editors.video.url_placeholder')}
            />
          </div>
        </div>
        
        {videoUrl && (
          <div className="mt-4">
            {isValidVideoUrl(videoUrl) ? (
              <div className="rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#232323]">
                <div className="aspect-video bg-black flex items-center justify-center">
                  <iframe
                    src={getYoutubeEmbedUrl(videoUrl)}
                    title={t('slide_editors.video.preview_title')}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[#2A2A2A] bg-[#232323] p-4 text-center">
                <Video className="h-10 w-10 text-[#9E9E9E] mx-auto mb-2" />
                <p className="text-sm text-[#9E9E9E]">
                  {t('slide_editors.video.invalid_url_message')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoEditor;