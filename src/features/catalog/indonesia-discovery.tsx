"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type Chart, parseChart } from "./indonesia-chart";

export function IndonesiaDiscovery() {
  const [chart, setChart] = useState<Chart | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt retries the same chart URL.
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/music/chart", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        const result = parseChart(await response.json());
        if (!controller.signal.aborted) setChart(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [attempt]);
  return (
    <section className="section-spaced" aria-labelledby="indonesia-heading">
      <div className="section-heading">
        <h2 id="indonesia-heading">Populer di Indonesia</h2>
        <a
          className="text-link"
          href="https://music.apple.com/id/playlist/top-100-indonesia/pl.2b7e089dc9ef4dd7a18429df9c6e26a3"
          target="_blank"
          rel="noreferrer"
        >
          Chart Apple Music
        </a>
      </div>
      <p className="preview-note">
        Referensi lagu yang paling sering diputar di Indonesia. Cari versi yang tersedia di
        Senandung; rekaman asli belum tentu tersedia di katalog audio.
      </p>
      {chart && (
        <p className="preview-note">
          {chart.stale && "Pembaruan belum tersedia. Menampilkan tangga lagu terakhir. "}
          Diperbarui sumber:{" "}
          {new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeZone: "Asia/Jakarta",
          }).format(new Date(chart.updated))}
        </p>
      )}
      {error ? (
        <>
          <p className="preview-note" role="status">
            Tangga lagu belum dapat dimuat.
          </p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setError(false);
              setAttempt((n) => n + 1);
            }}
          >
            Coba muat tangga lagu lagi
          </button>
        </>
      ) : !chart ? (
        <p className="preview-note">Memuat tangga lagu…</p>
      ) : (
        <ol className="chart-list">
          {chart.tracks.map((track, index) => (
            <li key={track.id}>
              <span>{index + 1}</span>
              <div>
                <strong>{track.title}</strong>
                <p>{track.artist}</p>
              </div>
              <Link
                className="text-link"
                href={{
                  pathname: "/search",
                  query: { q: `${track.title} ${track.artist}`.slice(0, 100) },
                }}
              >
                Cari audio
              </Link>
              <a
                className="text-link"
                href={track.sourceUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Buka ${track.title} di Apple Music`}
              >
                Apple Music
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
