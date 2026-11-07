import * as React from 'react';
import { Avatar as UiAvatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils/formatters';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'blue' | 'green' | 'violet' | 'orange';
}

const toneStyles = {
  blue: 'bg-[#e9f4ff] text-[#1266b8]',
  green: 'bg-[#e8f7f1] text-[#16856d]',
  violet: 'bg-[#f1edfb] text-[#7357b8]',
  orange: 'bg-[#fff5e5] text-[#b87925]',
};

const sizeStyles = {
  sm: 'h-7 w-7 text-2xs',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

export function Avatar({ name, src, size = 'md', tone, className, ...props }: AvatarProps) {
  const chosenTone =
    tone ||
    (['blue', 'green', 'violet', 'orange'][(name || '').length % 4] as keyof typeof toneStyles);
  const uiSize = size === 'md' ? 'default' : size;

  return (
    <UiAvatar
      size={uiSize}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md border border-black/5 font-semibold select-none',
        sizeStyles[size],
        toneStyles[chosenTone],
        className,
      )}
      {...props}
    >
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="rounded-md bg-transparent font-semibold text-inherit group-data-[size=sm]/avatar:text-2xs">
        {getInitials(name)}
      </AvatarFallback>
    </UiAvatar>
  );
}
