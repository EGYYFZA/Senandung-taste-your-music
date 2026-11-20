import type { Metadata } from "next";
import { getCatalog } from "@/features/catalog/catalog.server";
import { LibraryPreview } from "@/features/library/library-preview";
import { LegacyYoutubeImport } from "@/features/library/youtube-import";
export const metadata: Metadata = { title: "Koleksi" };
export default function LibraryPage() {
  return (
    <>
      <LibraryPreview catalog={getCatalog()} />
      <LegacyYoutubeImport />
    </>
  );
}
