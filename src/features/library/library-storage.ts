import { parseAudioTrack } from "@/features/catalog/audio-tracks";
import type { Track } from "@/features/catalog/types";
import { youtubeTrack } from "./youtube-bookmarks";
export const LIBRARY_KEY = "senandung.library.v1";
export const LIBRARY_CHANGED = "senandung-library-changed";

export type LocalLibrary = {
  version: 1;
  tracks?: Track[];
  likes: string[];
  playlists: { id: string; name: string; trackIds: string[] }[];
};

export function emptyLibrary(): LocalLibrary {
  return { version: 1, likes: [], playlists: [] };
}

export function withSavedTrack(
  library: LocalLibrary,
  track: Track,
  playlistId?: string,
): LocalLibrary {
  if (playlistId && !library.playlists.some((p) => p.id === playlistId))
    throw new Error("Playlist sudah dihapus. Pilih playlist kembali.");
  const tracks = library.tracks ?? [];
  return {
    ...library,
    tracks: tracks.some((t) => t.id === track.id)
      ? tracks.map((t) => (t.id === track.id ? track : t))
      : [...tracks, track],
    playlists: library.playlists.map((p) =>
      p.id === playlistId && !p.trackIds.includes(track.id)
        ? { ...p, trackIds: [...p.trackIds, track.id] }
        : p,
    ),
  };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function videoIds(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length > 500 ||
    value.some(
      (id) =>
        typeof id !== "string" ||
        !/^(?:[A-Za-z0-9_-]{11}|audius:[a-zA-Z0-9]{1,32}|jamendo:[0-9]{1,20}|yesnowave:yesno[0-9]{3}-[1-9][0-9]?)$/.test(
          id,
        ),
    ) ||
    new Set(value).size !== value.length
  )
    throw new Error("Daftar lagu koleksi tidak valid, duplikat, atau melebihi 500 lagu.");
  return [...value];
}

export function parseLibrary(raw: string | null): LocalLibrary {
  if (raw === null) return emptyLibrary();
  if (raw.length > 500_000 || new TextEncoder().encode(raw).byteLength > 500_000)
    throw new Error("Data koleksi melebihi batas penyimpanan 500 KB.");
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("Data koleksi rusak. Cadangkan data sebelum mengatur ulang koleksi.");
  }
  if (!record(value)) throw new Error("Format data koleksi tidak valid.");
  if (value.version !== 1) throw new Error("Versi data koleksi belum didukung.");
  const likes = videoIds(value.likes);
  if (!Array.isArray(value.playlists) || value.playlists.length > 50)
    throw new Error("Daftar playlist tidak valid atau melebihi 50 playlist.");
  const ids = new Set<string>();
  const names = new Set<string>();
  const playlists = value.playlists.map((playlist) => {
    if (
      !record(playlist) ||
      typeof playlist.id !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
        playlist.id,
      ) ||
      typeof playlist.name !== "string"
    )
      throw new Error("Identitas atau nama playlist tidak valid.");
    const id = playlist.id.toLowerCase();
    const name = playlist.name.trim();
    const normalizedName = name.toLocaleLowerCase("id-ID");
    if (!name || name.length > 80 || /\p{Cc}/u.test(name))
      throw new Error("Nama playlist harus berisi 1–80 karakter yang dapat dibaca.");
    if (ids.has(id) || names.has(normalizedName))
      throw new Error("Identitas atau nama playlist tidak boleh duplikat.");
    ids.add(id);
    names.add(normalizedName);
    return { id, name, trackIds: videoIds(playlist.trackIds) };
  });
  if (value.tracks !== undefined) {
    if (!Array.isArray(value.tracks) || value.tracks.length > 500)
      throw new Error("Maksimal 500 lagu tersimpan.");
    const tracks = value.tracks.map((item: unknown) =>
      record(item) && item.youtubeId !== undefined
        ? item.provider === undefined && item.id === item.youtubeId
          ? youtubeTrack(item.youtubeId, item.title, item.artist)
          : null
        : parseAudioTrack(item),
    );
    if (
      tracks.some((track) => track === null) ||
      new Set(tracks.map((track) => track?.id)).size !== tracks.length
    )
      throw new Error("Metadata lagu tersimpan tidak valid.");
    return { version: 1, likes, playlists, tracks: tracks as Track[] };
  }
  return { version: 1, likes, playlists };
}

export function readLibrary(storage: Pick<Storage, "getItem">): LocalLibrary {
  let raw: string | null;
  try {
    raw = storage.getItem(LIBRARY_KEY);
  } catch (cause) {
    throw new Error("Penyimpanan browser tidak dapat dibaca. Koleksi belum diubah.", { cause });
  }
  return parseLibrary(raw);
}

export function writeLibrary(storage: Pick<Storage, "setItem">, value: LocalLibrary): void {
  let raw: string;
  try {
    raw = JSON.stringify(value);
    if (typeof raw !== "string") throw new Error("Invalid library value");
  } catch (cause) {
    throw new Error("Data koleksi tidak dapat disimpan karena formatnya tidak valid.", { cause });
  }
  const validated = parseLibrary(raw);
  try {
    storage.setItem(LIBRARY_KEY, JSON.stringify(validated));
    if (typeof window !== "undefined") window.dispatchEvent(new Event(LIBRARY_CHANGED));
  } catch (cause) {
    throw new Error(
      "Koleksi gagal disimpan. Penyimpanan browser mungkin penuh atau tidak tersedia.",
      {
        cause,
      },
    );
  }
}
