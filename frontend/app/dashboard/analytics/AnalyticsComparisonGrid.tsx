"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  BarChart2,
  Download,
  Eye,
  EyeOff,
  Goal,
  Layers3,
  LineChart as LineIcon,
  Maximize2,
  Minimize2,
  Palette,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { colorSchemes } from "./useChartPreferences";
import type { ColorScheme } from "./useChartPreferences";

// ── Types ──────────────────────────────────────────────────────────────────

type TooltipRecord = Record<string, number | string>;
type TooltipPayloadItem = {
  color?: string;
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  payload: TooltipRecord;
};

type ChartPalette = {
  accent: string;
  accentAlt: string;
  accentSoft: string;
  success: string;
  violet: string;
  text: string;
  muted: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
};

type CardChartType = "bar" | "line";

type RenderProps = {
  showLegend: boolean;
  chartType: CardChartType;
  palette: ChartPalette;
  showBrush: boolean;
};

// ── Static data ────────────────────────────────────────────────────────────

const monthComparisonData = [
  { metric: "Deposits", previous: 28.4, current: 32.6 },
  { metric: "Yield", previous: 6.8, current: 8.1 },
  { metric: "Portfolio", previous: 118.2, current: 124.6 },
];

const yearComparisonData = [
  { month: "Jan", lastYear: 72, thisYear: 81 },
  { month: "Feb", lastYear: 74, thisYear: 84 },
  { month: "Mar", lastYear: 78, thisYear: 88 },
  { month: "Apr", lastYear: 80, thisYear: 91 },
  { month: "May", lastYear: 83, thisYear: 95 },
  { month: "Jun", lastYear: 86, thisYear: 98 },
  { month: "Jul", lastYear: 89, thisYear: 103 },
  { month: "Aug", lastYear: 92, thisYear: 108 },
  { month: "Sep", lastYear: 95, thisYear: 113 },
  { month: "Oct", lastYear: 98, thisYear: 119 },
  { month: "Nov", lastYear: 101, thisYear: 123 },
  { month: "Dec", lastYear: 104, thisYear: 129 },
];

const goalPerformanceData = [
  { goal: "Emergency", target: 75, actual: 82 },
  { goal: "Travel", target: 58, actual: 61 },
  { goal: "Home", target: 44, actual: 39 },
  { goal: "Retirement", target: 63, actual: 70 },
];

const poolPerformanceData = [
  { pool: "USDC Flex", apy: 8.2, yield30d: 2.1, tvl: 1.24 },
  { pool: "XLM Vault", apy: 11.4, yield30d: 2.8, tvl: 1.82 },
  { pool: "Blend Stable", apy: 7.1, yield30d: 1.7, tvl: 0.96 },
  { pool: "Yield Basket", apy: 9.6, yield30d: 2.4, tvl: 1.38 },
];

// ── Base theme (non-color-scheme values) ───────────────────────────────────

type BaseTheme = Pick<ChartPalette, "text" | "muted" | "grid" | "tooltipBg" | "tooltipBorder">;

const baseThemeByMode: Record<"light" | "dark", BaseTheme> = {
  light: {
    text: "#0f1f2a",
    muted: "#4a7080",
    grid: "rgba(74, 112, 128, 0.12)",
    tooltipBg: "rgba(255, 255, 255, 0.98)",
    tooltipBorder: "rgba(8, 145, 178, 0.18)",
  },
  dark: {
    text: "#f8fdff",
    muted: "#6e9ba2",
    grid: "rgba(94, 140, 150, 0.12)",
    tooltipBg: "rgba(8, 20, 24, 0.96)",
    tooltipBorder: "rgba(0, 201, 200, 0.28)",
  },
};

