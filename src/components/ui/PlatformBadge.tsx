import React from 'react';
import { Platform } from '../../types';
import {
  Twitter,
  Instagram,
  Facebook,
  Video,
  Youtube,
  Play,
  Apple,
  Share2,
} from 'lucide-react';

interface PlatformBadgeProps {
  platform: Platform;
  showCategory?: boolean;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  showCategory = false,
}) => {
  const meta: Record<
    Platform,
    { label: string; icon: React.ElementType; isApp: boolean }
  > = {
    x: { label: 'X / Twitter', icon: Twitter, isApp: false },
    instagram: { label: 'Instagram', icon: Instagram, isApp: false },
    facebook: { label: 'Facebook', icon: Facebook, isApp: false },
    tiktok: { label: 'TikTok', icon: Video, isApp: false },
    youtube: { label: 'YouTube', icon: Youtube, isApp: false },
    linkedin: { label: 'LinkedIn', icon: Share2, isApp: false },
    google_play: { label: 'Google Play', icon: Play, isApp: true },
    app_store: { label: 'Apple App Store', icon: Apple, isApp: true },
  };

  const current = meta[platform] || { label: platform, icon: Share2, isApp: false };
  const Icon = current.icon;

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-neutral-300">
      <span className="p-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <span className="font-medium text-neutral-200">{current.label}</span>
      {showCategory && (
        <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider ml-1">
          {current.isApp ? 'App Store' : 'Social'}
        </span>
      )}
    </div>
  );
};
