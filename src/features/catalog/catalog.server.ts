import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Catalog, MusicCollection, Track } from "./types";

type TrackRow = Omit<Track, "lyricVideo"> & { lyricVideo: number };
type CollectionRow = Omit<MusicCollection, "trackIds" | "artworkUrl"> & {
  artworkUrl: string | null;
};
type ReferenceRow = { playlistId: string; trackId: string };

export function getCatalog(): Catalog {
  let database: DatabaseSync | undefined;
  try {
    database = new DatabaseSync(resolve(process.cwd(), ".data/catalog.sqlite"), {
      readOnly: true,
      timeout: 5000,
    });
    database.exec("BEGIN");
    if (database.prepare("PRAGMA user_version").get()?.user_version !== 1)
      throw new Error("Unsupported catalog schema");
    const rows = database
      .prepare(
        "SELECT id, youtube_id AS youtubeId, title, artist, album_id AS albumId, duration_seconds AS durationSeconds, mood, tone, artwork_url AS artworkUrl, source_url AS sourceUrl, lyric_video AS lyricVideo FROM tracks ORDER BY sort_order, id",
      )
      .all() as unknown as TrackRow[];
    const albumRows = database
      .prepare(
        "SELECT id, title, description, mood, tone, artwork_url AS artworkUrl FROM albums ORDER BY sort_order, id",
      )
      .all() as unknown as CollectionRow[];
    const playlistRows = database
      .prepare(
        "SELECT id, title, description, mood, tone, artwork_url AS artworkUrl FROM playlists ORDER BY sort_order, id",
      )
      .all() as unknown as CollectionRow[];
    const references = database
      .prepare(
        "SELECT playlist_id AS playlistId, track_id AS trackId FROM playlist_tracks ORDER BY playlist_id, position, track_id",
      )
      .all() as unknown as ReferenceRow[];
    const albumReferences = database
      .prepare("SELECT album_id AS albumId, id FROM tracks ORDER BY album_id, album_position, id")
      .all() as { albumId: string; id: string }[];
    database.exec("COMMIT");
    const tracks = rows.map((row) => ({ ...row, lyricVideo: row.lyricVideo === 1 }));
    const albums = albumRows.map(({ artworkUrl, ...row }) => ({
      ...row,
      ...(artworkUrl ? { artworkUrl } : {}),
      trackIds: albumReferences
        .filter((track) => track.albumId === row.id)
        .map((track) => track.id),
    }));
    const playlists = playlistRows.map(({ artworkUrl, ...row }) => ({
      ...row,
      ...(artworkUrl ? { artworkUrl } : {}),
      trackIds: references
        .filter((reference) => reference.playlistId === row.id)
        .map((reference) => reference.trackId),
    }));
    return { tracks, albums, playlists };
  } catch (error) {
    throw new Error("Katalog musik belum tersedia.", { cause: error });
  } finally {
    database?.close();
  }
}
