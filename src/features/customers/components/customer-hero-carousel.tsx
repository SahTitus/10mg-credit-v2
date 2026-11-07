'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { APP_ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';
import type { Institution } from '@/types/institution';

export interface CustomerHeroCarouselProps {
  institution: Institution;
}

interface HeroSlide {
  readonly id: string;
  readonly tag: string;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly imagePosition: string;
  readonly imageAlt: string;
}

const SLIDE_INTERVAL_MS = 9000;

export function CustomerHeroCarousel({ institution }: CustomerHeroCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  const slides: readonly HeroSlide[] = React.useMemo(
    () => [
      {
        id: 'inventory',
        tag: 'Inventory Financing',
        title: 'Keep essential medicines in stock without cashflow gaps.',
        description: `Restock high-demand pharmaceuticals, vaccines, and surgical consumables up to ${institution.currency} ${institution.maxLoan.toLocaleString()} with structured 3 to 12 month repayment plans.`,
        image: '/assets/pharmacy-owner.jpg',
        imagePosition: 'center 24%',
        imageAlt: 'Pharmacist managing healthcare inventory',
      },
      {
        id: 'equipment',
        tag: 'Facility & Diagnostics',
        title: 'Upgrade clinical and diagnostic equipment on your schedule.',
        description: `Acquire laboratory instruments, cold-chain storage, and patient-care systems at a fixed ${institution.interest}% p.a. institutional rate with predictable monthly instalments.`,
        image: '/assets/healthcare-care.jpg',
        imagePosition: 'center 30%',
        imageAlt: 'Clinician caring for patients in a medical facility',
      },
      {
        id: 'underwriting',
        tag: 'Rapid Underwriting',
        title: 'Transparent healthcare credit built around your practice.',
        description:
          'Submit a credit request in minutes with upfront repayment estimates, clear amortization schedules, and direct disbursement upon approval.',
        image: '/assets/healthcare-provider.png',
        imagePosition: 'center 18%',
        imageAlt: 'Healthcare provider in clinical practice',
      },
    ],
    [institution.currency, institution.interest, institution.maxLoan],
  );

  React.useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <section
      className="relative isolate hidden overflow-hidden rounded-2xl border text-white shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:block"
      style={{
        borderColor: 'color-mix(in srgb, var(--brand) 78%, #0b192c)',
        background:
          'linear-gradient(125deg, color-mix(in srgb, var(--brand) 78%, #0b192c) 0%, var(--brand) 100%)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label={`${institution.name} credit services`}
    >
      <div className="grid min-h-70 grid-cols-1 md:grid-cols-[minmax(0,1.58fr)_minmax(240px,0.56fr)]">
        <div className="relative z-10 flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:px-10 lg:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[url('/assets/brand-contour.svg')] bg-cover bg-center bg-no-repeat opacity-[0.22]"
          />

          <div className="relative min-h-38.5 sm:min-h-36.5" aria-live="polite">
            {slides.map((slide, index) => {
              // Keep all slides mounted so cross-fades stay smooth and the card height does not jump
              const isActive = index === activeIndex;
              return (
                <div
                  key={slide.id}
                  aria-hidden={!isActive}
                  className={cn(
                    'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    isActive
                      ? 'relative translate-x-0 opacity-100'
                      : 'pointer-events-none absolute inset-0 translate-x-3 opacity-0',
                  )}
                >
                  <span className="inline-flex items-center rounded-full border border-white/22 bg-white/14 px-3 py-1 text-[10px] font-bold tracking-[0.11em] text-white uppercase">
                    {slide.tag}
                  </span>
                  <h2 className="mt-3.5 max-w-135 text-[clamp(1.5rem,2.4vw,2.05rem)] font-bold leading-[1.14] tracking-[-0.045em] text-white">
                    {slide.title}
                  </h2>
                  <p className="mt-2.5 max-w-125 text-xs leading-[1.6] text-white/90 sm:text-[13.5px]">
                    {slide.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4">
            <Button
              variant="primary"
              onClick={() => router.push(APP_ROUTES.CUSTOMER.APPLY)}
              className="customer-hero-action px-5"
            >
              Apply for credit
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Slide selector">
                {slides.map((slide, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <Button
                      key={slide.id}
                      type="button"
                      variant="ghost"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Slide ${index + 1}: ${slide.tag}`}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        'h-2 min-w-0 rounded-full p-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
                        isActive
                          ? 'w-7 bg-white hover:bg-white'
                          : 'w-2 bg-white/35 hover:bg-white/60',
                      )}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  aria-label="Previous slide"
                  className="h-7.5 w-7.5 rounded-lg border border-white/18 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  aria-label="Next slide"
                  className="h-7.5 w-7.5 rounded-lg border border-white/18 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden md:block">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={slide.id}
                aria-hidden={!isActive}
                className={cn(
                  'absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  isActive ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0',
                )}
              >
                <div
                  className="h-full w-full bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: `url('${slide.image}')`,
                    backgroundPosition: slide.imagePosition,
                  }}
                  role="img"
                  aria-label={slide.imageAlt}
                />
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-8"
                  style={{
                    background:
                      'linear-gradient(90deg, color-mix(in srgb, var(--brand) 88%, #0b192c) 0%, transparent 100%)',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
