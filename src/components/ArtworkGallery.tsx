import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, ImageOff } from 'lucide-react';

interface GalleryProps {
  images: string[];
  videoUrl?: string;
  title: string;
}

const ArtworkGallery: React.FC<GalleryProps> = ({ images, videoUrl, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [error, setError] = useState<Set<string>>(new Set());
  const allMedia = [...images, ...(videoUrl ? [videoUrl] : [])];
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Preload images
  useEffect(() => {
    images.forEach(src => {
      const img = new Image();
      img.onload = () => setLoadedImages(prev => new Set([...prev, src]));
      img.onerror = () => setError(prev => new Set([...prev, src]));
      img.src = src;
    });
  }, [images]);

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentIndex(current => {
      if (direction === 'prev') {
        return current === 0 ? allMedia.length - 1 : current - 1;
      } else {
        return current === allMedia.length - 1 ? 0 : current + 1;
      }
    });
  };
  
  const isVideo = (url: string) => url === videoUrl;
  const isImageLoaded = (src: string) => loadedImages.has(src);
  const hasImageError = (src: string) => error.has(src);
  
  return (
    <div className="relative bg-black rounded-lg overflow-hidden" ref={containerRef}>
      <div className="aspect-w-16 aspect-h-9">
        {isVideo(allMedia[currentIndex]) ? (
          <video
            src={allMedia[currentIndex]}
            controls
            className="w-full h-full object-contain"
            title={`${title} - Vídeo`}
          />
        ) : (
          <div className="relative w-full h-full">
            {/* Placeholder while loading */}
            {!isImageLoaded(allMedia[currentIndex]) && !hasImageError(allMedia[currentIndex]) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
              </div>
            )}
            
            {/* Error state */}
            {hasImageError(allMedia[currentIndex]) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <ImageOff className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            {/* Actual image */}
            <img
              src={allMedia[currentIndex]}
              alt={`${title} - Imagem ${currentIndex + 1}`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isImageLoaded(allMedia[currentIndex]) ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ visibility: hasImageError(allMedia[currentIndex]) ? 'hidden' : 'visible' }}
            />
          </div>
        )}
      </div>
      
      {allMedia.length > 1 && (
        <>
          <button
            onClick={() => navigate('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => navigate('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {allMedia.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              >
                <span className="sr-only">Imagem {index + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
      
      {videoUrl && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
            <Play className="h-4 w-4 mr-1" />
            Vídeo disponível
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtworkGallery;