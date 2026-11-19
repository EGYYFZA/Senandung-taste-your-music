"use client";
import { ListMusic } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { emptyLibrary, LIBRARY_CHANGED, LIBRARY_KEY, readLibrary } from "./library-storage";

export function LibrarySidebar() {
  const [library, setLibrary] = useState(emptyLibrary);
  const [error, setError] = useState(false);
  useEffect(() => {
    const load = () => {
      try {
        setLibrary(readLibrary(localStorage));
        setError(false);
      } catch {
        setError(true);
      }
    };
    const changed = (event: StorageEvent) => {
      if (event.key === LIBRARY_KEY || event.key === null) load();
    };
    load();
    window.addEventListener("storage", changed);
    window.addEventListener(LIBRARY_CHANGED, load);
    return () => {
      window.removeEventListener("storage", changed);
      window.removeEventListener(LIBRARY_CHANGED, load);
    };
  }, []);
  return (
    <>
      <Link className="button button--secondary" href="/library#create-playlist">
        + Buat playlist
      </Link>
      <p className="nav-caption">PLAYLIST KAMU</p>
      {error ? (
        <p className="preview-note">Koleksi belum dapat dibaca.</p>
      ) : library.playlists.length ? (
        library.playlists.map((playlist) => (
          <Link
            className="sidebar-playlist"
            key={playlist.id}
            href={`/library#playlist-${playlist.id}`}
          >
            <span className="playlist-icon" aria-hidden="true">
              <ListMusic size={24} />
            </span>
            <span>
              {playlist.name}
              <small>{playlist.trackIds.length} lagu</small>
            </span>
          </Link>
        ))
      ) : (
        <p className="preview-note">Playlist buatanmu akan tampil di sini.</p>
      )}
    </>
  );
}
