"use client";

import { ExternalLink, RotateCcw } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer, type YouTubeProps } from "react-youtube";
import { parseAudioTrack } from "@/features/catalog/audio-tracks";
import type { Track } from "@/features/catalog/types";
import { nextQueueIndex, previousQueueIndex, type RepeatMode, youtubeErrorMessage } from "./queue";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

type PlayerContextValue = {
  currentTrack: Track | null;
  status: PlayerStatus;
  error: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  queue: Track[];
  queueIndex: number;
  canGoNext: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  queueOpen: boolean;
  playTracks: (tracks: Track[], startIndex?: number) => void;
  togglePlayback: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setQueueOpen: (open: boolean) => void;
  retryPlayback: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used inside PlayerProvider");
  return context;
}

async function matchesVideo(player: YouTubePlayer, expectedId: string, allowUnknown = false) {
  const url = await player.getVideoUrl();
  try {
    const id = new URL(url).searchParams.get("v");
    return id ? id === expectedId : allowUnknown;
  } catch {
    return allowUnknown;
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, updateVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [queueOpen, setQueueOpen] = useState(false);
  const [embedAttempt, setEmbedAttempt] = useState(0);
  const player = useRef<YouTubePlayer | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const selection = useRef({ queue: [] as Track[], index: 0, videoId: "", generation: 0 });
  const preferences = useRef({
    volume: 0.7,
    muted: false,
    shuffle: false,
    repeat: "off" as RepeatMode,
  });
  const history = useRef<number[]>([]);
  const time = useRef(0);
  const currentTrack = queue[queueIndex] ?? null;
  const canGoNext = nextQueueIndex(queue.length, queueIndex, repeat, shuffle, false, 0) !== null;
  const opts = useMemo<YouTubeProps["opts"]>(
    () => ({
      width: "100%",
      height: "260",
      host: "https://www.youtube-nocookie.com",
      playerVars: {
        autoplay: 1,
        controls: 1,
        cc_load_policy: 1,
        playsinline: 1,
        origin: typeof window === "undefined" ? undefined : window.location.origin,
      },
    }),
    [],
  );

  const fail = useCallback((message: string) => {
    setError(message);
    setStatus("error");
  }, []);
  const attachAudio = useCallback(
    (element: HTMLAudioElement | null) => {
      audio.current = element;
      if (!element) return;
      element.volume = preferences.current.volume;
      element.muted = preferences.current.muted;
      const generation = selection.current.generation;
      void element.play().catch((cause: unknown) => {
        if (audio.current !== element || generation !== selection.current.generation) return;
        fail(
          cause instanceof DOMException && cause.name === "NotAllowedError"
            ? "Browser membatasi pemutaran otomatis. Tekan Putar untuk mencoba lagi."
            : "Audio belum bisa diputar. Coba lagi atau pilih lagu lain.",
        );
      });
      return () => {
        element.pause();
        if (audio.current === element) audio.current = null;
      };
    },
    [fail],
  );
  const command = useCallback((action: (target: YouTubePlayer) => unknown) => {
    const target = player.current;
    if (!target) return;
    const generation = selection.current.generation;
    Promise.resolve()
      .then(() => {
        if (generation === selection.current.generation) return action(target);
      })
      .catch(() => {
        if (generation === selection.current.generation)
          setError("Kontrol YouTube belum merespons. Coba lagi atau gunakan kontrol pada video.");
      });
  }, []);

  const selectIndex = useCallback(
    (index: number, recordHistory = true) => {
      const track = selection.current.queue[index];
      if (!track) return;
      const previousId = selection.current.videoId;
      if (recordHistory && preferences.current.shuffle && selection.current.index !== index)
        history.current.push(selection.current.index);
      selection.current = {
        ...selection.current,
        index,
        videoId: track.youtubeId ?? "",
        generation: selection.current.generation + 1,
      };
      setQueueIndex(index);
      setCurrentTime(0);
      time.current = 0;
      setDuration(track.durationSeconds);
      setError(null);
      setStatus("loading");
      if (track.provider) {
        player.current = null;
        setEmbedAttempt((attempt) => attempt + 1);
        return;
      }
      if (!navigator.onLine) {
        fail("Koneksi internet terputus. Sambungkan kembali lalu coba lagi.");
        return;
      }
      if (previousId === track.youtubeId)
        command(async (target) => {
          await target.seekTo(0, true);
          await target.playVideo();
        });
    },
    [command, fail],
  );

  const playTracks = useCallback(
    (tracks: Track[], startIndex = 0) => {
      if (!tracks.length) return;
      if (
        !tracks.every((track) =>
          track.provider
            ? parseAudioTrack(track) !== null
            : /^[\w-]{11}$/.test(track.youtubeId ?? ""),
        ) ||
        !Number.isInteger(startIndex) ||
        startIndex < 0 ||
        startIndex >= tracks.length
      ) {
        setError("Pilihan lagu tidak valid. Pilih lagu lain dari katalog.");
        return;
      }
      const nextQueue = [...tracks];
      selection.current.queue = nextQueue;
      history.current = [];
      setQueue(nextQueue);
      selectIndex(startIndex, false);
    },
    [selectIndex],
  );

  const advance = useCallback(
    (ended: boolean) => {
      const active = selection.current;
      const nextIndex = nextQueueIndex(
        active.queue.length,
        active.index,
        preferences.current.repeat,
        preferences.current.shuffle,
        ended,
      );
      if (nextIndex !== null) selectIndex(nextIndex);
      else if (ended) setStatus("paused");
    },
    [selectIndex],
  );

  const next = useCallback(() => advance(false), [advance]);
  const seek = useCallback(
    (seconds: number) => {
      if (!Number.isFinite(seconds) || duration <= 0) return;
      const value = Math.min(duration, Math.max(0, seconds));
      if (audio.current) audio.current.currentTime = value;
      command((target) => target.seekTo(value, true));
      time.current = value;
      setCurrentTime(value);
    },
    [command, duration],
  );

  const previous = useCallback(() => {
    if (time.current > 3) {
      seek(0);
      return;
    }
    const active = selection.current;
    const previousIndex =
      preferences.current.shuffle && history.current.length
        ? (history.current.pop() ?? null)
        : previousQueueIndex(active.queue.length, active.index, preferences.current.repeat);
    if (previousIndex !== null) selectIndex(previousIndex, false);
    else seek(0);
  }, [seek, selectIndex]);

  const retryPlayback = useCallback(() => {
    const active = selection.current;
    if (active.queue[active.index]?.provider) {
      selectIndex(active.index, false);
      return;
    }
    if (!active.videoId) return;
    active.generation += 1;
    setError(null);
    setStatus("loading");
    if (!player.current) {
      setEmbedAttempt((attempt) => attempt + 1);
      return;
    }
    command((target) => target.loadVideoById(active.videoId));
  }, [command, selectIndex]);

  const togglePlayback = useCallback(() => {
    if (status === "error") {
      retryPlayback();
      return;
    }
    if (audio.current) {
      const target = audio.current;
      const generation = selection.current.generation;
      if (status === "playing") target.pause();
      else
        void target.play().catch(() => {
          if (generation === selection.current.generation)
            fail("Browser belum mengizinkan audio. Tekan Putar untuk mencoba lagi.");
        });
      return;
    }
    command((target) => (status === "playing" ? target.pauseVideo() : target.playVideo()));
  }, [command, retryPlayback, status, fail]);

  const setVolume = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) return;
      const nextVolume = Math.min(1, Math.max(0, value));
      preferences.current.volume = nextVolume;
      updateVolume(nextVolume);
      if (audio.current) audio.current.volume = nextVolume;
      command((target) => target.setVolume(Math.round(nextVolume * 100)));
    },
    [command],
  );

  const toggleMute = useCallback(() => {
    const value = !preferences.current.muted;
    preferences.current.muted = value;
    setMuted(value);
    if (audio.current) audio.current.muted = value;
    command((target) => (value ? target.mute() : target.unMute()));
  }, [command]);

  const toggleShuffle = useCallback(() => {
    preferences.current.shuffle = !preferences.current.shuffle;
    history.current = [];
    setShuffle(preferences.current.shuffle);
  }, []);

  const cycleRepeat = useCallback(() => {
    const value =
      preferences.current.repeat === "off"
        ? "all"
        : preferences.current.repeat === "all"
          ? "one"
          : "off";
    preferences.current.repeat = value;
    setRepeat(value);
  }, []);

  const onReady = useCallback(
    (event: YouTubeEvent<unknown>) => {
      player.current = event.target;
      if (window.matchMedia("(max-width: 1279px) and (max-height: 720px)").matches)
        document.querySelector(".youtube-panel")?.scrollIntoView({ block: "start" });
      command(async (target) => {
        await target.setVolume(Math.round(preferences.current.volume * 100));
        if (preferences.current.muted) await target.mute();
        await target.playVideo();
      });
    },
    [command],
  );

  const onStateChange = useCallback(
    (event: YouTubeEvent<number>) => {
      const expected = selection.current.videoId;
      const generation = selection.current.generation;
      void matchesVideo(event.target, expected)
        .then((matches) => {
          if (!matches || generation !== selection.current.generation) return;
          if (event.data === 1) {
            setStatus("playing");
            setError(null);
          } else if (event.data === 2 || event.data === 5 || event.data === -1) setStatus("paused");
          else if (event.data === 3) setStatus("loading");
          else if (event.data === 0) advance(true);
        })
        .catch(() => {
          if (generation === selection.current.generation)
            fail("Status video belum dapat dibaca. Gunakan kontrol YouTube atau coba lagi.");
        });
    },
    [advance, fail],
  );

  const onError = useCallback(
    (event: YouTubeEvent<number>) => {
      const expected = selection.current.videoId;
      const generation = selection.current.generation;
      void matchesVideo(event.target, expected, true)
        .then((matches) => {
          if (matches && generation === selection.current.generation)
            fail(`${youtubeErrorMessage(event.data)} (YouTube ${event.data})`);
        })
        .catch(() => {
          if (generation === selection.current.generation)
            fail(`${youtubeErrorMessage(event.data)} (YouTube ${event.data})`);
        });
    },
    [fail],
  );

  useEffect(() => {
    if (!currentTrack || currentTrack.provider) return;
    let cancelled = false;
    let polling = false;
    const interval = window.setInterval(async () => {
      if (!player.current || polling) return;
      polling = true;
      const generation = selection.current.generation;
      try {
        const target = player.current;
        const [matches, seconds, length, actualVolume, actualMuted] = await Promise.all([
          matchesVideo(target, currentTrack.youtubeId ?? ""),
          target.getCurrentTime(),
          target.getDuration(),
          target.getVolume(),
          target.isMuted(),
        ]);
        if (cancelled || !matches || generation !== selection.current.generation) return;
        if (Number.isFinite(seconds)) {
          time.current = Math.max(0, seconds);
          setCurrentTime(time.current);
        }
        if (Number.isFinite(length) && length > 0) setDuration(length);
        if (Number.isFinite(actualVolume)) {
          const value = Math.min(1, Math.max(0, actualVolume / 100));
          preferences.current.volume = value;
          updateVolume(value);
        }
        preferences.current.muted = actualMuted;
        setMuted(actualMuted);
      } catch {
        if (!cancelled && generation === selection.current.generation)
          fail("Koneksi dengan pemutar terputus. Coba lagi atau buka video di YouTube.");
      } finally {
        polling = false;
      }
    }, 500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [currentTrack, fail]);

  useEffect(() => {
    if (status !== "loading" || !currentTrack) return;
    const timeout = window.setTimeout(
      () => fail("Pemutar belum merespons. Periksa koneksi, lalu coba lagi atau pilih lagu lain."),
      20_000,
    );
    return () => window.clearTimeout(timeout);
  }, [status, currentTrack, fail]);

  useEffect(() => {
    const offline = () => {
      if (selection.current.queue.length)
        fail("Koneksi internet terputus. Sambungkan kembali lalu coba lagi.");
    };
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("offline", offline);
      player.current = null;
    };
  }, [fail]);

  const value: PlayerContextValue = {
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
    retryPlayback,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {currentTrack?.provider && (
        <section className="audio-status" aria-label="Status audio">
          {/* biome-ignore lint/a11y/useMediaCaption: Providers do not supply caption files; no fabricated captions. */}
          <audio
            key={`${currentTrack.id}:${embedAttempt}`}
            ref={attachAudio}
            src={`/api/music/stream?provider=${currentTrack.provider}&id=${currentTrack.providerId}`}
            preload="metadata"
            onPlaying={() => {
              setStatus("playing");
              setError(null);
            }}
            onPause={() => setStatus((state) => (state === "error" ? state : "paused"))}
            onWaiting={() => setStatus("loading")}
            onError={() =>
              fail("Audio tidak tersedia atau koneksi terputus. Coba lagi atau pilih lagu lain.")
            }
            onEnded={() => advance(true)}
            onTimeUpdate={(event) => {
              time.current = event.currentTarget.currentTime;
              setCurrentTime(time.current);
            }}
            onDurationChange={(event) => {
              const value = event.currentTarget.duration;
              if (Number.isFinite(value) && value > 0) setDuration(value);
            }}
          />
          {error && (
            <div className="player-error" role="alert">
              <p>{error}</p>
              <button type="button" onClick={retryPlayback}>
                Coba lagi
              </button>
              <button type="button" onClick={next} disabled={!canGoNext}>
                Lagu berikutnya
              </button>
            </div>
          )}
        </section>
      )}
      {currentTrack && !currentTrack.provider && (
        <section className="youtube-panel" aria-label="Video YouTube yang sedang dipilih">
          <div className="youtube-panel-heading">
            <strong>{currentTrack.title}</strong>
            <a
              href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
              target="_blank"
              rel="noreferrer"
            >
              Buka YouTube <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
          <YouTube
            key={embedAttempt}
            videoId={currentTrack.youtubeId}
            opts={opts}
            className="youtube-embed"
            title={`${currentTrack.title} - video YouTube`}
            onReady={onReady}
            onStateChange={onStateChange}
            onError={onError}
          />
          <p className="youtube-caption-note">
            {currentTrack.lyricVideo ? "Video ini menyertakan lirik. " : ""}
            CC/subtitel mengikuti ketersediaan dan kontrol YouTube.
          </p>
          {status === "paused" && currentTime === 0 && !error && (
            <p className="youtube-caption-note">
              Tekan Putar pada video jika browser membatasi pemutaran otomatis.
            </p>
          )}
          {error && (
            <div className="player-error" role="alert">
              <p>{error}</p>
              <button type="button" onClick={retryPlayback}>
                <RotateCcw size={14} aria-hidden="true" /> Coba lagi
              </button>
              <button type="button" onClick={next} disabled={!canGoNext}>
                Lagu berikutnya
              </button>
            </div>
          )}
          <p className="youtube-privacy">
            Pemutaran memakai YouTube dan dapat menampilkan iklan.{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              Privasi Google
            </a>
          </p>
        </section>
      )}
    </PlayerContext.Provider>
  );
}
