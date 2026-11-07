'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatters';
import type { ChartDataPoint } from '@/types/dashboard';
import type { CurrencyCode } from '@/types/institution';

export interface LendingPerformanceChartProps {
  data: readonly ChartDataPoint[];
  currency: CurrencyCode;
  range: 6 | 12;
  onRangeChange: (range: 6 | 12) => void;
}

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 210;
const PLOT_LEFT = 48;
const PLOT_TOP = 10;
const PLOT_BOTTOM_OFFSET = 22;

export function LendingPerformanceChart({
  data,
  currency,
  range,
  onRangeChange,
}: LendingPerformanceChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });

  React.useEffect(() => {
    const node = wrapRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const chartWidth = size.width;
  const chartHeight = size.height;
  const isCompact = chartWidth < 430;
  const plotLeft = isCompact ? 38 : PLOT_LEFT;
  const plotRight = Math.max(plotLeft + 60, chartWidth - (isCompact ? 8 : 14));
  const plotBottom = Math.max(PLOT_TOP + 60, chartHeight - PLOT_BOTTOM_OFFSET);

  const { minVal, maxVal } = React.useMemo(() => {
    const rawValues = data.map((point) => point.value);
    const highest = Math.max(...rawValues, 10);
    const lowest = Math.min(...rawValues, 0);
    const paddedMax = highest * 1.06;
    const paddedMin = Math.max(0, lowest * 0.55);
    return {
      minVal: paddedMin,
      maxVal: Math.max(paddedMax, paddedMin + 5),
    };
  }, [data]);

  const points = React.useMemo(() => {
    const spanX = plotRight - plotLeft;
    const spanY = plotBottom - PLOT_TOP;
    const valueSpan = Math.max(1, maxVal - minVal);
    const denominator = Math.max(1, data.length - 1);

    return data.map((point, index) => {
      const x = plotLeft + (index * spanX) / denominator;
      const y = plotBottom - ((point.value - minVal) / valueSpan) * spanY;
      // The dashed line is a visual estimate from nearby points, not forecast data
      const neighborAvg =
        index === 0 ? point.value * 0.94 : (data[index - 1].value + point.value) / 2;
      const projected = Math.round(neighborAvg * 1.04 * 10) / 10;
      const clampedProjected = Math.min(maxVal, Math.max(minVal, projected));
      const projectedY = plotBottom - ((clampedProjected - minVal) / valueSpan) * spanY;

      return {
        ...point,
        index,
        x,
        y,
        projected,
        projectedY,
      };
    });
  }, [data, maxVal, minVal, plotBottom, plotLeft, plotRight]);

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');

  const projectedPathD = points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.projectedY.toFixed(1)}`,
    )
    .join(' ');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${plotBottom} L ${points[0].x.toFixed(1)} ${plotBottom} Z`
      : '';

  const activePoint = activeIndex !== null ? points[activeIndex] : undefined;

  return (
    <section className="card chart-card">
      <div className="chart-heading">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-foreground">Lending performance</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            <span className="sm:hidden">Disbursement trend</span>
            <span className="hidden sm:inline">Disbursement activity over time</span>
          </p>
        </div>
        <div className="relative w-27 shrink-0 sm:w-31.25">
          <Select
            value={String(range)}
            onValueChange={(value) => onRangeChange(Number(value) as 6 | 12)}
          >
            <SelectTrigger className="h-8 w-full px-2.5 text-xs" aria-label="Chart period">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="chart-legends">
        <span>
          <span className="legend-dot" /> Funded volume
        </span>
        <span>
          <span className="legend-dot muted" /> Trend projection
        </span>
      </div>

      <div
        ref={wrapRef}
        className="chart-wrap relative select-none"
        onMouseLeave={() => setActiveIndex(null)}
      >
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-[0_10px_26px_rgba(23,42,67,0.14)] transition-all duration-150 ease-out',
            activePoint ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
          style={{
            left: activePoint ? `${(activePoint.x / chartWidth) * 100}%` : '50%',
            top: activePoint
              ? `${Math.max(8, ((activePoint.y - 10) / chartHeight) * 100)}%`
              : '20%',
          }}
        >
          {activePoint && (
            <div className="space-y-1 whitespace-nowrap">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-1">
                <strong className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                  {activePoint.month} 2026
                </strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-2xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-brand" />
                  Funded
                </span>
                <strong className="font-bold tabular-nums text-foreground">
                  {formatCurrency(activePoint.value * 1000, currency)}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-2xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-[#a5c6e6]" />
                  Projected
                </span>
                <span className="font-semibold tabular-nums text-muted-foreground">
                  {formatCurrency(Math.round(activePoint.projected * 1000), currency)}
                </span>
              </div>
            </div>
          )}
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="chart-svg block h-full w-full overflow-visible"
          role="img"
          aria-label="Monthly disbursement performance chart"
        >
          <defs>
            <linearGradient id="lender-chart-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0, 0.333, 0.667, 1].map((ratio) => {
            const y = Math.round(PLOT_TOP + ratio * (plotBottom - PLOT_TOP));
            const labelVal = Math.round((minVal + (1 - ratio) * (maxVal - minVal)) * 1000);
            return (
              <g key={ratio}>
                <line x1={plotLeft} y1={y} x2={plotRight} y2={y} stroke="#edf1f5" strokeWidth="1" />
                <text x="0" y={y + 3.5} fill="#95a2b0" fontSize={isCompact ? '9.5' : '10.5'}>
                  {formatCurrency(labelVal, currency, true)}
                </text>
              </g>
            );
          })}

          {activePoint && (
            <line
              x1={activePoint.x}
              y1={PLOT_TOP}
              x2={activePoint.x}
              y2={plotBottom}
              stroke="var(--brand)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.45"
            />
          )}

          <path d={areaD} fill="url(#lender-chart-grad)" />

          <path
            d={projectedPathD}
            stroke="#a5c6e6"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          <path
            d={pathD}
            stroke="var(--brand)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {points.map((point) => {
            const isHovered = activeIndex === point.index;
            return (
              <g
                key={point.month}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`${point.month}: ${formatCurrency(point.value * 1000, currency)}`}
                onMouseEnter={() => setActiveIndex(point.index)}
                onFocus={() => setActiveIndex(point.index)}
                onBlur={() => setActiveIndex(null)}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="18"
                  fill="transparent"
                  className="cursor-pointer"
                />
                {isHovered && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="9"
                    fill="var(--brand)"
                    opacity="0.16"
                    className="transition-all duration-150"
                  />
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 5.5 : isCompact ? 3.4 : 4}
                  fill="#ffffff"
                  stroke="var(--brand)"
                  strokeWidth={isHovered ? 3 : 2.3}
                  className="cursor-pointer transition-all duration-150"
                />
                {(!isCompact ||
                  range === 6 ||
                  point.index % 2 === 0 ||
                  point.index === points.length - 1) && (
                  <text
                    x={point.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fill={isHovered ? 'var(--foreground)' : '#95a2b0'}
                    fontWeight={isHovered ? '700' : '500'}
                    fontSize={isCompact ? '9.5' : '10.5'}
                    className="transition-colors duration-150"
                  >
                    {point.month}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
