import fs from "fs/promises"; // Keep fs and path for data fetching
import path from "path";
import { marked } from "marked"; // Keep marked for preprocessing
// Remove react-bootstrap imports

// Import the new client component
import PageContent from "@/components/PageContent";

// Keep data fetching and processing functions
async function readFileContent(
  filePath: string,
): Promise<{ content: string; error?: string }> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return { content };
  } catch (error) {
    console.error(`Error reading ${path.basename(filePath)}:`, error);
    return {
      content: "",
      error: `ファイルの読み込みに失敗しました: ${path.basename(filePath)}`,
    };
  }
}

function parseCsv(csvString: string): Record<string, string>[] {
  const lines = csvString.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const data = lines.slice(1).map((line) => {
    const values = line.split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);
    const row: Record<string, string> = {};
    header.forEach((key, index) => {
      row[key] = values[index]?.trim().replace(/^"|"$/g, "") || "";
    });
    return row;
  });
  return data;
}

function extractDateFromFilename(filename: string): string | null {
  const match = filename.match(/metrics-(\d{8})\.csv/);
  return match ? match[1] : null;
}

async function loadAllMetricsData(
  metricsDir: string,
): Promise<{
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
      .filter((file) => file.startsWith("metrics-") && file.endsWith(".csv"))
      .sort();
    if (csvFiles.length === 0) {
      return { dataByDate, error: "メトリクスファイルが見つかりません。" };
    }
    latestFile = csvFiles[csvFiles.length - 1];
    for (const file of csvFiles) {
      const date = extractDateFromFilename(file);
      if (!date) continue;
      const filePath = path.join(metricsDir, file);
      const fileResult = await readFileContent(filePath);
      if (fileResult.error) {
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

// stringToColor is only needed for chart, can be removed or kept for later
// function stringToColor(...) { /* ... */ }

function transformDataForChart(
  dataByDate: Record<string, Record<string, string>[]>,
): {
  chartData: { date: string; [ruleId: string]: number | string }[];
  ruleIds: string[];
} {
  const chartData: { date: string; [ruleId: string]: number | string }[] = [];
  const ruleIdSet = new Set<string>();
  const sortedDates = Object.keys(dataByDate).sort();
  for (const date of sortedDates) {
    const dailyData = dataByDate[date];
    const chartEntry: { date: string; [ruleId: string]: number | string } = {
      date,
    };
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

async function loadLatestHintContent(
  metricsDir: string,
): Promise<{ content: string; error?: string; filename?: string }> {
  let filename: string | undefined = undefined;
  let content: string = "";
  let error: string | undefined = undefined;
  try {
    const files = await fs.readdir(metricsDir);
    const hintFiles = files
      .filter((file) => file.startsWith("_hints-") && file.endsWith(".md"))
      .sort()
      .reverse();
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
      content = "利用可能なヒントはありません。";
    }
  } catch (err) {
    console.error("Error accessing metrics directory for hints:", err);
    error = "ヒントファイルの読み込み中にエラーが発生しました。";
  }
  return { content, error, filename };
}

export default async function Home() {
  // Fetch and process data
  const readmePath = path.join(process.cwd(), "README.md");
  // const techStackPath = path.join(process.cwd(), "docs", "tech_stack.md"); // Old path
  const techStackPath = path.join(process.cwd(), "src", "content", "rules", "tech-stack.md"); // Corrected path
  // const metricsDir = path.join(process.cwd(), "data", "metrics"); // Old path
  const metricsDir = path.join(process.cwd(), "src", "content", "metrics"); // Corrected path
  // const manualInsightsPath = path.join( // Removed
  //   process.cwd(),
  //   "docs",
  //   "manual_insights.md",
  // );
  // const linksPath = path.join(process.cwd(), "docs", "links.md"); // Removed

  const [readmeResult, techStackResult, metricsResult, hintResult] =
    await Promise.all([
      readFileContent(readmePath),
      readFileContent(techStackPath),
      loadAllMetricsData(metricsDir),
      loadLatestHintContent(metricsDir),
      // readFileContent(manualInsightsPath), // Removed as file doesn't exist
      // readFileContent(linksPath), // Removed as file doesn't exist
    ]);

  const readmeContent = readmeResult.content;
  const readmeError = readmeResult.error;
  const techStackContent = techStackResult.content;
  const techStackError = techStackResult.error;
  const {
    dataByDate,
    error: metricsError,
    latestFile: latestMetricsFile,
  } = metricsResult;
  const latestMetricsData =
    latestMetricsFile &&
    dataByDate[extractDateFromFilename(latestMetricsFile) ?? ""]
      ? dataByDate[extractDateFromFilename(latestMetricsFile) ?? ""]
      : [];
  const latestHintContent = hintResult.content;
  const hintError = hintResult.error;
  const latestHintFilename = hintResult.filename;
  // const manualInsightsContent = manualInsightsResult.content; // Removed
  // const manualInsightsError = manualInsightsResult.error; // Removed
  // const linksContent = linksResult.content; // Removed
  // const linksError = linksResult.error; // Removed

  // Process markdown content
  const readmeHtml = readmeContent ? await marked(readmeContent) : "";
  const techStackHtml = techStackContent ? await marked(techStackContent) : "";
  const hintHtml = latestHintContent ? await marked(latestHintContent) : "";
  // const manualInsightsHtml = manualInsightsContent ? await marked(manualInsightsContent) : ""; // Removed
  // const linksHtml = linksContent ? await marked(linksContent) : ""; // Removed

  // Prepare chart data (assuming chart display is commented out in PageContent)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { chartData, ruleIds } = transformDataForChart(dataByDate);
  // const chartLines = ruleIds.map((id) => ({ // Keep commented out if chart is not displayed
  //   id: id,
  //   color: "hsl(0, 0%, 50%)", // Use default color or keep stringToColor commented
  // }));

  return (
    <PageContent
      readmeHtml={readmeHtml}
      readmeError={readmeError}
      techStackHtml={techStackHtml}
      techStackError={techStackError}
      latestMetricsData={latestMetricsData}
      metricsError={metricsError}
      latestMetricsFile={latestMetricsFile}
      // chartData={chartData} // Pass chartData if/when chart is re-enabled
      // chartLines={chartLines} // Pass chartLines if/when chart is re-enabled
      hintHtml={hintHtml}
      hintError={hintError}
      hintFilename={latestHintFilename}
      // manualInsightsHtml={manualInsightsHtml} // Removed
      // manualInsightsError={manualInsightsError} // Removed
      // linksHtml={linksHtml} // Removed
      // linksError={linksError} // Removed
    />
  );
}
