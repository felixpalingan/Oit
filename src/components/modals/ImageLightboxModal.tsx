'use client';

import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { useModalA11y } from '@/hooks/useModalA11y';

interface ImageLightboxModalProps {
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
}

export default function ImageLightboxModal({
  imageUrl,
  fileName = 'image.png',
  onClose,
}: ImageLightboxModalProps) {
  useModalA11y(true, onClose);

  const handleDownload = async () => {
    try {
      // Fetch as Blob for reliable force download
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Direct blob download failed, opening direct link:', err);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-lightbox-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none animate-in fade-in duration-200"
    >
      {/* Top Action Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl flex items-center justify-between py-3 px-4 bg-[#161619]/80 border border-zinc-800/80 rounded-2xl backdrop-blur-md mb-4 z-10"
      >
        <h4 id="image-lightbox-title" className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
          {fileName}
        </h4>

        <div className="flex items-center gap-2">
          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download image"
            className="px-3.5 py-2 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#FF5C00]/25 transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download</span>
          </button>

          {/* Open Original Tab Button */}
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Original Image"
            aria-label="Open original image in new tab"
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>

          {/* Close Lightbox Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Lightbox Display */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[80vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
      >
        <img
          src={imageUrl}
          alt={fileName}
          className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-2xl"
        />
      </div>

    </div>
  );
}
