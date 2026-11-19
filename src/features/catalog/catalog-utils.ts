import type { Catalog, MusicCollection, Track } from "./types";

export function tracksForCollection(collection: MusicCollection, tracks: Track[]) {
  return collection.trackIds.flatMap((id) => {
    const track = tracks.find((candidate) => candidate.id === id);
    return track ? [track] : [];
  });
}

export function searchCatalog(query: string, catalog: Catalog) {
  const term = query.trim().toLocaleLowerCase("id-ID");
  return {
    albums: catalog.albums.filter((album) =>
      `${album.title} ${album.description} ${album.mood}`.toLocaleLowerCase("id-ID").includes(term),
    ),
    tracks: catalog.tracks.filter((track) =>
      `${track.title} ${track.artist} ${track.mood}`.toLocaleLowerCase("id-ID").includes(term),
    ),
  };
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const duration = Math.floor(seconds);
  return `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`;
}
