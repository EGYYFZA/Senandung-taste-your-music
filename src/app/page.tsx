import Link from "next/link";
import { Artwork } from "@/components/ui/artwork";
import { IndonesiaRising } from "@/features/catalog/indonesia-rising";
import { searchIndonesianTracks } from "@/features/catalog/indonesian-releases";
import { MusicCatalog } from "@/features/catalog/music-catalog";
import { PlayButton } from "@/features/catalog/play-button";

export default function HomePage() {
  const album = searchIndonesianTracks("").filter((t) => t.providerId?.startsWith("yesno122-"));
  const featured = album[0];
  return (
    <>
      {featured && (
        <section className="release-hero" aria-labelledby="featured-release">
          <div className="hero-sleeve">
            <Artwork tone={featured.tone} title={featured.mood} imageUrl={featured.artworkUrl} />
          </div>
          <div className="hero-info">
            <p className="hero-kicker">Album sorotan</p>
            <h1 id="featured-release">{featured.mood}</h1>
            <p>
              {featured.artist} · {album.length} lagu
            </p>
            <div className="hero-actions">
              <PlayButton tracks={album} label="Putar album" />
              <Link className="text-link" href="/library">
                Koleksi saya
              </Link>
            </div>
          </div>
        </section>
      )}
      <MusicCatalog layout="shelf" />
      <IndonesiaRising />
    </>
  );
}
