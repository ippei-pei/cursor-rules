"use client";

import React from "react";
import { Container, Card, Table } from "react-bootstrap";

// page.tsx から受け取る Props の型定義
interface PageContentProps {
  readmeHtml: string;
  readmeError?: string;
  techStackHtml: string;
  techStackError?: string;
  latestMetricsData: Record<string, string>[];
  latestMetricsFile?: string;
  metricsError?: string;
  // chartData: { date: string; [ruleId: string]: number | string }[]; // Temporarily removed as chart is disabled
  // chartLines: { key: string; color: string }[]; // Temporarily removed as chart is disabled
  hintHtml: string;
  hintError?: string;
  hintFilename?: string;
  // Add props for manual insights and links if needed later
  // manualInsightsHtml?: string;
  // manualInsightsError?: string;
  // linksHtml?: string;
  // linksError?: string;
}

const PageContent: React.FC<PageContentProps> = ({
  readmeHtml,
  readmeError,
  techStackHtml,
  techStackError,
  latestMetricsData,
  latestMetricsFile,
  metricsError,
  // chartData, // Temporarily removed
  // chartLines, // Temporarily removed
  hintHtml,
  hintError,
  hintFilename,
  // manualInsightsHtml, // Not used yet
  // manualInsightsError,
  // linksHtml, // Not used yet
  // linksError,
}) => {
  // page.tsx の元の return 文の中身をここに移植
  return (
    <Container className="my-4">
      <h1>Cursor Rule Metrics</h1>

      {/* README Section */}
      <Card className="mb-4">
        <Card.Header>ルールの概要 (README)</Card.Header>
        <Card.Body>
          {readmeError ? (
            <p className="text-danger">{readmeError}</p>
          ) : readmeHtml ? (
            <div dangerouslySetInnerHTML={{ __html: readmeHtml }} />
          ) : (
            <p>コンテンツがありません。</p>
          )}
        </Card.Body>
      </Card>

      {/* Tech Stack Section */}
      <Card className="mb-4">
        <Card.Header>技術スタックルール (tech-stack.md)</Card.Header>
        <Card.Body>
          {techStackError ? (
            <p className="text-danger">{techStackError}</p>
          ) : techStackHtml ? (
            <div dangerouslySetInnerHTML={{ __html: techStackHtml }} />
          ) : (
            <p>コンテンツがありません。</p>
          )}
        </Card.Body>
      </Card>

      {/* Metrics Table Section */}
      <Card className="mb-4">
        <Card.Header>最新メトリクス ({latestMetricsFile || "N/A"})</Card.Header>
        <Card.Body>
          {metricsError ? (
            <p className="text-danger">{metricsError}</p>
          ) : latestMetricsData && latestMetricsData.length > 0 ? (
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  {Object.keys(latestMetricsData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latestMetricsData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>表示するメトリクスデータがありません。</p>
          )}
        </Card.Body>
      </Card>

      {/* Metrics Chart Section */}
      <Card className="mb-4">
        <Card.Header>メトリクス推移</Card.Header>
        <Card.Body>
          {metricsError ? (
            <p className="text-danger">{metricsError}</p>
          ) : latestMetricsData && latestMetricsData.length > 0 ? (
            // <ChartLoader data={chartData} lines={chartLines} /> // Still commented out
            <p>テスト: グラフ表示箇所</p>
          ) : (
            <p>グラフを表示するためのデータがありません。</p>
          )}
        </Card.Body>
      </Card>

      {/* Hints Section */}
      <Card className="mb-4">
        <Card.Header>
          スコア変動要因ヒント ({hintFilename || "N/A"})
        </Card.Header>
        <Card.Body>
          {hintError ? (
            <p className="text-danger">{hintError}</p>
          ) : hintHtml ? (
            <div dangerouslySetInnerHTML={{ __html: hintHtml }} />
          ) : (
            <p>利用可能なヒントはありません。</p>
          )}
        </Card.Body>
      </Card>

      {/* Manual Insights Section */}
      <Card className="mb-4">
        <Card.Header>考察 (手動追記)</Card.Header>
        <Card.Body>
          <p>ここに手動での考察やコメントが追記されます。(TBD)</p>
          <p>
            <em>(編集機能は未実装です)</em>
          </p>
        </Card.Body>
      </Card>

      {/* Links Section */}
      <Card className="mb-4">
        <Card.Header>関連リンク</Card.Header>
        <Card.Body>
          <p>
            <a href="#repo">GitHub リポジトリ</a>
          </p>
          <p>
            <a href="#issues">フィードバックはこちら (GitHub Issues)</a>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PageContent;
