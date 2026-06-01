"use client";

import React, { useCallback, useMemo, useRef } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ChartControls from "./ChartControls";
import { colorSchemes, useChartPreferences } from "./useChartPreferences";
import type { ChartType, TimeRange } from "./useChartPreferences";

const allChartData = [
  { date: "Aug 04", value: 105400, prev: 98200 },
  { date: "Aug 11", value: 106200, prev: 99100 },
  { date: "Aug 18", value: 107850, prev: 100300 },
  { date: "Aug 25", value: 108700, prev: 101200 },
  { date: "Sep 01", value: 110100, prev: 102500 },
  { date: "Sep 08", value: 111450, prev: 103800 },
  { date: "Sep 15", value: 113200, prev: 104900 },
  { date: "Sep 22", value: 114900, prev: 106100 },
  { date: "Sep 29", value: 116500, prev: 107400 },
  { date: "Oct 01", value: 118200, prev: 108700 },
  { date: "Oct 03", value: 119800, prev: 109500 },
  { date: "Oct 05", value: 119500, prev: 110200 },
  { date: "Oct 07", value: 120100, prev: 110900 },
  { date: "Oct 09", value: 119900, prev: 111400 },
  { date: "Oct 10", value: 120800, prev: 112000 },
  { date: "Oct 12", value: 121200, prev: 112600 },
  { date: "Oct 14", value: 120600, prev: 113100 },
  { date: "Oct 16", value: 121800, prev: 113700 },
  { date: "Oct 18", value: 122300, prev: 114200 },
  { date: "Oct 20", value: 123100, prev: 114800 },
  { date: "Oct 22", value: 123800, prev: 115300 },
  { date: "Oct 25", value: 124500, prev: 115900 },
  { date: "Oct 27", value: 124200, prev: 116300 },
  { date: "Oct 30", value: 124800, prev: 116800 },
  { date: "Nov 01", value: 124592, prev: 117200 },
];

const windowLimits: Record<TimeRange, number> = {
  "7D": 7,
  "30D": 16,
  "90D": 25,
  "1Y": 25,
};

type TooltipItem = { color?: string; dataKey?: string | number; name?: string; value?: number; payload: { date: string; value: number; prev?: number } };

