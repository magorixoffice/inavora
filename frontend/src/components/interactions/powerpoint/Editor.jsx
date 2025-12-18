import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import SlideTypeHeader from '../common/SlideTypeHeader';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { uploadPowerPoint as uploadPowerPointService } from '../../../services/presentationService';

const PowerPointEditor = ({ slide, onUpdate }) => {
  const { t } = useTranslation();
  const [question, setQuestion] = useState(slide?.question || '');
  const [powerpointUrl, setPowerpointUrl] = useState(slide?.powerpointUrl || '');
  const [powerpointPublicId, setPowerpointPublicId] = useState(slide?.powerpointPublicId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const fileInputRef = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (slide) {
      setQuestion(slide.question || '');
      setPowerpointUrl(slide.powerpointUrl || '');
      setPowerpointPublicId(slide.powerpointPublicId || '');
      
      // If PowerPoint exists but no publicId, it's likely a URL-based PowerPoint
      if (slide.powerpointUrl && !slide.powerpointPublicId) {
        setUploadMethod('url');
      } else if (slide.powerpointPublicId) {
        setUploadMethod('file');
      }
    }
  }, [slide]);

  useEffect(() => {
    // Skip the first render to avoid infinite loop
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    
    // Update parent component when state changes
    onUpdate({
      question: question.trim(),
      powerpointUrl: powerpointUrl.trim(),
      powerpointPublicId: powerpointPublicId
    });
  }, [question, powerpointUrl, powerpointPublicId, onUpdate]);

  const handlePowerPointUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    const validExtensions = ['.ppt', '.pptx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error(t('slide_editors.powerpoint.invalid_file_type'));
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error(t('slide_editors.powerpoint.file_too_large'));
      return;
    }

    try {
      setIsUploading(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64PowerPoint = event.target.result;
          
          const uploadPromise = uploadPowerPointService(base64PowerPoint)
            .then((res) => {
              if (!res?.success) {
                throw new Error(res?.error || 'Upload failed');
              }
              return res;
            });

          toast.promise(uploadPromise, {
            loading: t('slide_editors.powerpoint.uploading'),
            success: (result) => result?.message || t('slide_editors.powerpoint.upload_success'),
            error: (err) => err?.response?.data?.error || err?.message || t('slide_editors.powerpoint.upload_error')
          });

          const result = await uploadPromise;

          setPowerpointUrl(result.data.powerpointUrl);
          setPowerpointPublicId(result.data.publicId);
          onUpdate({
            question: question.trim(),
            powerpointUrl: result.data.powerpointUrl,
            powerpointPublicId: result.data.publicId
          });
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(error?.response?.data?.error || error?.message || t('slide_editors.powerpoint.upload_error'));
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.onerror = () => {
        toast.error(t('slide_editors.powerpoint.failed_read_file'));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('PowerPoint upload error:', error);
      toast.error(t('slide_editors.powerpoint.upload_error'));
      setIsUploading(false);
    }
  };

  const handleRemovePowerPoint = () => {
    setPowerpointUrl('');
    setPowerpointPublicId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUpdate({
      question: question.trim(),
      powerpointUrl: '',
      powerpointPublicId: ''
    });
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-[#1F1F1F] text-[#E0E0E0]">
      <SlideTypeHeader type="powerpoint" />
      
      <div className="p-4 border-b border-[#2A2A2A]">
        <label className="block text-sm font-medium text-[#E0E0E0] mb-2">
          {t('slide_editors.powerpoint.question_label')}
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('slide_editors.powerpoint.question_placeholder')}
          className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3B3B3B] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          rows="3"
        />
      </div>

      <div className="p-4 border-b border-[#2A2A2A]">
        <label className="block text-sm font-medium text-[#E0E0E0] mb-3">
          {t('slide_editors.powerpoint.url_label')}
        </label>
        
        {/* Upload Method Toggle */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setUploadMethod('url');
              if (powerpointPublicId) {
                setPowerpointUrl('');
                setPowerpointPublicId('');
              }
            }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadMethod === 'url'
                ? 'bg-[#388E3C] text-white'
                : 'bg-[#2A2A2A] text-[#E0E0E0] hover:bg-[#333333]'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline-block mr-2" />
            {t('slide_editors.powerpoint.url_method')}
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadMethod('file');
              if (!powerpointPublicId && powerpointUrl && !powerpointUrl.startsWith('http')) {
                setPowerpointUrl('');
              }
            }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadMethod === 'file'
                ? 'bg-[#388E3C] text-white'
                : 'bg-[#2A2A2A] text-[#E0E0E0] hover:bg-[#333333]'
            }`}
          >
            <Upload className="w-4 h-4 inline-block mr-2" />
            {t('slide_editors.powerpoint.upload_method')}
          </button>
        </div>

        {uploadMethod === 'url' ? (
          <>
            <input
              type="url"
              value={powerpointUrl}
              onChange={(e) => setPowerpointUrl(e.target.value)}
              placeholder={t('slide_editors.powerpoint.url_placeholder')}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3B3B3B] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('slide_editors.powerpoint.url_description')}
            </p>
          </>
        ) : (
          <div className="space-y-3">
            {!powerpointUrl ? (
              <div className="border-2 border-dashed border-[#2A2A2A] rounded-lg p-8 text-center hover:border-[#4CAF50]/60 transition-colors bg-[#232323]">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ppt,.pptx"
                  onChange={handlePowerPointUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#388E3C] hover:bg-[#2E7D32] disabled:bg-[#555555] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('slide_editors.powerpoint.uploading')}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {t('slide_editors.powerpoint.upload_file_button')}
                    </>
                  )}
                </button>
                <p className="text-xs text-[#9E9E9E] mt-2">
                  {t('slide_editors.powerpoint.file_requirements')}
                </p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#232323] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#E0E0E0]">
                        {t('slide_editors.powerpoint.file_uploaded')}
                      </p>
                      <p className="text-xs text-[#9E9E9E]">
                        {powerpointPublicId ? t('slide_editors.powerpoint.uploaded_successfully') : powerpointUrl}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePowerPoint}
                    className="p-1.5 bg-[#EF5350] hover:bg-[#E53935] text-white rounded-full transition-colors"
                    title={t('slide_editors.powerpoint.remove_file_title')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {powerpointUrl && !powerpointUrl.trim().startsWith('blob:') && (
        <div className="p-4 border-b border-[#2A2A2A]">
          <h4 className="text-sm font-medium text-gray-300 mb-2">{t('slide_editors.powerpoint.preview_title')}</h4>
          <div className="aspect-video bg-[#1F1F1F] rounded overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-300 mb-2">{t('slide_editors.powerpoint.presentation_label')}</p>
              <a 
                href={powerpointUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition duration-200"
              >
                {t('slide_editors.powerpoint.view_presentation')}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
      {powerpointUrl && powerpointUrl.trim().startsWith('blob:') && (
        <div className="p-4 border-b border-[#2A2A2A]">
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-md p-3">
            <p className="text-yellow-400 text-sm">
              ⚠️ {t('slide_editors.powerpoint.upload_success')} Please save the slide to finalize the upload.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerPointEditor;