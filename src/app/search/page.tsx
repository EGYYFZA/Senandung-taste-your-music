import type { Metadata } from "next";
import Form from "next/form";
import { activeProviders } from "@/features/catalog/music.server";
import { MusicCatalog } from "@/features/catalog/music-catalog";

export const metadata: Metadata = { title: "Cari musik" };
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; provider?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const provider = typeof params.provider === "string" ? params.provider : "all";
  const providers = activeProviders();
  const invalid =
    Array.isArray(params.q) ||
    Array.isArray(params.provider) ||
    query.length > 100 ||
    !["all", ...providers].includes(provider);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">TEMUKAN LAGUMU</p>
          <h1>Cari nada yang pas.</h1>
          <p className="page-description">
            Jelajahi lagu dan artis dari {providers.length === 2 ? "Audius dan Jamendo" : "Audius"}.
          </p>
        </div>
      </div>
      <search aria-label="Pencarian katalog">
        <Form className="search-form" action="/search">
          <label htmlFor="catalog-query">Apa yang ingin kamu temukan?</label>
          <div>
            <input
              key={query}
              id="catalog-query"
              name="q"
              type="search"
              maxLength={100}
              defaultValue={query.slice(0, 100)}
              placeholder="Cari judul, artis, atau genre"
            />
            <button className="button button--primary" type="submit">
              Cari
            </button>
          </div>
          {providers.length === 2 ? (
            <>
              <label htmlFor="search-provider">Sumber musik</label>
              <select id="search-provider" name="provider" key={provider} defaultValue={provider}>
                <option value="all">Semua sumber</option>
                <option value="audius">Audius</option>
                <option value="jamendo">Jamendo</option>
              </select>
            </>
          ) : (
            <input type="hidden" name="provider" value="all" />
          )}
        </Form>
      </search>
      {invalid ? (
        <p role="alert" className="error-message">
          Gunakan satu pencarian maksimal 100 karakter dan sumber yang tersedia.
        </p>
      ) : (
        <MusicCatalog key={`${query}:${provider}`} query={query} provider={provider} />
      )}
    </>
  );
}
