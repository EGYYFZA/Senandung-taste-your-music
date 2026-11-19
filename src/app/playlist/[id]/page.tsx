import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog } from "@/features/catalog/catalog.server";
import { tracksForCollection } from "@/features/catalog/catalog-utils";
import { CollectionDetail } from "@/features/catalog/collection-detail";

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return getCatalog().playlists.map(({ id }) => ({ id }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title:
      getCatalog().playlists.find((item) => item.id === id)?.title ?? "Playlist tidak ditemukan",
  };
}
export default async function PlaylistPage({ params }: Props) {
  const { id } = await params;
  const catalog = getCatalog();
  const collection = catalog.playlists.find((item) => item.id === id);
  if (!collection) notFound();
  return (
    <CollectionDetail
      collection={collection}
      kind="playlist"
      tracks={tracksForCollection(collection, catalog.tracks)}
      albums={catalog.albums}
    />
  );
}
