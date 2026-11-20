import React from 'react';
import {
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Share2,
} from 'lucide-react';
import { SocialLinks } from '../../types';

interface SocialIconsProps {
  social?: SocialLinks;
  className?: string;
  iconClassName?: string;
}

export const SocialIcons: React.FC<SocialIconsProps> = ({
  social,
  className = 'flex items-center gap-4',
  iconClassName = 'w-4 h-4 transition-colors hover:text-accent-500',
}) => {
  if (!social) return null;

  const links = [
    { name: 'Instagram', url: social.instagram, icon: Instagram },
    { name: 'TikTok', url: social.tiktok, icon: Share2 },
    { name: 'YouTube', url: social.youtube, icon: Youtube },
    { name: 'Facebook', url: social.facebook, icon: Facebook },
    { name: 'X', url: social.x, icon: Twitter },
    { name: 'Threads', url: social.threads, icon: Share2 },
  ].filter((item) => Boolean(item.url && item.url.trim()));

  if (links.length === 0) return null;

  return (
    <div className={className}>
      {links.map((link) => {
        const IconComponent = link.icon;
        return (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow on ${link.name}`}
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-accent-500 rounded p-1"
          >
            <IconComponent className={iconClassName} />
          </a>
        );
      })}
    </div>
  );
};

export default SocialIcons;
