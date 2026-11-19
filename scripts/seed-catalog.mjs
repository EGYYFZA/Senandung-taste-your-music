import { mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const tones = new Set(["sky", "sage", "peach", "lilac"]);
const identifier = /^[A-Za-z0-9_-]{1,64}$/;
const youtubeIdentifier = /^[A-Za-z0-9_-]{11}$/;

function invalid(field) {
  throw new Error(`Manifest katalog tidak valid: ${field}`);
}

function object(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid(field);
  return value;
}

function text(value, maximum, field) {
  if (typeof value !== "string" || !value.trim() || value.length > maximum || /[\u0000-\u001f\u007f]/.test(value)) invalid(field);
  return value.trim();
}

function id(value, field) {
  if (typeof value !== "string" || !identifier.test(value)) invalid(field);
  return value;
}

function list(value, field) {
  if (!Array.isArray(value) || value.length > 1000) invalid(field);
  return value;
}

function unique(values, field) {
  if (new Set(values).size !== values.length) invalid(field);
}

function artwork(value, youtubeIds, field) {
  const url = text(value, 300, field);
  const match = /^https:\/\/i\.ytimg\.com\/vi\/([A-Za-z0-9_-]{11})\/(?:hqdefault|maxresdefault|mqdefault|sddefault|default)\.jpg$/.exec(url);
  if (!match || !youtubeIds.has(match[1])) invalid(field);
  return url;
}

function validateManifest(input) {
  const manifest = object(input, "root");
  if (manifest.version !== 1) invalid("version");
  if (typeof manifest.verifiedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(manifest.verifiedAt)) invalid("verifiedAt");
  const verifiedDate = new Date(manifest.verifiedAt);
  if (!Number.isFinite(verifiedDate.getTime()) || verifiedDate.toISOString().slice(0, 10) !== manifest.verifiedAt) invalid("verifiedAt");
  const tracks = list(manifest.tracks, "tracks").map((value, index) => {
    const item = object(value, `tracks[${index}]`);
    if (typeof item.youtubeId !== "string" || !youtubeIdentifier.test(item.youtubeId)) invalid(`tracks[${index}].youtubeId`);
    if (typeof item.durationSeconds !== "number" || !Number.isFinite(item.durationSeconds) || item.durationSeconds < 0 || item.durationSeconds > 86400) invalid(`tracks[${index}].durationSeconds`);
    if (typeof item.lyricVideo !== "boolean") invalid(`tracks[${index}].lyricVideo`);
    if (!tones.has(item.tone)) invalid(`tracks[${index}].tone`);
    if (item.sourceUrl !== `https://www.youtube.com/watch?v=${item.youtubeId}`) invalid(`tracks[${index}].sourceUrl`);
    return {
      id: id(item.id, `tracks[${index}].id`),
      youtubeId: item.youtubeId,
      title: text(item.title, 300, `tracks[${index}].title`),
      artist: text(item.artist, 200, `tracks[${index}].artist`),
      albumId: id(item.albumId, `tracks[${index}].albumId`),
      durationSeconds: item.durationSeconds,
      mood: text(item.mood, 60, `tracks[${index}].mood`),
      tone: item.tone,
      artworkUrl: artwork(item.artworkUrl, new Set([item.youtubeId]), `tracks[${index}].artworkUrl`),
      sourceUrl: item.sourceUrl,
      lyricVideo: item.lyricVideo,
    };
  });
  unique(tracks.map((track) => track.id), "tracks.id");
  unique(tracks.map((track) => track.youtubeId), "tracks.youtubeId");
  const trackIds = new Set(tracks.map((track) => track.id));
  const youtubeIds = new Set(tracks.map((track) => track.youtubeId));
  function collections(value, field) {
    const result = list(value, field).map((entry, index) => {
      const item = object(entry, `${field}[${index}]`);
      if (!tones.has(item.tone)) invalid(`${field}[${index}].tone`);
      const references = list(item.trackIds, `${field}[${index}].trackIds`);
      if (references.some((reference) => typeof reference !== "string" || !trackIds.has(reference))) invalid(`${field}[${index}].trackIds`);
      unique(references, `${field}[${index}].trackIds`);
      return {
        id: id(item.id, `${field}[${index}].id`),
        title: text(item.title, 300, `${field}[${index}].title`),
        description: text(item.description, 1000, `${field}[${index}].description`),
        mood: text(item.mood, 60, `${field}[${index}].mood`),
        tone: item.tone,
        trackIds: references,
        artworkUrl: item.artworkUrl === undefined ? null : artwork(item.artworkUrl, youtubeIds, `${field}[${index}].artworkUrl`),
      };
    });
    unique(result.map((collection) => collection.id), `${field}.id`);
    return result;
  }
  const albums = collections(manifest.albums, "albums");
  const playlists = collections(manifest.playlists, "playlists");
  for (const track of tracks) {
    const album = albums.find((candidate) => candidate.id === track.albumId);
    if (!album?.trackIds.includes(track.id)) invalid("tracks.albumId");
  }
  for (const album of albums) {
    if (album.trackIds.some((reference) => tracks.find((track) => track.id === reference)?.albumId !== album.id)) invalid("albums.trackIds");
  }
  return { tracks, albums, playlists, verifiedAt: manifest.verifiedAt };
}

export function seedCatalog({ databasePath = resolve(root, ".data/catalog.sqlite"), manifestPath = resolve(root, "data/catalog.json") } = {}) {
  if (statSync(manifestPath).size > 4 * 1024 * 1024) invalid("file size");
  const manifest = validateManifest(JSON.parse(readFileSync(manifestPath, "utf8")));
  const schema = readFileSync(resolve(root, "db/schema.sql"), "utf8");
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath, { enableForeignKeyConstraints: true, timeout: 5000 });
  try {
    database.exec("BEGIN IMMEDIATE");
    const version = database.prepare("PRAGMA user_version").get().user_version;
    if (version !== 0 && version !== 1) throw new Error("Versi database katalog tidak didukung.");
    database.exec(schema);
    // The manifest owns these generated tables; personal collections live separately in localStorage.
    database.exec("DELETE FROM playlist_tracks; DELETE FROM tracks; DELETE FROM playlists; DELETE FROM albums;");
    for (const table of ["albums", "playlists"]) {
      const insert = database.prepare(`INSERT INTO ${table} (id, title, description, mood, tone, artwork_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, mood=excluded.mood, tone=excluded.tone, artwork_url=excluded.artwork_url, sort_order=excluded.sort_order`);
      manifest[table].forEach((collection, index) => insert.run(collection.id, collection.title, collection.description, collection.mood, collection.tone, collection.artworkUrl, index));
    }
    const insertTrack = database.prepare("INSERT INTO tracks (id, youtube_id, title, artist, album_id, album_position, duration_seconds, mood, tone, artwork_url, source_url, lyric_video, verified_at, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET youtube_id=excluded.youtube_id, title=excluded.title, artist=excluded.artist, album_id=excluded.album_id, album_position=excluded.album_position, duration_seconds=excluded.duration_seconds, mood=excluded.mood, tone=excluded.tone, artwork_url=excluded.artwork_url, source_url=excluded.source_url, lyric_video=excluded.lyric_video, verified_at=excluded.verified_at, sort_order=excluded.sort_order");
    manifest.tracks.forEach((track, index) => {
      const position = manifest.albums.find((album) => album.id === track.albumId).trackIds.indexOf(track.id);
      insertTrack.run(track.id, track.youtubeId, track.title, track.artist, track.albumId, position, track.durationSeconds, track.mood, track.tone, track.artworkUrl, track.sourceUrl, Number(track.lyricVideo), manifest.verifiedAt, index);
    });
    const insertReference = database.prepare("INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES (?, ?, ?) ON CONFLICT(playlist_id, track_id) DO UPDATE SET position=excluded.position");
    for (const playlist of manifest.playlists) playlist.trackIds.forEach((trackId, position) => insertReference.run(playlist.id, trackId, position));
    database.exec("PRAGMA user_version = 1; COMMIT");
    return { tracks: manifest.tracks.length, albums: manifest.albums.length, playlists: manifest.playlists.length };
  } catch (error) {
    if (database.isTransaction) database.exec("ROLLBACK");
    throw error;
  } finally {
    database.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = seedCatalog();
  console.log(`Katalog SQLite siap: ${result.tracks} video, ${result.albums} album, ${result.playlists} playlist.`);
}
