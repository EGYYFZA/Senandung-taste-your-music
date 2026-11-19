"use client";

import { AudioLines, Clock3, Play } from "lucide-react";
import Link from "next/link";
import { Artwork } from "@/components/ui/artwork";
import { SaveTrack } from "@/features/library/save-track";
import { usePlayer } from "@/features/player/player-provider";
import { providerName } from "./audio-tracks";
import { formatDuration } from "./catalog-utils";
import type { MusicCollection, Track } from "./types";

export function TrackList({
  tracks,
  albums = [],
  layout = "list",
}: {
  tracks: Track[];
  albums?: MusicCollection[];
  layout?: "list" | "shelf";
}) {
  const { playTracks, currentTrack, status } = usePlayer();
  return (
    <div className={`track-list${layout === "shelf" ? " track-list--shelf" : ""}`}>
      <div className="track-list-heading" aria-hidden="true">
        <span>#</span>
        <span>JUDUL LAGU</span>
        <span>KOLEKSI / SUMBER</span>
        <span>
          <Clock3 size={15} />
        </span>
      </div>
      <ol>
        {tracks.map((track, index) => {
          const album = albums.find((item) => item.id === track.albumId);
          const active = currentTrack?.id === track.id;
          return (
            <li key={track.id} className={active ? "track-active" : undefined}>
              <span className="track-number" aria-hidden="true">
                {active && status === "playing" ? <AudioLines size={16} /> : index + 1}
              </span>
              <button
                className="track-title"
                type="button"
                aria-label={`Putar ${track.title}`}
                onClick={() => playTracks(tracks, index)}
              >
                <Artwork
                  compact
                  tone={track.tone}
                  title={track.title}
                  imageUrl={track.artworkUrl}
                />
                <span>
                  <strong>{track.title}</strong>
                  <span>
                    {track.artist} · {providerName(track)}
                  </span>
                </span>
                {layout === "shelf" && (
                  <span className="shelf-play" aria-hidden="true">
                    <Play size={22} fill="currentColor" />
                  </span>
                )}
              </button>
              {album ? (
                <Link className="track-album" href={`/album/${album.id}`}>
                  {album.title}
                </Link>
              ) : (
                <span className="track-album">
                  <a href={track.sourceUrl} target="_blank" rel="noreferrer">
                    {providerName(track)}
                  </a>
                  {track.licenseUrl && (
                    <>
                      {" "}
                      ·{" "}
                      <a href={track.licenseUrl} target="_blank" rel="noreferrer">
                        Lisensi
                      </a>
                    </>
                  )}
                </span>
              )}
              <span className="track-duration">
                <span className="sr-only">Durasi </span>
                {formatDuration(track.durationSeconds)}
                {track.provider && <SaveTrack track={track} />}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
