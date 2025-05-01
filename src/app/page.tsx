import fs from "fs/promises";
import path from "path";
import { marked } from "marked";
import { Container, Card, Table } from "react-bootstrap";
// import dynamic from 'next/dynamic'; // 不要になった dynamic インポートを削除

// ファイルを読み込む非同期関数
async function readFileContent(filePath: string): Promise<{ content: string; error?: string }> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return { content };
  } catch (error) {
    console.error(`Error reading ${path.basename(filePath)}:`, error);
    return { content: "", error: `ファイルの読み込みに失敗しました: ${path.basename(filePath)}` };
  }
}

// CSV文字列をパースする関数 (簡易版)
function parseCsv(csvString: string): Record<string, string>[] {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return []; // ヘッダーとデータ行が必要

  const header = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    // ダブルクォート内のカンマを考慮 (簡易的な対応)
    const values = line.split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);
    const row: Record<string, string> = {};
    header.forEach((key, index) => {
      row[key] = values[index]?.trim().replace(/^"|"$/g, '') || ''; // 前後のダブルクォートを削除
    });
    return row;
  });
  return data;
}

// ファイル名から日付を抽出する関数 (YYYYMMDD形式を想定)
function extractDateFromFilename(filename: string): string | null {
  const match = filename.match(/metrics-(\d{8})\.csv/);
  return match ? match[1] : null;
}

// 過去のメトリクスデータを読み込む関数
async function loadAllMetricsData(metricsDir: string): Promise<{
  dataByDate: Record<string, Record<string, string>[]>;
  error?: string;
  latestFile?: string;
}> {
  const dataByDate: Record<string, Record<string, string>[]> = {};
  let latestFile: string | undefined = undefined;
  let error: string | undefined = undefined;

  try {
    const files = await fs.readdir(metricsDir);
    const csvFiles = files
      .filter(file => file.startsWith("metrics-") && file.endsWith(".csv"))
      .sort(); // 時系列順にソート

    if (csvFiles.length === 0) {
      return { dataByDate, error: "メトリクスファイルが見つかりません。" };
    }

    latestFile = csvFiles[csvFiles.length - 1]; // 最後が最新

    for (const file of csvFiles) {
      const date = extractDateFromFilename(file);
      if (!date) continue; // 日付が抽出できなければスキップ

      const filePath = path.join(metricsDir, file);
      const fileResult = await readFileContent(filePath);

      if (fileResult.error) {
        // 個別ファイルのエラーはログに出力するが、全体のエラーとはしない
        console.warn(`Warning reading ${file}: ${fileResult.error}`);
        continue;
      }
      dataByDate[date] = parseCsv(fileResult.content);
    }
  } catch (err) {
    console.error("Error accessing metrics directory:", err);
    error = "メトリクスデータの読み込み中にエラーが発生しました。";
  }

  return { dataByDate, error, latestFile };
}

// 文字列から色を生成する簡易的な関数 (ハッシュベース)
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  // 色が見やすいように少し調整 (例: 明るさを確保)
  // より洗練された方法もありますが、ここではシンプルにします
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 128) { // 暗すぎる場合は少し明るくする (例)
     // 簡単な例: #808080 に近づける (より良い方法は検討可能)
     return `#${(0x80 + Math.floor(r/2)).toString(16).padStart(2, '0')}${(0x80 + Math.floor(g/2)).toString(16).padStart(2, '0')}${(0x80 + Math.floor(b/2)).toString(16).padStart(2, '0')}`;
  }
  return color;
}

// allMetricsData を Recharts 用のデータ形式に変換する関数
function transformDataForChart(dataByDate: Record<string, Record<string, string>[]>): {
  chartData: { date: string; [ruleId: string]: number | string }[];
  ruleIds: string[];
} {
  const chartData: { date: string; [ruleId: string]: number | string }[] = [];
  const ruleIdSet = new Set<string>();

  // 日付順にソートして処理
  const sortedDates = Object.keys(dataByDate).sort();

  for (const date of sortedDates) {
    const dailyData = dataByDate[date];
    const chartEntry: { date: string; [ruleId: string]: number | string } = { date };

    for (const ruleData of dailyData) {
      if (ruleData["Rule ID"] && ruleData["Score"]) {
        const ruleId = ruleData["Rule ID"];
        const score = parseInt(ruleData["Score"], 10);
        if (!isNaN(score)) {
          chartEntry[ruleId] = score;
          ruleIdSet.add(ruleId);
        }
      }
    }
    chartData.push(chartEntry);
  }

  return { chartData, ruleIds: Array.from(ruleIdSet) };
}

// 最新のヒント Markdown ファイルを読み込む関数
async function loadLatestHintContent(metricsDir: string): Promise<{ content: string; error?: string; filename?: string }> {
  let filename: string | undefined = undefined;
  let content: string = "";
  let error: string | undefined = undefined;

  try {
    const files = await fs.readdir(metricsDir);
    const hintFiles = files
      .filter(file => file.startsWith("_hints-") && file.endsWith(".md"))
      .sort()
      .reverse(); // 最新ファイルを先頭に

    if (hintFiles.length > 0) {
      filename = hintFiles[0];
      const hintFilePath = path.join(metricsDir, filename);
      const hintResult = await readFileContent(hintFilePath);
      if (hintResult.error) {
        error = hintResult.error;
      } else {
        content = hintResult.content;
      }
    } else {
      // ヒントファイルがなくてもエラーとはしない
      content = "利用可能なヒントはありません。";
    }
  } catch (err) {
    console.error("Error accessing metrics directory for hints:", err);
    error = "ヒントファイルの読み込み中にエラーが発生しました。";
  }

  return { content, error, filename };
}

