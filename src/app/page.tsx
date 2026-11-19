import Link from "next/link";
import { IndonesiaDiscovery } from "@/features/catalog/indonesia-discovery";
import { MusicCatalog } from "@/features/catalog/music-catalog";

export default function HomePage() {
  return (
    <>
      <nav className="mood-links" aria-label="Pilih suasana">
        <Link className="mood-chip is-selected" href="/" aria-current="page">
          Untukmu
        </Link>
        {["Indonesia", "Dangdut", "Pop Indonesia", "Jazz", "Electronic"].map((genre) => (
          <Link className="mood-chip" key={genre} href={`/search?q=${genre}`}>
            {genre}
          </Link>
        ))}
      </nav>
      <div className="page-heading home-heading">
        <div>
          <h1>Musik untuk harimu.</h1>
          <p className="page-description">Lagu, suasana, dan playlist dalam satu ruang dengar.</p>
        </div>
      </div>
      <MusicCatalog query="Indonesia" layout="shelf" />
      <IndonesiaDiscovery />
      <Link className="text-link" href="/library">
        Buka koleksi dan playlist kamu
      </Link>
    </>
  );
}
