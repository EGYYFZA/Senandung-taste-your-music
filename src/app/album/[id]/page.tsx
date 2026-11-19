import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog } from "@/features/catalog/catalog.server";
import { tracksForCollection } from "@/features/catalog/catalog-utils";
import { CollectionDetail } from "@/features/catalog/collection-detail";

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return getCatalog().albums.map(({ id }) => ({ id }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: getCatalog().albums.find((item) => item.id === id)?.title ?? "Koleksi tidak ditemukan",
  };
}
export default async function AlbumPage({ params }: Props) {
  const { id } = await params;
  const catalog = getCatalog();
  const collection = catalog.albums.find((item) => item.id === id);
  if (!collection) notFound();
  return (
    <CollectionDetail
      collection={collection}
      kind="album"
      tracks={tracksForCollection(collection, catalog.tracks)}
      albums={catalog.albums}
    />
  );
}
