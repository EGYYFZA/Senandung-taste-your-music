import { record } from "@/features/catalog/audio-tracks";
import { type Chart, parseChart } from "@/features/catalog/indonesia-chart";
import { takeMusicRequest } from "@/features/catalog/request-budget";

const hour = 60 * 60 * 1000;
let cached: { fetchedAt: number; chart: Chart } | undefined;

function fallback() {
  if (cached && Date.now() < cached.fetchedAt + 24 * hour)
    return Response.json(
      { ...cached.chart, stale: true },
      { headers: { "Cache-Control": "no-store" } },
    );
}

export async function GET() {
  if (cached && Date.now() < cached.fetchedAt + hour) return Response.json(cached.chart);
  if (!takeMusicRequest())
    return (
      fallback() ??
      Response.json(
        { error: "Batas permintaan musik tercapai." },
        { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } },
      )
    );
  try {
    const response = await fetch(
      "https://rss.marketingtools.apple.com/api/v2/id/music/most-played/25/songs.json",
      { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) },
    );
    const body: unknown = await response.json();
    if (
      !response.ok ||
      !record(body) ||
      !record(body.feed) ||
      body.feed.country !== "id" ||
      !Array.isArray(body.feed.results)
    )
      throw new Error("Unavailable chart");
    const chart = parseChart({
      updated: body.feed.updated,
      tracks: body.feed.results.filter(record).map((item) => ({
        id: item.id,
        title: item.name,
        artist: item.artistName,
        sourceUrl: item.url,
      })),
    });
    cached = { chart, fetchedAt: Date.now() };
    return Response.json(chart);
  } catch {
    return (
      fallback() ??
      Response.json({ error: "Tangga lagu Indonesia sedang belum tersedia." }, { status: 502 })
    );
  }
}
