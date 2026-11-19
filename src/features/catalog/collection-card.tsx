import Link from "next/link";
import { Artwork } from "@/components/ui/artwork";
import { PlayButton } from "./play-button";
import type { MusicCollection, Track } from "./types";

export function CollectionCard({
  collection,
  kind = "playlist",
  tracks,
}: {
  collection: MusicCollection;
  kind?: "playlist" | "album";
  tracks: Track[];
}) {
  return (
    <article className="collection-card">
      <div className="card-art">
        <Link href={`/${kind}/${collection.id}`} aria-label={`Buka ${collection.title}`}>
          <Artwork
            tone={collection.tone}
            title={collection.title}
            imageUrl={collection.artworkUrl}
          />
        </Link>
        <PlayButton tracks={tracks} compact label={`Putar ${collection.title}`} />
      </div>
      <h3>
        <Link href={`/${kind}/${collection.id}`}>{collection.title}</Link>
      </h3>
      <p>{collection.description}</p>
      <span className="card-meta">
        {collection.mood} <span aria-hidden="true">·</span> {collection.trackIds.length} lagu
      </span>
    </article>
  );
}
