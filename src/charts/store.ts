import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export interface ChartAnalysis {
  symbol: string;
  timeframe: string;
  trend: string;
  regime: string;
  keyLevels: Array<{ price: string; label: string; type: "support" | "resistance" | "level" }>;
  thesis: string;
  invalidation: string;
  confidence: string;
  notes: string;
  analyzedAt: string;
}

export interface ChartEntry {
  id: string;
  timestamp: string;
  symbol: string;
  timeframe: string;
  note: string;
  path: string;
  tags: string[];
  contentType?: string;       // "text" | "image/png" | "image/jpeg" etc
  imagePath?: string;         // path to original image file
  markupPath?: string;        // path to sanitized SVG markup overlay
  analysis?: ChartAnalysis;   // structured vision findings
  analysisStatus?: "none" | "analyzing" | "ready" | "failed";
  markupStatus?: "none" | "ready" | "failed" | "sanitized";
}

interface ChartsFile {
  charts: ChartEntry[];
}

export class ChartStore {
  private readonly indexPath: string;

  constructor(private readonly chartsDir: string) {
    mkdirSync(chartsDir, { recursive: true });
    this.indexPath = join(chartsDir, "index.json");
  }

  async load(): Promise<ChartEntry[]> {
    if (!existsSync(this.indexPath)) {
      return [];
    }

    const raw = await Bun.file(this.indexPath).text();
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw) as ChartsFile;
    return parsed.charts ?? [];
  }

  async save(charts: ChartEntry[]) {
    await Bun.write(this.indexPath, JSON.stringify({ charts }, null, 2));
  }

  async append(chart: ChartEntry) {
    const charts = await this.load();
    charts.push(chart);
    await this.save(charts);
  }

  async findByIds(ids: string[]) {
    const charts = await this.load();
    const wanted = new Set(ids);
    return charts.filter((chart) => wanted.has(chart.id));
  }

  async findById(id: string): Promise<ChartEntry | undefined> {
    const charts = await this.load();
    return charts.find((chart) => chart.id === id);
  }

  async update(id: string, patch: Partial<ChartEntry>) {
    const charts = await this.load();
    const idx = charts.findIndex((chart) => chart.id === id);
    if (idx === -1) return null;
    charts[idx] = { ...charts[idx], ...patch };
    await this.save(charts);
    return charts[idx];
  }
}
