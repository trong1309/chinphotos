import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Lightbox, { SlideImage } from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import { GalleryImage } from '../../types';

interface LightboxViewerProps {
  images: GalleryImage[];
  allowDownload?: boolean;
}

export const LightboxViewer: React.FC<LightboxViewerProps> = ({
  images,
  allowDownload = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentItemId = searchParams.get('itemId');

  // Convert GalleryImage[] to SlideImage[] for yet-another-react-lightbox
  const slides: SlideImage[] = useMemo(() => {
    return images.map((img) => {
      const galleryTitle =
        typeof img.gallery === 'object' && img.gallery ? img.gallery.title : '';

      return {
        src: img.url,
        alt: img.alt || galleryTitle || 'Photograph by chinphotos',
        width: img.width,
        height: img.height,
        download: allowDownload ? { url: img.url, filename: `chinphotos-${img._id}.webp` } : undefined,
      };
    });
  }, [images, allowDownload]);

  // Find index of image corresponding to ?itemId in URL
  const currentIndex = useMemo(() => {
    if (!currentItemId) return -1;
    return images.findIndex((img) => img._id === currentItemId);
  }, [currentItemId, images]);

  const isOpen = currentIndex >= 0;

  // Handle closing lightbox: remove ?itemId from searchParams
  const handleClose = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('itemId');
        return next;
      },
      { replace: false }, // Let Back button work as expected
    );
  };

  // Handle slide change inside lightbox: update URL ?itemId=<new_id>
  const handleSlideChange = ({ index }: { index: number }) => {
    const nextImage = images[index];
    if (nextImage && nextImage._id !== currentItemId) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('itemId', nextImage._id);
          return next;
        },
        { replace: true }, // Replace current state so Back button exits lightbox
      );
    }
  };

  // Listen to popstate to ensure smooth browser back button handling
  useEffect(() => {
    const handlePopState = () => {
      // Re-read search params if needed
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Plugins: Zoom is always enabled; Download is enabled only when explicitly permitted
  const plugins = useMemo(() => {
    const p = [Zoom];
    if (allowDownload) {
      p.push(Download);
    }
    return p;
  }, [allowDownload]);

  if (images.length === 0) return null;

  return (
    <Lightbox
      open={isOpen}
      index={currentIndex >= 0 ? currentIndex : 0}
      close={handleClose}
      slides={slides}
      plugins={plugins}
      carousel={{
        preload: 2, // Preload next and previous images
        finite: false,
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 1.5,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
        scrollToZoom: false,
      }}
      animation={{
        fade: 250,
        swipe: 250,
      }}
      on={{
        view: handleSlideChange,
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.94)' },
      }}
    />
  );
};

export default LightboxViewer;
