'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Props の型定義 (後で page.tsx から渡すデータ構造に合わせる)
interface MetricsChartProps {
  data: { date: string; [ruleId: string]: number | string }[]; // any[] から具体的な型に変更
  lines: { key: string; color: string }[]; // TODO: 型を具体的にする
}

const MetricsChart: React.FC<MetricsChartProps> = ({ data, lines }) => {
  if (!data || data.length === 0) {
    return <p>グラフを表示するためのデータがありません。</p>;
  }

  return (
    // ResponsiveContainer を使って親要素のサイズに合わせる
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" /> {/* X軸は日付 */} 
        <YAxis />
        <Tooltip />
        <Legend />
        {/* lines 配列に基づいて Line コンポーネントを動的に生成 */} 
        {lines.map(line => (
          <Line 
            key={line.key}
            type="monotone" 
            dataKey={line.key} // Y軸の値のキー (Rule ID)
            stroke={line.color} // 線の色 
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MetricsChart; 