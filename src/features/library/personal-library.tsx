"use client";

import { useEffect, useState } from "react";
import { Artwork } from "@/components/ui/artwork";
import { libraryTrackId } from "@/features/catalog/audio-tracks";
import { PlayButton } from "@/features/catalog/play-button";
import type { Track } from "@/features/catalog/types";
import {
  emptyLibrary,
  LIBRARY_CHANGED,
  LIBRARY_KEY,
  type LocalLibrary,
  readLibrary,
  writeLibrary,
} from "./library-storage";
import { YoutubeImport } from "./youtube-import";

function SongDetails({ track }: { track: Track }) {
  return (
    <div className="personal-track-name song-details">
      <Artwork compact title={track.title} tone={track.tone} imageUrl={track.artworkUrl} />
      <span>
        <strong>{track.title}</strong>
        <small>{track.artist}</small>
      </span>
    </div>
  );
}

export function PersonalLibrary({ tracks: curatedTracks }: { tracks: Track[] }) {
  const [library, setLibrary] = useState<LocalLibrary>(emptyLibrary);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const load = () => {
      try {
        setLibrary(readLibrary(localStorage));
        setReady(true);
        setError("");
      } catch {
        setReady(false);
        setError(
          "Koleksi browser tidak dapat dibaca. Data lama dipertahankan; periksa penyimpanan browser sebelum melanjutkan.",
        );
      }
    };
    load();
    const changed = (event: StorageEvent) => {
      if (event.key === LIBRARY_KEY || event.key === null) load();
    };
    window.addEventListener("storage", changed);
    window.addEventListener(LIBRARY_CHANGED, load);
    return () => {
      window.removeEventListener("storage", changed);
      window.removeEventListener(LIBRARY_CHANGED, load);
    };
  }, []);

  function update(change: (current: LocalLibrary) => LocalLibrary, message: string) {
    setNotice("");
    try {
      const next = change(readLibrary(localStorage));
      writeLibrary(localStorage, next);
      setLibrary(next);
      setError("");
      setNotice(message);
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Penyimpanan gagal. Koleksi sebelumnya dipertahankan.",
      );
      return false;
    }
  }

  const tracks = [...curatedTracks, ...(library.tracks ?? [])];

  function removeSavedTrack(track: Track) {
    if (
      !window.confirm(`Hapus “${track.title}” dari koleksi, lagu yang disukai, dan semua playlist?`)
    )
      return;
    const id = track.id;
    update(
      (current) => ({
        ...current,
        tracks: current.tracks?.filter((item) => item.id !== id),
        likes: current.likes.filter((item) => item !== id),
        playlists: current.playlists.map((playlist) => ({
          ...playlist,
          trackIds: playlist.trackIds.filter((item) => item !== id),
        })),
      }),
      "Lagu dihapus dari koleksi.",
    );
  }

  function listTracks(ids: string[], remove: (id: string) => void) {
    const queue = ids.flatMap((id) => tracks.find((item) => libraryTrackId(item) === id) ?? []);
    return (
      <ol className="personal-tracks">
        {ids.map((id) => {
          const track = tracks.find((item) => libraryTrackId(item) === id);
          return (
            <li key={id}>
              {track ? (
                <SongDetails track={track} />
              ) : (
                <span className="personal-track-name">{`Lagu belum tersedia di katalog (${id})`}</span>
              )}
              {track && (
                <PlayButton
                  tracks={queue}
                  startIndex={queue.indexOf(track)}
                  label={`Putar ${track.title}`}
                />
              )}
              <button
                className="button button--ghost"
                type="button"
                disabled={!ready}
                aria-label={`Hapus ${track?.title ?? id}`}
                onClick={() => remove(id)}
              >
                Hapus
              </button>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <section className="section-spaced" aria-labelledby="personal-heading">
      <div className="section-heading">
        <h2 id="personal-heading">Koleksi pribadi</h2>
      </div>
      <p className="preview-note">
        Tersimpan hanya di browser ini. Menghapus data browser akan menghapus koleksi; tidak ada
        sinkronisasi akun.
      </p>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <p role="status" className="preview-note">
        {notice || (!ready && !error ? "Membaca koleksi…" : "")}
      </p>
      <form
        id="create-playlist"
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const name = String(new FormData(form).get("name") ?? "").trim();
          if (
            update(
              (current) => ({
                ...current,
                playlists: [...current.playlists, { id: crypto.randomUUID(), name, trackIds: [] }],
              }),
              "Playlist dibuat.",
            )
          )
            form.reset();
        }}
      >
        <label htmlFor="new-playlist-name">Nama playlist baru</label>
        <div>
          <input id="new-playlist-name" name="name" maxLength={80} required disabled={!ready} />
          <button type="submit" className="button button--primary" disabled={!ready}>
            Buat playlist
          </button>
        </div>
      </form>

      <section className="design-panel" aria-labelledby="liked-heading">
        <h3 id="liked-heading">Lagu yang disukai</h3>
        {!library.likes.length && <p className="preview-note">Belum ada lagu yang disukai.</p>}
        {listTracks(library.likes, (id) =>
          update(
            (current) => ({ ...current, likes: current.likes.filter((item) => item !== id) }),
            "Lagu dihapus dari suka.",
          ),
        )}
      </section>
      <section className="design-panel" aria-labelledby="saved-heading">
        <h3 id="saved-heading">Lagu tersimpan</h3>
        <YoutubeImport disabled={!ready} />
        {!tracks.length && (
          <p className="preview-note">
            Cari lagu, lalu tekan + untuk menyimpannya atau menambahkannya ke playlist.
          </p>
        )}
        <ul className="personal-tracks">
          {tracks.map((track) => (
            <li key={libraryTrackId(track)}>
              <SongDetails track={track} />
              <PlayButton tracks={[track]} label={`Putar simpanan ${track.title}`} />
              <button
                type="button"
                className="button button--secondary"
                disabled={!ready}
                aria-label={`${library.likes.includes(libraryTrackId(track)) ? "Batal sukai" : "Sukai"} ${track.title}`}
                aria-pressed={library.likes.includes(libraryTrackId(track))}
                onClick={() =>
                  update(
                    (current) => ({
                      ...current,
                      likes: current.likes.includes(libraryTrackId(track))
                        ? current.likes.filter((id) => id !== libraryTrackId(track))
                        : [...current.likes, libraryTrackId(track)],
                    }),
                    "Lagu yang disukai diperbarui.",
                  )
                }
              >
                {library.likes.includes(libraryTrackId(track)) ? "Disukai" : "Sukai"}
              </button>
              {library.tracks?.some((item) => item.id === track.id) && (
                <button
                  type="button"
                  className="button button--ghost"
                  disabled={!ready}
                  aria-label={`Hapus ${track.title} dari koleksi`}
                  onClick={() => removeSavedTrack(track)}
                >
                  Hapus dari koleksi
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {library.playlists.map((playlist) => (
        <section
          id={`playlist-${playlist.id}`}
          className="design-panel"
          aria-label={`Playlist ${playlist.name}`}
          key={playlist.id}
        >
          <h3>{playlist.name}</h3>
          <YoutubeImport playlistId={playlist.id} disabled={!ready} />
          <PlayButton
            tracks={playlist.trackIds.flatMap(
              (id) => tracks.find((track) => libraryTrackId(track) === id) ?? [],
            )}
            label={`Putar playlist ${playlist.name}`}
          />
          <form
            className="personal-form"
            onSubmit={(event) => {
              event.preventDefault();
              const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
              update(
                (current) => ({
                  ...current,
                  playlists: current.playlists.map((item) =>
                    item.id === playlist.id ? { ...item, name } : item,
                  ),
                }),
                "Nama playlist disimpan.",
              );
            }}
          >
            <label>
              Nama playlist
              <input
                key={playlist.name}
                name="name"
                defaultValue={playlist.name}
                maxLength={80}
                required
                disabled={!ready}
              />
            </label>
            <button className="button button--secondary" disabled={!ready} type="submit">
              Simpan nama
            </button>
          </form>
          <form
            className="personal-form"
            onSubmit={(event) => {
              event.preventDefault();
              const id = String(new FormData(event.currentTarget).get("track") ?? "");
              update(
                (current) => ({
                  ...current,
                  playlists: current.playlists.map((item) =>
                    item.id === playlist.id ? { ...item, trackIds: [...item.trackIds, id] } : item,
                  ),
                }),
                "Lagu ditambahkan.",
              );
            }}
          >
            <label>
              Tambah lagu
              <select name="track" required disabled={!ready}>
                <option value="">Pilih lagu</option>
                {tracks.map((track) => (
                  <option key={libraryTrackId(track)} value={libraryTrackId(track)}>
                    {track.title}
                  </option>
                ))}
              </select>
            </label>
            <button className="button button--secondary" type="submit" disabled={!ready}>
              Tambahkan lagu
            </button>
          </form>
          {!playlist.trackIds.length && <p className="preview-note">Playlist ini masih kosong.</p>}
          {listTracks(playlist.trackIds, (id) =>
            update(
              (current) => ({
                ...current,
                playlists: current.playlists.map((item) =>
                  item.id === playlist.id
                    ? { ...item, trackIds: item.trackIds.filter((trackId) => trackId !== id) }
                    : item,
                ),
              }),
              "Lagu dihapus dari playlist.",
            ),
          )}
          <button
            type="button"
            className="button button--ghost"
            disabled={!ready}
            onClick={() => {
              if (window.confirm(`Hapus playlist “${playlist.name}”?`))
                update(
                  (current) => ({
                    ...current,
                    playlists: current.playlists.filter((item) => item.id !== playlist.id),
                  }),
                  "Playlist dihapus.",
                );
            }}
          >
            Hapus playlist
          </button>
        </section>
      ))}
    </section>
  );
}
