import { publicHttps, record } from "./audio-tracks";

export type Chart = {
  updated: string;
  stale: boolean;
  tracks: { id: string; title: string; artist: string; sourceUrl: string }[];
};
export function parseChart(value: unknown): Chart {
  if (
    !record(value) ||
    typeof value.updated !== "string" ||
    !Number.isFinite(Date.parse(value.updated)) ||
    !Array.isArray(value.tracks)
  )
    throw new Error("Chart tidak valid.");
  const tracks: Chart["tracks"] = [];
  for (const item of value.tracks.slice(0, 25)) {
    if (
      !record(item) ||
      typeof item.id !== "string" ||
      !/^\d{1,20}$/.test(item.id) ||
      typeof item.title !== "string" ||
      !item.title.trim() ||
      item.title.length > 300 ||
      typeof item.artist !== "string" ||
      !item.artist.trim() ||
      item.artist.length > 200
    )
      continue;
    const sourceUrl = publicHttps(item.sourceUrl);
    if (
      !sourceUrl ||
      new URL(sourceUrl).hostname !== "music.apple.com" ||
      tracks.some((t) => t.id === item.id)
    )
      continue;
    tracks.push({ id: item.id, title: item.title, artist: item.artist, sourceUrl });
  }
  if (!tracks.length) throw new Error("Chart kosong.");
  return { updated: new Date(value.updated).toISOString(), stale: value.stale === true, tracks };
}