const COLOR_SCHEME_OPTIONS: { value: ColorScheme; label: string; swatch: string }[] = [
  { value: "default", label: "Teal",   swatch: "#0891b2" },
  { value: "ocean",   label: "Ocean",  swatch: "#1d4ed8" },
  { value: "sunset",  label: "Sunset", swatch: "#ea580c" },
  { value: "forest",  label: "Forest", swatch: "#16a34a" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Grid ───────────────────────────────────────────────────────────────────

export default function AnalyticsComparisonGrid() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-2">
      <ComparisonCard
        title="Month-over-month comparison"
        description="Current month versus previous month across the highest-signal portfolio levers."
        badge="+14.8% vs last month"
        summary="Deposits, yield, and portfolio value all accelerated month over month."
        icon={<TrendingUp size={18} />}
        csvData={monthComparisonData}
        csvFilename="month-comparison.csv"
        supportedTypes={["bar", "line"]}
      >
        {({ showLegend, chartType, palette, showBrush }) =>
          chartType === "line" ? (
            <LineChart data={monthComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              <XAxis dataKey="metric" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} tickFormatter={(v: number) => `${v}k`} />
              <Tooltip content={<ComparisonTooltip palette={palette} valueSuffix="k" />} />
              {showLegend && <Legend wrapperStyle={{ color: palette.muted, fontSize: 12 }} />}
              {showBrush && <Brush dataKey="metric" height={18} stroke={palette.grid} />}
              <Line type="monotone" dataKey="previous" name="Previous month" stroke={palette.accentAlt} strokeWidth={2.5} dot={{ r: 4, fill: palette.accentAlt }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="current" name="Current month" stroke={palette.accent} strokeWidth={2.5} dot={{ r: 4, fill: palette.accent }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : (
            <BarChart data={monthComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              <XAxis dataKey="metric" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} tickFormatter={(v: number) => `${v}k`} />
              <Tooltip content={<ComparisonTooltip palette={palette} valueSuffix="k" />} cursor={{ fill: palette.grid, opacity: 0.15 }} />
              {showLegend && <Legend wrapperStyle={{ color: palette.muted, fontSize: 12 }} />}
              {showBrush && <Brush dataKey="metric" height={18} stroke={palette.grid} />}
              <Bar dataKey="previous" name="Previous month" fill={palette.accentAlt} radius={[8, 8, 0, 0]} maxBarSize={36} />
              <Bar dataKey="current" name="Current month" fill={palette.accent} radius={[8, 8, 0, 0]} maxBarSize={36} />
            </BarChart>
          )
        }
      </ComparisonCard>

      <ComparisonCard
        title="Year-over-year comparison"
        description="Twelve-month trajectory of portfolio value compared with last year."
        badge="+$25k ahead of last year"
        summary="This year has outperformed last year in every month, widening the gap since Q2."
        icon={<ArrowUpRight size={18} />}
        csvData={yearComparisonData}
        csvFilename="year-comparison.csv"
        supportedTypes={["line", "bar"]}
      >
        {({ showLegend, chartType, palette, showBrush }) =>
          chartType === "bar" ? (
            <BarChart data={yearComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} tickFormatter={(v: number) => `$${v}k`} />
              <Tooltip content={<ComparisonTooltip palette={palette} valuePrefix="$" valueSuffix="k" />} cursor={{ fill: palette.grid, opacity: 0.15 }} />
              {showLegend && <Legend wrapperStyle={{ color: palette.muted, fontSize: 12 }} />}
              {showBrush && <Brush dataKey="month" height={18} stroke={palette.grid} />}
              <Bar dataKey="lastYear" name="Last year" fill={palette.violet} radius={[8, 8, 0, 0]} maxBarSize={18} />
              <Bar dataKey="thisYear" name="This year" fill={palette.accent} radius={[8, 8, 0, 0]} maxBarSize={18} />
            </BarChart>
          ) : (
            <LineChart data={yearComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} tickFormatter={(v: number) => `$${v}k`} />
              <Tooltip content={<ComparisonTooltip palette={palette} valuePrefix="$" valueSuffix="k" />} />
              {showLegend && <Legend wrapperStyle={{ color: palette.muted, fontSize: 12 }} />}
              {showBrush && <Brush dataKey="month" height={18} stroke={palette.grid} />}
              <Line type="monotone" dataKey="lastYear" name="Last year" stroke={palette.violet} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: palette.violet }} />
              <Line type="monotone" dataKey="thisYear" name="This year" stroke={palette.accent} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: palette.accent }} />
            </LineChart>
          )
        }
      </ComparisonCard>

      <ComparisonCard
        title="Goal performance comparison"
        description="Target completion versus actual completion for your active savings goals."
        badge="3 of 4 goals ahead"
        summary="Emergency, travel, and retirement goals are pacing ahead of schedule this cycle."
        icon={<Goal size={18} />}
        csvData={goalPerformanceData}
        csvFilename="goal-comparison.csv"
        supportedTypes={["bar", "line"]}
      >
        {({ showLegend, chartType, palette, showBrush }) =>
          chartType === "line" ? (
            <LineChart data={goalPerformanceData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              <XAxis dataKey="goal" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
              <Tooltip content={<ComparisonTooltip palette={palette} valueSuffix="%" />} />
              {showLegend && <Legend wrapperStyle={{ color: palette.muted, fontSize: 12 }} />}
              {showBrush && <Brush dataKey="goal" height={18} stroke={palette.grid} />}
              <Line type="monotone" dataKey="target" name="Target" stroke={palette.accentAlt} strokeWidth={2.5} dot={{ r: 4, fill: palette.accentAlt }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="actual" name="Actual" stroke={palette.success} strokeWidth={2.5} dot={{ r: 4, fill: palette.success }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : (
            <BarChart data={goalPerformanceData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              <XAxis dataKey="goal" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
              <Tooltip content={<ComparisonTooltip palette={palette} valueSuffix="%" />} cursor={{ fill: palette.grid, opacity: 0.15 }} />
              {showLegend && <Legend wrapperStyle={{ color: palette.muted, fontSize: 12 }} />}
              {showBrush && <Brush dataKey="goal" height={18} stroke={palette.grid} />}
              <Bar dataKey="target" name="Target" fill={palette.accentAlt} radius={[8, 8, 0, 0]} maxBarSize={30} />
              <Bar dataKey="actual" name="Actual" fill={palette.success} radius={[8, 8, 0, 0]} maxBarSize={30} />
            </BarChart>
          )
        }
      </ComparisonCard>

      <ComparisonCard
        title="Pool performance comparison"
        description="Pool APY, 30-day yield, and TVL in a single comparative view."
        badge="XLM Vault leads yield"
        summary="XLM Vault continues to deliver the strongest yield profile with the highest TVL."
        icon={<Layers3 size={18} />}
        csvData={poolPerformanceData}
        csvFilename="pool-comparison.csv"
        supportedTypes={["bar", "line"]}
      >
        {({ showLegend, chartType, palette, showBrush }) =>
          chartType === "line" ? (
            <LineChart data={poolPerformanceData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              <XAxis dataKey="pool" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} />
              <Tooltip content={<ComparisonTooltip palette={palette} />} />
              {showLegend && <Legend wrapperStyle={{ color: palette.muted, fontSize: 12 }} />}
              {showBrush && <Brush dataKey="pool" height={18} stroke={palette.grid} />}
              <Line type="monotone" dataKey="apy" name="APY" stroke={palette.accent} strokeWidth={2.5} dot={{ r: 4, fill: palette.accent }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="yield30d" name="30d Yield" stroke={palette.success} strokeWidth={2.5} dot={{ r: 4, fill: palette.success }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="tvl" name="TVL" stroke={palette.violet} strokeWidth={2.5} dot={{ r: 4, fill: palette.violet }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : (
            <ComposedChart data={poolPerformanceData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              <XAxis dataKey="pool" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} tickFormatter={(v: number) => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: palette.muted, fontSize: 12 }} tickFormatter={(v: number) => `$${v}m`} />
              <Tooltip content={<ComparisonTooltip palette={palette} />} />
              {showLegend && <Legend wrapperStyle={{ color: palette.muted, fontSize: 12 }} />}
              {showBrush && <Brush dataKey="pool" height={18} stroke={palette.grid} />}
              <Bar yAxisId="left" dataKey="apy" name="APY" fill={palette.accent} radius={[8, 8, 0, 0]} maxBarSize={28} />
              <Bar yAxisId="left" dataKey="yield30d" name="30d Yield" fill={palette.success} radius={[8, 8, 0, 0]} maxBarSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="tvl" name="TVL" stroke={palette.violet} strokeWidth={2.5} dot={{ r: 4, fill: palette.violet }} activeDot={{ r: 5, fill: palette.violet }} />
            </ComposedChart>
          )
        }
      </ComparisonCard>
    </div>
  );
}

// ── ComparisonCard ─────────────────────────────────────────────────────────

function ComparisonCard({
  title,
  description,
  badge,
  summary,
  icon,
  children,
  csvData,
  csvFilename,
  supportedTypes,
}: {
  title: string;
  description: string;
  badge: string;
  summary: string;
  icon: React.ReactNode;
  children: (props: RenderProps) => React.ReactNode;
  csvData: Record<string, unknown>[];
  csvFilename: string;
  supportedTypes: CardChartType[];
}) {
  const { resolvedTheme } = useTheme();
  const [showLegend, setShowLegend] = useState(true);
  const [showBrush, setShowBrush] = useState(false);
  const [chartType, setChartType] = useState<CardChartType>(supportedTypes[0]);
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  const [exportOpen, setExportOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const palette = useMemo((): ChartPalette => ({
    ...baseThemeByMode[resolvedTheme],
    ...colorSchemes[colorScheme][resolvedTheme],
  }), [resolvedTheme, colorScheme]);

  React.useEffect(() => {
    if (!exportOpen && !paletteOpen) return;
    const handler = (e: MouseEvent) => {
      if (exportOpen && !exportRef.current?.contains(e.target as Node)) setExportOpen(false);
      if (paletteOpen && !paletteRef.current?.contains(e.target as Node)) setPaletteOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen, paletteOpen]);

  const handleExportSvg = useCallback(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    downloadBlob(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }), csvFilename.replace(".csv", ".svg"));
    setExportOpen(false);
  }, [csvFilename]);

  const handleExportPng = useCallback(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const rect = svg.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => { if (blob) downloadBlob(blob, csvFilename.replace(".csv", ".png")); });
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    setExportOpen(false);
  }, [csvFilename]);

  const handleExportCsv = useCallback(() => {
    if (!csvData.length) return;
    const keys = Object.keys(csvData[0]);
    const rows = [keys.join(","), ...csvData.map((row) => keys.map((k) => row[k]).join(","))];
    downloadBlob(new Blob([rows.join("\n")], { type: "text/csv" }), csvFilename);
    setExportOpen(false);
  }, [csvData, csvFilename]);

  const iconBtn = (active: boolean) =>
    `flex items-center justify-center rounded-lg p-1.5 transition-colors ${
      active
        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)]"
    }`;

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-linear-to-b from-[var(--color-card-start)] to-[var(--color-card-end)] p-6">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)]">
            {icon}
          </span>
          <div>
            <h3 className="m-0 text-lg font-semibold text-[var(--color-text)]">{title}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
          </div>
        </div>
        <span className="whitespace-nowrap rounded-full border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
          {badge}
        </span>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Chart type */}
        <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 gap-0.5">
          {supportedTypes.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={chartType === t}
              onClick={() => setChartType(t)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                chartType === t
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {t === "line" ? <LineIcon size={12} /> : <BarChart2 size={12} />}
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>

        {/* Legend toggle */}
        <button
          type="button"
          aria-pressed={showLegend}
          aria-label="Toggle legend"
          onClick={() => setShowLegend((v) => !v)}
          className={iconBtn(showLegend)}
          title="Toggle legend"
        >
          {showLegend ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>

        {/* Zoom/brush toggle */}
        <button
          type="button"
          aria-pressed={showBrush}
          aria-label="Toggle zoom"
          onClick={() => setShowBrush((v) => !v)}
          className={iconBtn(showBrush)}
          title="Zoom & pan"
        >
          {showBrush ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {/* Color scheme */}
        <div ref={paletteRef} className="relative">
          <button
            type="button"
            aria-expanded={paletteOpen}
            aria-label="Color scheme"
            onClick={() => setPaletteOpen((v) => !v)}
            className={iconBtn(paletteOpen)}
            title="Color scheme"
          >
            <Palette size={14} />
          </button>
          {paletteOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-2 shadow-xl">
              <p className="mb-2 px-1 text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">Color scheme</p>
              <div className="flex flex-col gap-1">
                {COLOR_SCHEME_OPTIONS.map(({ value, label, swatch }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setColorScheme(value); setPaletteOpen(false); }}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                      colorScheme === value
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                        : "text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]"
                    }`}
                  >
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: swatch }} />
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
            aria-expanded={exportOpen}
            aria-label="Export"
            onClick={() => setExportOpen((v) => !v)}
            className={iconBtn(exportOpen)}
            title="Export"
          >
            <Download size={14} />
          </button>
          {exportOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 min-w-[140px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-1.5 shadow-xl">
              {[
                { label: "Export PNG", action: handleExportPng },
                { label: "Export SVG", action: handleExportSvg },
                { label: "Export CSV", action: handleExportCsv },
              ].map(({ label, action }) => (
                <button key={label} type="button" onClick={action} className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]">
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="mt-4 w-full" style={{ height: showBrush ? 310 : 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          {children({ showLegend, chartType, palette, showBrush }) as React.ReactElement}
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-sm text-[var(--color-text-soft)]">{summary}</p>
    </article>
  );
}

// ── Tooltip ────────────────────────────────────────────────────────────────

function ComparisonTooltip({
  active, payload, label, palette, valuePrefix = "", valueSuffix = "",
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  palette: ChartPalette;
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: palette.tooltipBg, border: `1px solid ${palette.tooltipBorder}`, borderRadius: 14, padding: "12px 14px", boxShadow: "0 18px 40px rgba(15,23,42,0.18)" }}>
      <p style={{ margin: 0, fontSize: 12, color: palette.muted, marginBottom: 8 }}>{label}</p>
      <div style={{ display: "grid", gap: 6 }}>
        {payload.map((item) => (
          <div key={String(item.dataKey ?? item.name)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: item.color ?? palette.accent, flexShrink: 0 }} />
            <span style={{ color: palette.text, fontSize: 13, fontWeight: 600 }}>
              {item.name}: {formatValue(item.value, item.dataKey, valuePrefix, valueSuffix)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatValue(value: number | string | undefined, dataKey: string | number | undefined, valuePrefix: string, valueSuffix: string) {
  if (typeof value !== "number") return value ?? "";
  if (dataKey === "tvl") return `$${value.toFixed(2)}m`;
  if (dataKey === "apy" || dataKey === "yield30d") return `${value}%`;
  if (valuePrefix || valueSuffix) return `${valuePrefix}${value}${valueSuffix}`;
  return value.toString();
}
