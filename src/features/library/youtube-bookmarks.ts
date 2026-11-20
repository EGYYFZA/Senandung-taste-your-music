import type { Track } from "@/features/catalog/types";

export const BOOKMARK_KEY = "senandung.youtube-bookmarks.v1";
export type Bookmark = { id: string; title: string };
const videoId = /^[\w-]{11}$/;

export function youtubeTrack(id: unknown, title: unknown, artist: unknown): Track | null {
  if (
    typeof id !== "string" ||
    !videoId.test(id) ||
    typeof title !== "string" ||
    !title.trim() ||
    title.length > 500 ||
    typeof artist !== "string" ||
    !artist.trim() ||
    artist.length > 200
  )
    return null;
  return {
    id,
    youtubeId: id,
    title: title.trim(),
    artist: artist.trim(),
    albumId: "",
    mood: "Musik",
    tone: "sage",
    lyricVideo: false,
    durationSeconds: 0,
    artworkUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    sourceUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

export function sharedVideoId(input: string): string | null {
  if (input.length > 2048) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.port || url.username || url.password) return null;
    let id: string | null = null;
    if (url.hostname === "youtu.be") id = url.pathname.slice(1);
    else if (
      ["music.youtube.com", "www.youtube.com", "youtube.com", "m.youtube.com"].includes(
        url.hostname,
      )
    ) {
      if (url.pathname === "/watch" && url.searchParams.getAll("v").length === 1)
        id = url.searchParams.get("v");
      else id = /^\/(?:shorts|live|embed)\/([\w-]{11})\/?$/.exec(url.pathname)?.[1] ?? null;
    }
    return id && videoId.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function parseBookmarks(raw: string | null): Bookmark[] {
  if (raw === null) return [];
  if (raw.length > 120000) throw new Error("Data tautan terlalu besar.");
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || data.length > 200) throw new Error("Daftar tautan tidak valid.");
  const ids = new Set<string>();
  return data.map((entry) => {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !videoId.test(entry.id) ||
      ids.has(entry.id) ||
      typeof entry.title !== "string" ||
      entry.title.length > 120 ||
      /\p{Cc}/u.test(entry.title)
    )
      throw new Error("Tautan tidak valid.");
    ids.add(entry.id);
    return { id: entry.id, title: entry.title };
  });
}