export default async function Home() {
  // プロジェクトルートからの相対パス
  const contentDir = path.join(process.cwd(), "src", "content"); // コンテンツディレクトリのベースパス
  const rulesDir = path.join(contentDir, "rules"); // ルールコンテンツディレクトリ
  const metricsDir = path.join(contentDir, "metrics"); // メトリクスコンテンツディレクトリ
  const readmePath = path.join(rulesDir, "README.md");
  const techStackPath = path.join(rulesDir, "tech-stack.md"); // ファイル名を変更

  // 全メトリクスデータを読み込む
  const { dataByDate: allMetricsData, error: errorLoadingMetrics, latestFile: latestMetricsFile } = await loadAllMetricsData(metricsDir);

  // 最新のメトリクスデータを取得 (存在すれば)
  const latestMetricsData = latestMetricsFile && allMetricsData[extractDateFromFilename(latestMetricsFile) || '']
    ? allMetricsData[extractDateFromFilename(latestMetricsFile) || '']
    : [];

  // グラフ用データ整形
  const { chartData, ruleIds } = transformDataForChart(allMetricsData);
  const chartLines = ruleIds.map(id => ({ key: id, color: stringToColor(id) }));

  // ルールファイルと最新ヒントを並列読み込み
  const [readmeResult, techStackResult, hintResult] = await Promise.all([
    readFileContent(readmePath),
    readFileContent(techStackPath),
    loadLatestHintContent(metricsDir), // 最新ヒントを読み込む
  ]);

  // markedでMarkdownをHTMLに変換 (エラーや空の場合を考慮)
  const readmeHtml = readmeResult.content ? marked(readmeResult.content) : ''; // 空文字列をデフォルトに
  const techStackHtml = techStackResult.content ? marked(techStackResult.content) : ''; // 空文字列をデフォルトに
  const hintHtml = hintResult.content ? marked(hintResult.content) : ''; // 空文字列をデフォルトに

  return (
    <Container className="my-4">
      <h1>Cursor Rule Metrics</h1>

      {/* README Section - Ensure content exists before rendering */} 
      <Card className="mb-4">
        <Card.Header>ルールの概要 (README)</Card.Header>
        <Card.Body>
          {readmeResult.error ? (
            <p className="text-danger">{readmeResult.error}</p>
          ) : readmeHtml ? (
            <div dangerouslySetInnerHTML={{ __html: readmeHtml }} />
          ) : (
            <p>コンテンツがありません。</p> // Fallback for empty content
          )}
        </Card.Body>
      </Card>

      {/* Tech Stack Section - Ensure content exists */} 
      <Card className="mb-4">
        <Card.Header>技術スタックルール (tech-stack.md)</Card.Header>
        <Card.Body>
          {techStackResult.error ? (
            <p className="text-danger">{techStackResult.error}</p>
          ) : techStackHtml ? (
            <div dangerouslySetInnerHTML={{ __html: techStackHtml }} />
          ) : (
            <p>コンテンツがありません。</p>
          )}
        </Card.Body>
      </Card>

      {/* Metrics Table Section - Ensure data exists */} 
      <Card className="mb-4">
        <Card.Header>最新メトリクス ({latestMetricsFile || "N/A"})</Card.Header>
        <Card.Body>
          {errorLoadingMetrics ? (
            <p className="text-danger">{errorLoadingMetrics}</p>
          ) : latestMetricsData && latestMetricsData.length > 0 ? ( // Check data existence more strictly
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  {Object.keys(latestMetricsData[0]).map(key => (
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

      {/* Metrics Chart Section - Ensure data exists */} 
      <Card className="mb-4">
        <Card.Header>メトリクス推移</Card.Header>
        <Card.Body>
          {errorLoadingMetrics ? (
            <p className="text-danger">{errorLoadingMetrics}</p>
          ) : chartData && chartData.length > 0 && chartLines && chartLines.length > 0 ? ( // Check data existence
            // <ChartLoader data={chartData} lines={chartLines} />
            <p>テスト: グラフ表示箇所</p> // Replace ChartLoader with simple text
          ) : (
            <p>グラフを表示するためのデータがありません。</p>
          )}
        </Card.Body>
      </Card>
      
      {/* Hints Section - Ensure content exists */} 
      <Card className="mb-4">
        <Card.Header>スコア変動要因ヒント ({hintResult.filename || "N/A"})</Card.Header>
        <Card.Body>
          {hintResult.error ? (
            <p className="text-danger">{hintResult.error}</p>
          ) : hintHtml ? (
            <div dangerouslySetInnerHTML={{ __html: hintHtml }} />
          ) : (
            <p>利用可能なヒントはありません。</p> // Updated fallback message
          )}
        </Card.Body>
      </Card>

      {/* Manual Insights Section - No data dependency here */}
      <Card className="mb-4">
        <Card.Header>考察 (手動追記)</Card.Header>
        <Card.Body>
          <p>ここに手動での考察やコメントが追記されます。(TBD)</p>
          <p><em>(編集機能は未実装です)</em></p>
        </Card.Body>
      </Card>

      {/* Links Section - No data dependency here */}
      <Card className="mb-4">
        <Card.Header>関連リンク</Card.Header>
        <Card.Body>
          {/* TODO: 正しいリポジトリ URL に置き換える */}
          <p>
            <a
              href="https://github.com/your-username/your-repo-name"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub リポジトリ
            </a>
          </p>
          {/* TODO: 正しい Issues URL に置き換える */}
          <p>
            <a
              href="https://github.com/your-username/your-repo-name/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              フィードバックはこちら (GitHub Issues)
            </a>
          </p>
        </Card.Body>
      </Card>

    </Container>
  );
}
