"use client";

import { Pause, Play } from "lucide-react";
import { usePlayer } from "@/features/player/player-provider";
import type { Track } from "./types";

export function PlayButton({
  tracks,
  label = "Putar",
  compact = false,
  startIndex = 0,
}: {
  tracks: Track[];
  label?: string;
  compact?: boolean;
  startIndex?: number;
}) {
  const player = usePlayer();
  const playing = player.status === "playing" && tracks[startIndex]?.id === player.currentTrack?.id;
  return (
    <button
      type="button"
      className={compact ? "card-arrow" : "button button--primary"}
      disabled={tracks.length === 0}
      aria-label={playing ? `Jeda ${label}` : label}
      onClick={() => (playing ? player.togglePlayback() : player.playTracks(tracks, startIndex))}
    >
      {playing ? (
        <Pause size={21} aria-hidden="true" fill="currentColor" />
      ) : (
        <Play size={21} aria-hidden="true" fill="currentColor" />
      )}
      {!compact && (playing ? "Jeda" : label)}
    </button>
  );
}
