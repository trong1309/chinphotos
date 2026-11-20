import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { GalleryImage } from '../../types';

interface ImageCardProps {
  image: GalleryImage;
  onClick: () => void;
  priority?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onClick,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate responsive srcset for the 3 sharp-generated sizes
  const generateSrcSet = (url: string) => {
    if (!url || !url.includes('-large.')) return undefined;
    const thumbUrl = url.replace('-large.', '-thumb.');
    const mediumUrl = url.replace('-large.', '-medium.');
    return `${thumbUrl} 400w, ${mediumUrl} 1200w, ${url} 2000w`;
  };

  const srcSet = generateSrcSet(image.url);
  const galleryTitle =
    typeof image.gallery === 'object' && image.gallery ? image.gallery.title : '';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const aspectRatio =
    image.width && image.height ? `${image.width} / ${image.height}` : '4 / 3';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="group relative mb-6 sm:mb-8 overflow-hidden rounded-sm cursor-pointer select-none bg-neutral-200/50 dark:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-accent-500"
      aria-label={image.alt || galleryTitle || 'View photograph'}
      style={{ aspectRatio }}
    >
      {/* Blur Placeholder */}
      {image.blurDataUrl && !isLoaded && (
        <img
          src={image.blurDataUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-md scale-105"
        />
      )}

      {/* Main Responsive Image with Lazy Loading & Fade-in */}
      <img
        src={image.url}
        srcSet={srcSet}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={image.alt || 'Photographic moment by chinphotos'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transform scale-100 group-hover:scale-[1.02] transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Hover Overlay with Subtle Metadata and Zoom Icon */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 sm:p-5 text-white">
        <div className="flex justify-end">
          <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        </div>

        {galleryTitle && (
          <div>
            <p className="font-serif text-sm sm:text-base text-cream-100 font-light line-clamp-1">
              {galleryTitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
