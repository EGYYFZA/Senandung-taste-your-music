import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Artwork } from "@/components/ui/artwork";
import { PlayButton } from "./play-button";
import { TrackList } from "./track-list";
import type { MusicCollection, Track } from "./types";

export function CollectionDetail({
  collection,
  tracks,
  albums,
  kind,
}: {
  collection: MusicCollection;
  tracks: Track[];
  albums: MusicCollection[];
  kind: "playlist" | "album";
}) {
  return (
    <>
      <Link className="back-link" href={kind === "playlist" ? "/library" : "/search"}>
        <ArrowLeft size={17} aria-hidden="true" />
        Jelajahi koleksi
      </Link>
      <section className="collection-hero">
        <Artwork tone={collection.tone} title={collection.title} imageUrl={collection.artworkUrl} />
        <div className="collection-copy">
          <p className="eyebrow">{kind === "playlist" ? "PLAYLIST PILIHAN" : "PILIHAN ARTIS"}</p>
          <h1>{collection.title}</h1>
          <p>{collection.description}</p>
          <div className="collection-byline">
            <span className="mini-brand">s.</span>
            <strong>Senandung</strong>
            <span>· {tracks.length} lagu</span>
            <span>· Sumber YouTube</span>
          </div>
        </div>
      </section>
      <div className="collection-actions">
        <PlayButton tracks={tracks} label={`Putar ${collection.title}`} />
      </div>
      <p className="preview-note">
        Video diputar melalui YouTube. Lirik tersedia pada video lirik; CC mengikuti ketersediaan
        sumber.
      </p>
      <TrackList tracks={tracks} albums={albums} />
    </>
  );
}
