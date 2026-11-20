"use client";
import { Headphones, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/features/player/player-provider";

const singles = [
  {
    artist: "Vanessa Zee",
    title: "Medley Pulkam (From ‘Pulang Kampung’)",
    embed:
      "https://embed.music.apple.com/id/album/medley-pulkam-from-pulang-kampung/6831515664?i=6831515667",
  },
  {
    artist: "Alisha Dira",
    title: "Versi Terbaik",
    embed: "https://embed.music.apple.com/id/album/versi-terbaik/6826146805?i=6826146806",
  },
  {
    artist: "Amanda Caesa",
    title: "Somebody New",
    embed: "https://embed.music.apple.com/id/album/somebody-new/6823492325?i=6823492328",
  },
];

export function IndonesiaRising() {
  const [selected, setSelected] = useState<(typeof singles)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const { status, togglePlayback } = usePlayer();
  useEffect(() => {
    if (selected && status === "playing") togglePlayback();
  }, [selected, status, togglePlayback]);
  return (
    <section className="section-spaced" aria-labelledby="radar">
      <h2 id="radar">Sorotan musisi Indonesia</h2>
      <p className="preview-note">Cuplikan rilis dari Apple Music.</p>
      <ul className="release-singles">
        {singles.map((single) => (
          <li key={single.embed}>
            <div>
              <strong>{single.title}</strong>
              <p>{single.artist}</p>
            </div>
            <button
              type="button"
              className="button button--secondary"
              aria-label={`Dengar cuplikan ${single.title}`}
              onClick={() => {
                setSelected(single);
                dialog.current?.showModal();
              }}
            >
              <Headphones size={16} aria-hidden="true" />
              Dengar cuplikan
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        className="save-dialog preview-dialog"
        aria-labelledby="preview-title"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className="section-heading">
              <h3 id="preview-title">{selected.title}</h3>
              <button
                type="button"
                aria-label="Tutup cuplikan"
                className="control-button"
                onClick={() => dialog.current?.close()}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <iframe
              title={`Cuplikan ${selected.title} oleh ${selected.artist}`}
              src={selected.embed}
              allow="autoplay; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </>
        )}
      </dialog>
    </section>
  );
}
