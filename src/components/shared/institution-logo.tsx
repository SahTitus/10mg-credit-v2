'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InstitutionLogoProps {
  logo?: string;
  initials: string;
  name: string;
  primaryColor?: string;
  className?: string;
  fallbackStyle?: React.CSSProperties;
}

export function InstitutionLogo({
  logo,
  initials,
  name,
  primaryColor,
  className,
  fallbackStyle,
}: InstitutionLogoProps) {
  const trimmedLogo = logo?.trim() ?? '';
  // Remember the failed URL so a changed logo can load without remounting this component
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const showImage = Boolean(trimmedLogo) && failedSrc !== trimmedLogo;

  if (showImage) {
    const logoImage = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={trimmedLogo}
        alt={`${name} logo`}
        className="h-full w-full object-contain p-0.5"
        onError={() => setFailedSrc(trimmedLogo)}
      />
    );

    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-black/8',
          className,
        )}
      >
        {logoImage}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-bold text-white',
        className,
      )}
      style={
        fallbackStyle ?? {
          backgroundColor: primaryColor || 'var(--brand)',
          color: '#ffffff',
        }
      }
    >
      {initials}
    </span>
  );
}
