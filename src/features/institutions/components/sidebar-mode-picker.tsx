import { Check } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import type { SidebarMode } from '@/types/institution';

interface SidebarModePickerProps {
  brandColor: string;
  customColor: string;
  value: SidebarMode;
  onChange: (mode: SidebarMode) => void;
}

const options: ReadonlyArray<{ mode: SidebarMode; label: string }> = [
  { mode: 'light', label: 'White' },
  { mode: 'brand', label: 'Brand' },
  { mode: 'custom', label: 'Custom' },
];

export function SidebarModePicker({
  brandColor,
  customColor,
  value,
  onChange,
}: SidebarModePickerProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const isSelected = value === option.mode;
        const surfaceColor = option.mode === 'brand' ? brandColor : customColor;

        return (
          <Button
            key={option.mode}
            type="button"
            variant="outline"
            onClick={() => onChange(option.mode)}
            className={`h-auto min-h-26.5 flex-col items-stretch gap-3 rounded-[9px] p-2 text-left ${
              isSelected ? 'border-brand ring-2 ring-brand-pale' : ''
            }`}
            aria-pressed={isSelected}
          >
            <span
              className="flex h-14.5 flex-col gap-1.5 rounded-md border p-3"
              style={{
                backgroundColor: option.mode === 'light' ? '#ffffff' : surfaceColor,
                borderColor: option.mode === 'light' ? '#e2e8ef' : 'transparent',
              }}
            >
              <i className="h-1.5 w-[30%] rounded bg-[#d9e2eb]" />
              <i className="h-1.5 w-[73%] rounded bg-[#a8d0f4]" />
              <i className="h-1.5 w-[45%] rounded bg-[#d9e2eb]" />
            </span>
            <span className="flex items-center justify-between px-1 text-xs font-semibold text-foreground">
              {option.label}
              {isSelected && <Check className="h-3.5 w-3.5 text-brand" />}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
