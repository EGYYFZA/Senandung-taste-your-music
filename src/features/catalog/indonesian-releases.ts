import releases from "../../../data/indonesian-releases.json";
import type { Track } from "./types";

const entries = releases.flatMap((release) =>
  release.tracks.map((row) => {
    const number = Number.parseInt(row.file, 10);
    const providerId = `${release.code}-${number}`;
    const track: Track = {
      id: `yesnowave:${providerId}`,
      provider: "yesnowave",
      providerId,
      artist: release.artist,
      title: row.title,
      durationSeconds: row.seconds,
      albumId: "",
      mood: release.album,
      tone: "sage",
      lyricVideo: false,
      sourceUrl: `https://yesnowave.com/releases/${release.code}/`,
      artworkUrl: release.cover,
      licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/",
    };
    return {
      track,
      audio: `https://archive.org/download/${release.code}/${encodeURIComponent(row.file)}`,
    };
  }),
);

export function searchIndonesianTracks(query: string) {
  const words = query.trim().toLocaleLowerCase("id").split(/\s+/);
  return entries
    .map(({ track }) => track)
    .filter((t) =>
      words.every((w) => [t.artist, t.title, t.mood].join(" ").toLocaleLowerCase("id").includes(w)),
    );
}
export function labelStream(id: string) {
  return entries.find(({ track }) => track.providerId === id)?.audio;
}
