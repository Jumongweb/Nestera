"use client";

import { useCallback, useEffect, useState } from "react";

export type ChartType = "area" | "line" | "bar";
export type TimeRange = "7D" | "30D" | "90D" | "1Y";
export type ColorScheme = "default" | "ocean" | "sunset" | "forest";

export type ChartPreferences = {
  chartType: ChartType;
  timeRange: TimeRange;
  colorScheme: ColorScheme;
  showLegend: boolean;
  showComparison: boolean;
  showBrush: boolean;
};

const STORAGE_KEY = "nestera-chart-prefs";

const defaults: ChartPreferences = {
  chartType: "area",
  timeRange: "30D",
  colorScheme: "default",
  showLegend: false,
  showComparison: false,
  showBrush: false,
};

function readStorage(): Partial<ChartPreferences> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<ChartPreferences>) : {};
  } catch {
    return {};
  }
}

export function useChartPreferences() {
  const [prefs, setPrefs] = useState<ChartPreferences>(defaults);

  useEffect(() => {
    setPrefs({ ...defaults, ...readStorage() });
  }, []);

  const update = useCallback(<K extends keyof ChartPreferences>(key: K, value: ChartPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { prefs, update };
}

export type ColorSchemePalette = {
  accent: string;
  accentAlt: string;
  accentSoft: string;
  success: string;
  violet: string;
};

export const colorSchemes: Record<ColorScheme, Record<"light" | "dark", ColorSchemePalette>> = {
  default: {
    light: { accent: "#0891b2", accentAlt: "#2563eb", accentSoft: "rgba(8,145,178,0.18)", success: "#059669", violet: "#7c3aed" },
    dark:  { accent: "#00c9c8", accentAlt: "#60a5fa", accentSoft: "rgba(0,201,200,0.18)", success: "#34d399", violet: "#a78bfa" },
  },
  ocean: {
    light: { accent: "#1d4ed8", accentAlt: "#7c3aed", accentSoft: "rgba(29,78,216,0.15)", success: "#0891b2", violet: "#4f46e5" },
    dark:  { accent: "#60a5fa", accentAlt: "#a78bfa", accentSoft: "rgba(96,165,250,0.18)", success: "#38bdf8", violet: "#818cf8" },
  },
  sunset: {
    light: { accent: "#ea580c", accentAlt: "#d97706", accentSoft: "rgba(234,88,12,0.15)", success: "#16a34a", violet: "#db2777" },
    dark:  { accent: "#fb923c", accentAlt: "#fbbf24", accentSoft: "rgba(251,146,60,0.18)", success: "#4ade80", violet: "#f472b6" },
  },
  forest: {
    light: { accent: "#16a34a", accentAlt: "#0891b2", accentSoft: "rgba(22,163,74,0.15)", success: "#15803d", violet: "#7c3aed" },
    dark:  { accent: "#4ade80", accentAlt: "#34d399", accentSoft: "rgba(74,222,128,0.18)", success: "#86efac", violet: "#a78bfa" },
  },
};