function CustomTooltip({
  active, payload, theme,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  theme: { tooltipBg: string; tooltipBorder: string; muted: string; text: string };
}) {
  if (!active || !payload?.length) return null;
  const date = payload[0].payload.date;
  return (
    <div style={{ background: theme.tooltipBg, border: `1px solid ${theme.tooltipBorder}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
      <p style={{ margin: 0, fontSize: 11, color: theme.muted, marginBottom: 6 }}>{date}, 2023</p>
      {payload.map((item) => (
        <p key={String(item.dataKey)} style={{ margin: "2px 0", fontSize: 14, fontWeight: 700, color: item.color ?? theme.text }}>
          {item.name}: ${(item.value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

function ActiveDot({ cx = 0, cy = 0, theme }: { cx?: number; cy?: number; theme: { accentSoft: string; background: string; accent: string } }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={theme.accentSoft} />
      <circle cx={cx} cy={cy} r={5} fill={theme.background} stroke={theme.accent} strokeWidth={2} />
      <line x1={cx} y1={cy + 10} x2={cx} y2={300} stroke={theme.accentSoft} strokeWidth={1} strokeDasharray="3 3" />
    </g>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PortfolioPerformanceChart() {
  const { resolvedTheme } = useTheme();
  const { prefs, update } = useChartPreferences();
  const containerRef = useRef<HTMLDivElement>(null);

  const baseTheme = useMemo(() => ({
    background: resolvedTheme === "dark" ? "#081418" : "#ffffff",
    text: resolvedTheme === "dark" ? "#ffffff" : "#0f1f2a",
    muted: resolvedTheme === "dark" ? "#5e8c96" : "#4a7080",
    grid: resolvedTheme === "dark" ? "rgba(94,140,150,0.07)" : "rgba(74,112,128,0.12)",
    tooltipBg: resolvedTheme === "dark" ? "rgba(8,20,24,0.95)" : "rgba(255,255,255,0.98)",
    tooltipBorder: resolvedTheme === "dark" ? "rgba(0,201,200,0.3)" : "rgba(8,145,178,0.18)",
  }), [resolvedTheme]);

  const palette = useMemo(() => colorSchemes[prefs.colorScheme][resolvedTheme], [prefs.colorScheme, resolvedTheme]);
  const chartTheme = useMemo(() => ({ ...baseTheme, ...palette }), [baseTheme, palette]);

  const chartData = useMemo(() => allChartData.slice(-windowLimits[prefs.timeRange]), [prefs.timeRange]);

  const handleExportSvg = useCallback(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    downloadBlob(new Blob([serialized], { type: "image/svg+xml" }), "portfolio-chart.svg");
  }, []);

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
      canvas.toBlob((blob) => { if (blob) downloadBlob(blob, "portfolio-chart.png"); });
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  }, []);

  const handleExportCsv = useCallback(() => {
    const header = prefs.showComparison ? "date,value,prev" : "date,value";
    const rows = chartData.map((d) =>
      prefs.showComparison ? `${d.date},${d.value},${d.prev}` : `${d.date},${d.value}`
    );
    downloadBlob(new Blob([[header, ...rows].join("\n")], { type: "text/csv" }), "portfolio-chart.csv");
  }, [chartData, prefs.showComparison]);

  const commonProps = {
    data: chartData,
    margin: { top: 20, right: 24, bottom: 0, left: 24 },
  };

  const xAxis = <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: chartTheme.muted, fontSize: 11 }} dy={10} interval={1} />;
  const yAxis = <YAxis hide domain={["dataMin - 2000", "dataMax + 1000"]} />;
  const grid = <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />;
  const tooltip = <Tooltip content={<CustomTooltip theme={chartTheme} />} cursor={false} />;
  const brush = prefs.showBrush ? (
    <Brush
      dataKey="date"
      height={20}
      stroke={chartTheme.grid}
      fill={resolvedTheme === "dark" ? "rgba(8,20,24,0.6)" : "rgba(255,255,255,0.6)"}
      travellerWidth={6}
    />
  ) : null;
  const legend = prefs.showLegend ? <Legend wrapperStyle={{ color: chartTheme.muted, fontSize: 12 }} /> : null;

  function renderChart(type: ChartType) {
    if (type === "line") {
      return (
        <LineChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}{legend}{brush}
          <Line type="monotone" dataKey="value" name="Portfolio" stroke={palette.accent} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: palette.accent }} />
          {prefs.showComparison && (
            <Line type="monotone" dataKey="prev" name="Prev. period" stroke={palette.accentAlt} strokeWidth={2} dot={false} strokeDasharray="4 3" activeDot={{ r: 4, fill: palette.accentAlt }} />
          )}
        </LineChart>
      );
    }

    if (type === "bar") {
      return (
        <BarChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}{legend}{brush}
          <Bar dataKey="value" name="Portfolio" fill={palette.accent} radius={[4, 4, 0, 0]} maxBarSize={24} />
          {prefs.showComparison && (
            <Bar dataKey="prev" name="Prev. period" fill={palette.accentAlt} radius={[4, 4, 0, 0]} maxBarSize={24} />
          )}
        </BarChart>
      );
    }

    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="portfolioAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity={0.25} />
            <stop offset="60%" stopColor={palette.accent} stopOpacity={0.06} />
            <stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="portfolioAreaGradPrev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.accentAlt} stopOpacity={0.18} />
            <stop offset="100%" stopColor={palette.accentAlt} stopOpacity={0} />
          </linearGradient>
        </defs>
        {grid}{xAxis}{yAxis}{tooltip}{legend}{brush}
        {prefs.showComparison && (
          <Area type="monotone" dataKey="prev" name="Prev. period" stroke={palette.accentAlt} strokeWidth={1.5} strokeDasharray="4 3" fill="url(#portfolioAreaGradPrev)" dot={false} />
        )}
        <Area type="monotone" dataKey="value" name="Portfolio" stroke={palette.accent} strokeWidth={2} fill="url(#portfolioAreaGrad)" activeDot={<ActiveDot theme={chartTheme} />} dot={false} />
      </AreaChart>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-linear-to-b from-[var(--color-card-start)] to-[var(--color-card-end)]">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6 pb-2">
        <div>
          <p className="m-0 mb-1 text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
            Total Portfolio Value
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="m-0 text-[32px] leading-tight font-bold text-[var(--color-text)]">
              $124,592.45
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
              <TrendingUp size={12} />
              +12.4%
            </span>
          </div>
        </div>

        <ChartControls
          chartType={prefs.chartType}
          timeRange={prefs.timeRange}
          colorScheme={prefs.colorScheme}
          showLegend={prefs.showLegend}
          showComparison={prefs.showComparison}
          showBrush={prefs.showBrush}
          onChartType={(v) => update("chartType", v)}
          onTimeRange={(v) => update("timeRange", v)}
          onColorScheme={(v) => update("colorScheme", v)}
          onLegendToggle={() => update("showLegend", !prefs.showLegend)}
          onComparisonToggle={() => update("showComparison", !prefs.showComparison)}
          onBrushToggle={() => update("showBrush", !prefs.showBrush)}
          onExportPng={handleExportPng}
          onExportSvg={handleExportSvg}
          onExportCsv={handleExportCsv}
        />
      </div>

      <div className="px-6 pb-1 text-sm text-[var(--color-text-soft)]">
        Viewing the last {prefs.timeRange.toLowerCase()} of portfolio movement.
        {prefs.showComparison && <span className="ml-1 text-[var(--color-text-muted)]">· Comparing previous period.</span>}
      </div>

      <div ref={containerRef} className="w-full" style={{ height: prefs.showBrush ? 300 : 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(prefs.chartType)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
