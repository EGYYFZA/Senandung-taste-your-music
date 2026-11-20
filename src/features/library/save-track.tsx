"use client";
import { CirclePlus } from "lucide-react";
import { useRef, useState } from "react";
import type { Track } from "@/features/catalog/types";
import { emptyLibrary, readLibrary, withSavedTrack, writeLibrary } from "./library-storage";

export function SaveTrack({ track }: { track: Track }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [library, setLibrary] = useState(emptyLibrary);
  const [target, setTarget] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className="control-button"
        aria-label={`Simpan ${track.title} ke koleksi`}
        onClick={() => {
          setNotice("");
          setError("");
          setTarget("");
          try {
            setLibrary(readLibrary(localStorage));
            dialog.current?.showModal();
          } catch {
            setNotice("Koleksi tidak dapat dibaca. Data sebelumnya dipertahankan.");
          }
        }}
      >
        <CirclePlus size={20} aria-hidden="true" />
      </button>
      {notice && (
        <span className="save-notice" role="status">
          {notice}
        </span>
      )}
      <dialog className="save-dialog" ref={dialog} aria-label={`Simpan ${track.title}`}>
        <h2>Tambahkan ke koleksi</h2>
        <p>{track.title}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
            try {
              const current = readLibrary(localStorage);
              let playlistId = target;
              if (target === "new") {
                playlistId = crypto.randomUUID();
                current.playlists.push({ id: playlistId, name, trackIds: [] });
              }
              writeLibrary(localStorage, withSavedTrack(current, track, playlistId));
              setNotice(target ? "Ditambahkan ke playlist" : "Tersimpan di Koleksi");
              dialog.current?.close();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Lagu belum tersimpan.");
            }
          }}
        >
          <label>
            Tujuan penyimpanan
            <select value={target} onChange={(event) => setTarget(event.target.value)}>
              <option value="">Koleksi saya</option>
              {library.playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </option>
              ))}
              <option value="new">+ Buat playlist baru</option>
            </select>
          </label>
          {target === "new" && (
            <label>
              Nama playlist baru
              <input name="name" required maxLength={80} />
            </label>
          )}
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <div className="design-row">
            <button type="submit" className="button button--primary">
              Simpan
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => dialog.current?.close()}
            >
              Batal
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
