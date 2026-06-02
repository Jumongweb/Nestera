"use client";

import React, { useRef, useState } from "react";
import {
  AreaChart as AreaIcon,
  BarChart2,
  Download,
  Eye,
  EyeOff,
  GitCompare,
  LineChart as LineIcon,
  Maximize2,
  Minimize2,
  Palette,
} from "lucide-react";
import type { ChartType, ColorScheme, TimeRange } from "./useChartPreferences";

const TIME_RANGES: TimeRange[] = ["7D", "30D", "90D", "1Y"];

const CHART_TYPES: { value: ChartType; icon: React.ReactNode; label: string }[] = [
  { value: "area", icon: <AreaIcon size={14} />, label: "Area" },
  { value: "line", icon: <LineIcon size={14} />, label: "Line" },
  { value: "bar", icon: <BarChart2 size={14} />, label: "Bar" },
];

const COLOR_SCHEMES: { value: ColorScheme; label: string; swatch: string }[] = [
  { value: "default", label: "Teal",   swatch: "#0891b2" },
  { value: "ocean",   label: "Ocean",  swatch: "#1d4ed8" },
  { value: "sunset",  label: "Sunset", swatch: "#ea580c" },
  { value: "forest",  label: "Forest", swatch: "#16a34a" },
];

type ChartControlsProps = {
  chartType: ChartType;
  timeRange: TimeRange;
  colorScheme: ColorScheme;
  showLegend: boolean;
  showComparison: boolean;
  showBrush: boolean;
  onChartType: (v: ChartType) => void;
  onTimeRange: (v: TimeRange) => void;
  onColorScheme: (v: ColorScheme) => void;
  onLegendToggle: () => void;
  onComparisonToggle: () => void;
  onBrushToggle: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportCsv: () => void;
};

export default function ChartControls({
  chartType,
  timeRange,
  colorScheme,
  showLegend,
  showComparison,
  showBrush,
  onChartType,
  onTimeRange,
  onColorScheme,
  onLegendToggle,
  onComparisonToggle,
  onBrushToggle,
  onExportPng,
  onExportSvg,
  onExportCsv,
}: ChartControlsProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!exportOpen && !paletteOpen) return;
    const handler = (e: MouseEvent) => {
      if (exportOpen && !exportRef.current?.contains(e.target as Node)) setExportOpen(false);
      if (paletteOpen && !paletteRef.current?.contains(e.target as Node)) setPaletteOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen, paletteOpen]);

  const iconBtn = (active: boolean) =>
    `flex items-center justify-center rounded-lg p-1.5 transition-colors ${
      active
        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)]"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Chart type */}
      <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 gap-0.5">
        {CHART_TYPES.map(({ value, icon, label }) => (
          <button
            key={value}
            type="button"
            aria-label={`${label} chart`}
            aria-pressed={chartType === value}
            onClick={() => onChartType(value)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              chartType === value
                ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Time range */}
      <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 gap-0.5">
        {TIME_RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={timeRange === r}
            onClick={() => onTimeRange(r)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              timeRange === r
                ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Legend toggle */}
      <button
        type="button"
        aria-label="Toggle legend"
        aria-pressed={showLegend}
        onClick={onLegendToggle}
        className={iconBtn(showLegend)}
        title="Toggle legend"
      >
        {showLegend ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>

      {/* Comparison toggle */}
      <button
        type="button"
        aria-label="Toggle comparison mode"
        aria-pressed={showComparison}
        onClick={onComparisonToggle}
        className={iconBtn(showComparison)}
        title="Comparison mode"
      >
        <GitCompare size={15} />
      </button>

      {/* Brush/zoom toggle */}
      <button
        type="button"
        aria-label="Toggle zoom"
        aria-pressed={showBrush}
        onClick={onBrushToggle}
        className={iconBtn(showBrush)}
        title="Zoom & pan"
      >
        {showBrush ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      </button>

      {/* Color palette */}
      <div ref={paletteRef} className="relative">
        <button
          type="button"
          aria-label="Color scheme"
          aria-expanded={paletteOpen}
          onClick={() => setPaletteOpen((p) => !p)}
          className={iconBtn(paletteOpen)}
          title="Color scheme"
        >
          <Palette size={15} />
        </button>
        {paletteOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-2 shadow-xl">
            <p className="mb-2 px-1 text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
              Color scheme
            </p>
            <div className="flex flex-col gap-1">
              {COLOR_SCHEMES.map(({ value, label, swatch }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { onColorScheme(value); setPaletteOpen(false); }}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                    colorScheme === value
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]"
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ background: swatch }} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export */}
      <div ref={exportRef} className="relative">
        <button
          type="button"
          aria-label="Export chart"
          aria-expanded={exportOpen}
          onClick={() => setExportOpen((p) => !p)}
          className={iconBtn(exportOpen)}
          title="Export"
        >
          <Download size={15} />
        </button>
        {exportOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 min-w-[140px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-1.5 shadow-xl">
            {[
              { label: "Export PNG", action: () => { onExportPng(); setExportOpen(false); } },
              { label: "Export SVG", action: () => { onExportSvg(); setExportOpen(false); } },
              { label: "Export CSV", action: () => { onExportCsv(); setExportOpen(false); } },
            ].map(({ label, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
