import React from 'react';
import Masonry from 'react-masonry-css';
import { GalleryImage } from '../../types';
import { ImageCard } from './ImageCard';

interface MasonryGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage, index: number) => void;
  isLoading?: boolean;
}

const BREAKPOINT_COLUMNS = {
  default: 3, // Desktop: 3 columns
  1024: 2,   // Tablet: 2 columns
  640: 1,    // Mobile: 1 column
};

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  images,
  onImageClick,
  isLoading = false,
}) => {
  if (isLoading && images.length === 0) {
    return <MasonryGridSkeleton />;
  }

  if (!isLoading && images.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl text-neutral-500 dark:text-neutral-400">
          Chưa có hình ảnh nào được đăng tải.
        </p>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={BREAKPOINT_COLUMNS}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {images.map((image, index) => (
        <ImageCard
          key={image._id}
          image={image}
          onClick={() => onImageClick(image, index)}
          priority={index < 4}
        />
      ))}
    </Masonry>
  );
};

export const MasonryGridSkeleton: React.FC = () => {
  const dummyHeights = [
    'aspect-[4/3]',
    'aspect-[3/4]',
    'aspect-[1/1]',
    'aspect-[16/9]',
    'aspect-[4/5]',
    'aspect-[3/2]',
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`w-full ${dummyHeights[i % dummyHeights.length]} rounded-sm bg-neutral-200 dark:bg-neutral-800 animate-pulse`}
        />
      ))}
    </div>
  );
};

export default MasonryGrid;
