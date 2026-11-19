"use client";

import {
  AudioLines,
  ExternalLink,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePlayer } from "./player-provider";
import { playbackTime } from "./queue";

export function PlayerBar() {
  const {
    currentTrack,
    status,
    error,
    currentTime,
    duration,
    volume,
    muted,
    queue,
    queueIndex,
    canGoNext,
    shuffle,
    repeat,
    queueOpen,
    playTracks,
    togglePlayback,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setQueueOpen,
  } = usePlayer();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const hasTrack = currentTrack !== null;

  useEffect(() => {
    const panel = dialog.current;
    if (!panel || !queueOpen) return;
    const restoreFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Non-modal presentation keeps the YouTube video visible and interactive.
    panel.show();
    closeButton.current?.focus();
    return () => {
      panel.close();
      restoreFocus?.focus({ preventScroll: true });
    };
  }, [queueOpen]);

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
  return (
    <>
      <aside className="player-bar" aria-label="Pemutar musik">
        <div className="player-track">
          <span className="player-art">
            {currentTrack?.artworkUrl ? (
              <Image
                unoptimized
                src={currentTrack.artworkUrl}
                width={48}
                height={48}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <AudioLines size={25} aria-hidden="true" />
            )}
          </span>
          <div>
            <strong>{currentTrack?.title ?? "Pilih musik untuk memulai"}</strong>
            <p>{currentTrack?.artist ?? "Cari lagu atau buka koleksimu."}</p>
            {error && (
              <span className="player-error-label">Pemutaran bermasalah. Coba putar lagi.</span>
            )}
          </div>
          {currentTrack && (
            <a
              className="control-button player-source"
              href={currentTrack.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Buka sumber lagu"
            >
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="player-controls">
          <div className="playback-buttons">
            <button
              type="button"
              className={`control-button shuffle-control${shuffle ? " is-active" : ""}`}
              onClick={toggleShuffle}
              disabled={!hasTrack}
              aria-label="Acak antrean"
              aria-pressed={shuffle}
            >
              <Shuffle size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="control-button"
              disabled={!hasTrack}
              onClick={previous}
              aria-label="Lagu sebelumnya"
            >
              <SkipBack size={19} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="player-play"
              disabled={!hasTrack}
              onClick={togglePlayback}
              aria-label={
                status === "playing" ? "Jeda" : status === "error" ? "Coba putar lagi" : "Putar"
              }
              aria-busy={status === "loading"}
            >
              {status === "playing" ? (
                <Pause size={19} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play size={19} fill="currentColor" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="control-button"
              disabled={!canGoNext}
              onClick={next}
              aria-label="Lagu berikutnya"
            >
              <SkipForward size={19} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`control-button repeat-control${repeat !== "off" ? " is-active" : ""}`}
              onClick={cycleRepeat}
              disabled={!hasTrack}
              aria-label={`Ulang: ${repeat === "off" ? "nonaktif" : repeat === "all" ? "semua lagu" : "satu lagu"}`}
              aria-pressed={repeat !== "off"}
            >
              <RepeatIcon size={17} aria-hidden="true" />
            </button>
          </div>
          <div className="player-progress">
            <span>{playbackTime(currentTime)}</span>
            <input
              className="player-seek"
              aria-label="Posisi pemutaran"
              aria-valuetext={`${playbackTime(currentTime)} dari ${playbackTime(duration)}`}
              type="range"
              min={0}
              max={Math.max(1, duration)}
              step={1}
              value={Math.min(currentTime, Math.max(1, duration))}
              onChange={(event) => seek(Number(event.target.value))}
              disabled={!hasTrack || duration <= 0}
            />
            <span>{playbackTime(duration)}</span>
          </div>
        </div>
        <div className="player-extras">
          <button
            type="button"
            className={`control-button${queueOpen ? " is-active" : ""}`}
            onClick={() => setQueueOpen(!queueOpen)}
            aria-label="Buka antrean"
            aria-haspopup="dialog"
            aria-expanded={queueOpen}
            aria-controls="player-queue"
          >
            <ListMusic size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="control-button"
            disabled={!hasTrack}
            onClick={toggleMute}
            aria-label={muted ? "Aktifkan suara" : "Bisukan suara"}
            aria-pressed={muted}
          >
            {muted ? (
              <VolumeX size={19} aria-hidden="true" />
            ) : (
              <Volume2 size={19} aria-hidden="true" />
            )}
          </button>
          <input
            className="player-volume"
            aria-label="Volume"
            aria-valuetext={`${Math.round(volume * 100)} persen`}
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            disabled={!hasTrack}
          />
        </div>
      </aside>
      <dialog
        id="player-queue"
        ref={dialog}
        className="queue-panel"
        aria-labelledby="queue-title"
        onClose={() => setQueueOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setQueueOpen(false);
          }
        }}
      >
        <div className="queue-heading">
          <h2 id="queue-title">Antrean musik</h2>
          <button
            type="button"
            ref={closeButton}
            className="queue-close control-button"
            onClick={() => setQueueOpen(false)}
            aria-label="Tutup antrean"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {queue.length ? (
          <ol className="queue-list">
            {queue.map((track, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Repeated tracks are separate queue occurrences identified by position.
              <li key={`${track.id}-${index}`}>
                <button
                  type="button"
                  onClick={() => playTracks(queue, index)}
                  aria-current={index === queueIndex ? "true" : undefined}
                >
                  <span>{index + 1}</span>
                  <span>
                    <strong>{track.title}</strong>
                    <small>{track.artist}</small>
                  </span>
                  <span>{playbackTime(track.durationSeconds)}</span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p>Pilih lagu atau playlist untuk mengisi antrean.</p>
        )}
      </dialog>
    </>
  );
}
