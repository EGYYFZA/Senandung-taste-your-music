"use client";

import { useEffect, useState } from "react";
import { readLibrary, withSavedTrack, writeLibrary } from "./library-storage";
import { BOOKMARK_KEY, parseBookmarks, sharedVideoId, youtubeTrack } from "./youtube-bookmarks";

async function importSong(
  id: string,
  playlistId?: string,
  customTitle?: string,
  signal?: AbortSignal,
) {
  let song = readLibrary(localStorage).tracks?.find((track) => track.youtubeId === id);
  if (!song) {
    const response = await fetch(`/api/music/youtube-info?id=${id}`, { signal });
    if (!response.ok)
      throw new Error(
        response.status === 429
          ? "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi."
          : "Judul lagu belum tersedia. Periksa apakah video bisa dibuka, lalu coba lagi.",
      );
    const info = await response.json();
    song = youtubeTrack(id, customTitle || info?.title, info?.artist) ?? undefined;
    if (!song) throw new Error("Informasi lagu tidak lengkap. Coba lagi.");
  }
  signal?.throwIfAborted();
  writeLibrary(localStorage, withSavedTrack(readLibrary(localStorage), song, playlistId));
  return song.title;
}

export function YoutubeImport({
  playlistId,
  disabled,
}: {
  playlistId?: string;
  disabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <form
      className="personal-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const id = sharedVideoId(String(new FormData(form).get("song") ?? "").trim());
        if (!id)
          return setMessage("Gunakan tautan bagikan satu lagu dari YouTube atau YouTube Music.");
        setBusy(true);
        setMessage("Membaca informasi lagu…");
        try {
          const title = await importSong(id, playlistId);
          form.reset();
          setMessage(`“${title}” tersimpan di ${playlistId ? "playlist" : "koleksi"}.`);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Lagu belum tersimpan.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Tautan lagu YouTube
        <input
          type="url"
          name="song"
          required
          maxLength={2048}
          disabled={disabled || busy}
          placeholder="Tempel tautan bagikan lagu"
        />
      </label>
      <button className="button button--secondary" disabled={disabled || busy} type="submit">
        Tambahkan dari tautan
      </button>
      <span role="status">{message}</span>
    </form>
  );
}

export function LegacyYoutubeImport() {
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  // biome-ignore lint/correctness/useExhaustiveDependencies: A manual retry restarts the pending migration.
  useEffect(() => {
    const controller = new AbortController();
    async function migrate() {
      setError("");
      try {
        const pending = parseBookmarks(localStorage.getItem(BOOKMARK_KEY));
        let failed = 0;
        for (const item of pending) {
          if (controller.signal.aborted) return;
          try {
            await importSong(item.id, undefined, item.title, controller.signal);
          } catch {
            failed++;
            continue;
          }
          if (controller.signal.aborted) return;
          const remaining = parseBookmarks(localStorage.getItem(BOOKMARK_KEY)).filter(
            (entry) => entry.id !== item.id || entry.title !== item.title,
          );
          localStorage.setItem(BOOKMARK_KEY, JSON.stringify(remaining));
        }
        if (failed && !controller.signal.aborted)
          setError(`${failed} lagu lama masih menunggu impor.`);
      } catch {
        if (!controller.signal.aborted) setError("Simpanan lama belum dapat dibaca.");
      }
    }
    void migrate();
    return () => controller.abort();
  }, [attempt]);
  return error ? (
    <p role="status">
      {error}{" "}
      <button
        className="button button--secondary"
        type="button"
        onClick={() => setAttempt((n) => n + 1)}
      >
        Coba impor lagi
      </button>
    </p>
  ) : null;
}
