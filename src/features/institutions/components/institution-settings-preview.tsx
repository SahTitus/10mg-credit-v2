import * as React from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/primitives/card';
import { InstitutionLogo } from '@/components/shared/institution-logo';
import { formatCurrency } from '@/lib/utils/formatters';
import { mixColors, sanitizeHex } from '@/lib/utils/theme';
import type { Institution } from '@/types/institution';

interface InstitutionSettingsPreviewProps {
  institution: Institution;
}

export function InstitutionSettingsPreview({ institution }: InstitutionSettingsPreviewProps) {
  const brandColor = sanitizeHex(institution.primary);
  const previewStyle = {
    '--brand': brandColor,
    '--brand-deep': mixColors(brandColor, '#000000', 0.16),
    '--brand-pale': mixColors(brandColor, '#ffffff', 0.91),
  } as React.CSSProperties;

  return (
    <div className="space-y-5 lg:sticky lg:top-6" style={previewStyle}>
      <Card className="overflow-hidden">
        <div className="flex h-12 items-center justify-between border-b border-line px-5 text-2xs text-muted-foreground">
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="h-1.5 w-1.5 rounded-full bg-[#d8e1eb]" />
            <i className="h-1.5 w-1.5 rounded-full bg-[#d8e1eb]" />
            <i className="h-1.5 w-1.5 rounded-full bg-[#d8e1eb]" />
          </span>
          Live preview
        </div>
        <div className="min-h-48 bg-brand p-6 text-white transition-colors">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <InstitutionLogo
              logo={institution.logo}
              initials={institution.initials}
              name={institution.name}
              primaryColor={brandColor}
              className="h-7 w-7 text-2xs"
              fallbackStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
              }}
            />
            <span>{institution.short}</span>
          </div>
          <h2 className="mt-7 text-[27px] font-bold leading-[1.08] tracking-[-0.055em]">
            Credit that keeps
            <br />
            you moving.
          </h2>
          <p className="mt-2 text-xs text-white/80">Flexible financing when it matters.</p>
        </div>
        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-brand-pale text-brand">
              <CreditCard className="h-4 w-4" />
            </span>
            <span>
              <strong className="block text-xs text-foreground">Apply for credit</strong>
              <small className="block pt-0.5 text-2xs text-muted-foreground">Quick and clear</small>
            </span>
          </div>
          <div className="rounded-md bg-brand px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors">
            Continue application
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between border-b border-line pb-3.5">
          <div>
            <strong className="block text-xs font-bold text-foreground">
              Active policy summary
            </strong>
            <span className="text-2xs text-muted-foreground">
              Live underwriting parameters for {institution.short}
            </span>
          </div>
          <span className="inline-flex items-center rounded-md bg-brand-pale px-2 py-0.5 text-2xs font-semibold text-brand">
            {institution.currency}
          </span>
        </div>

        <dl className="mt-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Indicative annual interest</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {Number(institution.interest || 0)}% p.a.
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Minimum facility</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {formatCurrency(Number(institution.minLoan || 0), institution.currency)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Maximum facility</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {formatCurrency(Number(institution.maxLoan || 0), institution.currency)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Borrower notifications</dt>
            <dd className="font-semibold text-foreground">
              {institution.autoNotify ? 'Enabled' : 'Paused'}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-line bg-[#f3f7fb] p-5 text-xs leading-5 text-muted-foreground">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <strong className="block text-foreground">Independent by design</strong>
          <p className="mt-1">
            Branding and credit policy remain isolated to this institution across both workspaces.
          </p>
        </div>
      </div>
    </div>
  );
}
