import type { Metadata } from "next";
import Form from "next/form";
import { MusicCatalog } from "@/features/catalog/music-catalog";

export const metadata: Metadata = { title: "Cari musik Indonesia" };
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; provider?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const invalid =
    Array.isArray(params.q) ||
    query.length > 100 ||
    (params.provider !== undefined && params.provider !== "all" && params.provider !== "yesnowave");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Cari musik Indonesia.</h1>
          <p className="page-description">Cari judul atau musisi dalam katalog audio Indonesia.</p>
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
              placeholder="Cari judul atau nama musisi"
            />
            <button className="button button--primary" type="submit">
              Cari
            </button>
          </div>
        </Form>
      </search>
      {invalid ? (
        <p role="alert" className="error-message">
          Gunakan satu pencarian maksimal 100 karakter dan sumber yang tersedia.
        </p>
      ) : (
        <MusicCatalog key={query} query={query} />
      )}
    </>
  );
}
