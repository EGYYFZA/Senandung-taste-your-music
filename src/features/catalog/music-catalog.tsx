"use client";

import { useEffect, useState } from "react";
import { type AudioProvider, parseAudioTrack, record } from "./audio-tracks";
import { TrackList } from "./track-list";
import type { Track } from "./types";

export function MusicCatalog({
  query = "",
  provider = "all",
  layout = "list",
}: {
  query?: string;
  provider?: string;
  layout?: "list" | "shelf";
}) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState({ providers: provider, offset: 0 });
  const [retryProviders, setRetryProviders] = useState("");
  const [more, setMore] = useState<AudioProvider[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ q: query, offset: String(request.offset) });
    if (request.providers !== "all") params.set("providers", request.providers);
    void fetch(`/api/music?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (
          !response.ok ||
          !record(body) ||
          !Array.isArray(body.tracks) ||
          !Array.isArray(body.more) ||
          !Array.isArray(body.failed) ||
          !Array.isArray(body.messages)
        )
          throw new Error("Katalog belum dapat dimuat. Coba lagi.");
        const parsed = body.tracks
          .map(parseAudioTrack)
          .filter((track): track is Track => track !== null);
        if (controller.signal.aborted) return;
        setTracks((previous) => [
          ...new Map([...previous, ...parsed].map((track) => [track.id, track])).values(),
        ]);
        const validProvider = (p: unknown): p is AudioProvider =>
          p === "yesnowave" || p === "audius" || p === "jamendo";
        const nextProviders = body.more.filter(validProvider);
        setMore((previous) => [...new Set([...previous, ...nextProviders])]);
        setRetryProviders(body.failed.filter(validProvider).join(","));
        setMessages(body.messages.filter((m): m is string => typeof m === "string"));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setRetryProviders(request.providers);
          setMessages([error instanceof Error ? error.message : "Katalog belum dapat dimuat."]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, request]);
  return (
    <section className="section-spaced" aria-label="Katalog musik langsung">
      <div className="section-heading">
        <h2>
          {layout === "shelf"
            ? `Rilisan independen Indonesia`
            : query
              ? "Hasil pencarian"
              : "Mulai mendengarkan"}
        </h2>
      </div>
      <p role="status" className="search-summary">
        {loading
          ? "Memuat musik…"
          : retryProviders && !tracks.length
            ? "Hasil pencarian belum tersedia."
            : `${tracks.length} lagu${query ? ` untuk “${query}”` : " untuk dijelajahi"}`}
      </p>
      {messages.map((message) => (
        <p key={message} className="preview-note">
          {message}
        </p>
      ))}
      {!!tracks.length && <TrackList tracks={tracks} layout={layout} />}
      {!loading && !retryProviders && !tracks.length && !more.length && (
        <p className="preview-note">Belum ketemu nadanya. Coba nama artis atau judul lain.</p>
      )}
      <div className="search-pagination">
        {!!retryProviders && (
          <button
            className="button button--secondary"
            type="button"
            disabled={loading}
            onClick={() => setRequest({ ...request, providers: retryProviders })}
          >
            Coba muat lagi
          </button>
        )}
        {(!!more.length || (!!retryProviders && request.offset > 0)) && (
          <button
            className="button button--primary"
            type="button"
            disabled={loading || !!retryProviders}
            onClick={() => {
              setRequest({ providers: more.join(","), offset: request.offset + 20 });
              setMore([]);
            }}
          >
            Muat berikutnya
          </button>
        )}
      </div>
    </section>
  );
}
