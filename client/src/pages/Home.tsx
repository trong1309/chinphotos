import React from 'react';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { useSettings } from '../hooks/useSettings';
import { HeroSlideshow } from '../components/home/HeroSlideshow';
import { IntroBio } from '../components/home/IntroBio';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { ServiceBlocks } from '../components/home/ServiceBlocks';
import { ConnectCTA } from '../components/home/ConnectCTA';
import { localizeTagline, localizeBio } from '../lib/localize';

export const Home: React.FC = () => {
  const { data: settings } = useSettings();
  const { i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  const localizedTagline = localizeTagline(settings?.tagline, isVi);
  const fallbackDesc = isVi
    ? 'Lưu giữ những khoảnh khắc gắn kết chân thật, nụ cười thơ ngây và niềm hạnh phúc bình dị của gia đình tại TP. Hồ Chí Minh.'
    : 'Capturing natural, heartfelt family and childhood moments in Ho Chi Minh City.';

  return (
    <>
      <Seo
        title={`${settings?.siteName || 'chinphotos'} | ${localizedTagline}`}
        description={localizeBio(settings?.bio, isVi, fallbackDesc)}
      />

      {/* 1. HeroSlideshow (full-viewport, 5s fade, hover pause, preload first image, title + tagline) */}
      <HeroSlideshow
        images={settings?.heroImages}
        siteName={settings?.siteName}
        tagline={settings?.tagline}
      />

      {/* 2. IntroBio (circular portrait, profession + areas, greeting, 2 paragraphs, about button) */}
      <IntroBio settings={settings} />

      {/* 3. CategoryGrid (uneven mosaic by category, labels overlaid on images, link /portfolio/:category) */}
      <CategoryGrid />

      {/* 4. ServiceBlocks (2-3 alternating left/right visual blocks, CTA to /services/:slug) */}
      <ServiceBlocks />

      {/* 5. ConnectCTA (Connect: areas + email + contact CTA; Follow: social icons) */}
      <ConnectCTA settings={settings} />
    </>
  );
};

export default Home;
