"use client";

import React from "react";
import dynamic from "next/dynamic";

// MetricsChart をダイナミックインポート (SSR無効)
const MetricsChart = dynamic(() => import("@/components/MetricsChart"), {
  ssr: false,
  loading: () => <p>グラフを読み込み中...</p>,
});

// MetricsChart に渡す Props の型 (page.tsx から受け取る)
interface ChartLoaderProps {
  data: { date: string; [ruleId: string]: number | string }[];
  lines: { key: string; color: string }[];
}

// このコンポーネントがダイナミックインポートとレンダリングを担当
const ChartLoader: React.FC<ChartLoaderProps> = ({ data, lines }) => {
  // 内部で MetricsChart をレンダリングする
  return <MetricsChart data={data} lines={lines} />;
};

export default ChartLoader;
