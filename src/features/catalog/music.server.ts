import {
  type AudioProvider,
  parseAudioTrack,
  publicHttps,
  record,
  validProviderId,
} from "./audio-tracks";
import { takeMusicRequest } from "./request-budget";
import type { Track } from "./types";

const LIMIT = 20;
export type MusicResult = {
  tracks: Track[];
  more: AudioProvider[];
  failed: AudioProvider[];
  messages: string[];
};
const cache = new Map<string, { until: number; result: MusicResult }>();

export function activeProviders(): AudioProvider[] {
  return process.env.JAMENDO_CLIENT_ID?.trim() ? ["audius", "jamendo"] : ["audius"];
}

async function request(url: URL) {
  if (!takeMusicRequest())
    throw new Error("Batas permintaan musik tercapai. Coba lagi dalam satu menit.");
  const response = await fetch(url, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  }).catch(() => {
    throw new Error("Koneksi layanan musik belum tersedia. Coba lagi.");
  });
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "Layanan sedang membatasi permintaan. Coba lagi nanti."
        : "Layanan musik belum merespons. Coba lagi.",
    );
  const value: unknown = await response.json().catch(() => {
    throw new Error("Respons layanan musik tidak valid.");
  });
  if (!record(value)) throw new Error("Respons layanan musik tidak valid.");
  return value;
}

export function parseProviderTracks(
  provider: AudioProvider,
  value: Record<string, unknown>,
): { tracks: Track[]; count: number } {
  if (provider === "jamendo" && (!record(value.headers) || value.headers.status !== "success"))
    throw new Error("Akses Jamendo belum tersedia. Periksa client_id aplikasi.");
  const rows = provider === "audius" ? value.data : value.results;
  if (!Array.isArray(rows)) throw new Error("Respons katalog tidak valid.");
  const tracks: Track[] = [];
  for (const row of rows.slice(0, LIMIT)) {
    if (!record(row)) continue;
    if (
      provider === "audius" &&
      (row.is_streamable !== true ||
        row.is_stream_gated !== false ||
        row.is_available === false ||
        row.is_delete === true)
    )
      continue;
    if (provider === "jamendo" && !publicHttps(row.audio)) continue;
    const track = parseAudioTrack({
      id: `${provider}:${row.id}`,
      provider,
      providerId: row.id,
      title: provider === "audius" ? row.title : row.name,
      artist: provider === "audius" && record(row.user) ? row.user.name : row.artist_name,
      durationSeconds: row.duration,
      artworkUrl:
        provider === "audius"
          ? record(row.artwork)
            ? (row.artwork["480x480"] ?? "")
            : ""
          : (row.image ?? ""),
      sourceUrl:
        provider === "audius" &&
        typeof row.permalink === "string" &&
        row.permalink.startsWith("/") &&
        !row.permalink.startsWith("//")
          ? `https://audius.co${row.permalink}`
          : provider === "jamendo"
            ? row.shareurl
            : "",
      ...(provider === "jamendo" ? { licenseUrl: row.license_ccurl } : {}),
    });
    if (track && !tracks.some((item) => item.id === track.id)) tracks.push(track);
  }
  return { tracks, count: rows.length };
}

function providerUrl(provider: AudioProvider, id?: string) {
  if (provider === "audius") return new URL(`https://api.audius.co/v1/tracks${id ? `/${id}` : ""}`);
  const key = process.env.JAMENDO_CLIENT_ID?.trim();
  if (!key) throw new Error("Jamendo belum diaktifkan. Audius tetap tersedia.");
  const url = new URL("https://api.jamendo.com/v3.0/tracks/");
  url.search = new URLSearchParams({
    client_id: key,
    format: "json",
    type: "all",
    audioformat: "mp32",
    ...(id ? { id } : {}),
  }).toString();
  return url;
}

export async function searchMusic(
  query: string,
  providers: AudioProvider[],
  offset = 0,
): Promise<MusicResult> {
  if (
    query.length > 100 ||
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset > 1000000 ||
    !providers.length ||
    providers.some((p) => p !== "audius" && p !== "jamendo")
  )
    throw new Error("Parameter pencarian tidak valid.");
  const key = JSON.stringify([
    query.toLowerCase(),
    providers,
    offset,
    Boolean(process.env.JAMENDO_CLIENT_ID),
  ]);
  const stored = cache.get(key);
  if (stored && stored.until > Date.now()) return stored.result;
  const results = await Promise.all(
    providers.map(async (provider) => {
      try {
        const url = providerUrl(provider);
        if (provider === "audius") url.pathname += query ? "/search" : "/trending";
        url.searchParams.set("limit", String(LIMIT));
        url.searchParams.set("offset", String(offset));
        if (query) url.searchParams.set(provider === "audius" ? "query" : "search", query);
        else if (provider === "jamendo") url.searchParams.set("order", "popularity_total");
        const result = parseProviderTracks(provider, await request(url));
        return { ...result, provider };
      } catch (error) {
        return {
          tracks: [] as Track[],
          count: 0,
          provider,
          error: `${provider === "audius" ? "Audius" : "Jamendo"}: ${error instanceof Error ? error.message : "Layanan belum tersedia."}`,
        };
      }
    }),
  );
  // Interleave provider rankings without pretending their relevance scores are comparable.
  const tracks = Array.from({ length: LIMIT }, (_, i) =>
    results.flatMap((r) => (r.tracks[i] ? [r.tracks[i]] : [])),
  ).flat();
  const result = {
    tracks,
    failed: results.filter((r) => r.error).map((r) => r.provider),
    // Audius may omit unavailable entries before returning a partially filled page.
    more: results
      .filter((r) => (r.provider === "audius" ? r.count > 0 : r.count >= LIMIT))
      .map((r) => r.provider),
    messages: results.flatMap((r) => (r.error ? [r.error] : [])),
  };
  if (!result.failed.length) {
    if (cache.size >= 64) cache.delete(cache.keys().next().value ?? "");
    cache.set(key, { result, until: Date.now() + 120000 });
  }
  return result;
}

export async function resolveStream(provider: AudioProvider, id: string) {
  if (!validProviderId(provider, id)) throw new Error("Identitas lagu tidak valid.");
  const data = await request(providerUrl(provider, id));
  if (provider === "audius" && record(data.data)) data.data = [data.data];
  const rows = provider === "audius" ? data.data : data.results;
  if (
    !Array.isArray(rows) ||
    !parseProviderTracks(provider, data).tracks.some((track) => track.providerId === id)
  )
    throw new Error("Lagu tidak tersedia untuk streaming.");
  const row = rows.find((item: unknown) => record(item) && item.id === id);
  const url = record(row)
    ? publicHttps(provider === "audius" && record(row.stream) ? row.stream.url : row.audio)
    : null;
  if (!url) throw new Error("Alamat audio belum tersedia.");
  return url;
}
