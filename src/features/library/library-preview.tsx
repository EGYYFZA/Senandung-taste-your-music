import type { Catalog } from "@/features/catalog/types";
import { PersonalLibrary } from "./personal-library";

export function LibraryPreview({ catalog }: { catalog: Catalog }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RUANG MUSIKMU</p>
          <h1>Koleksi kamu.</h1>
          <p className="page-description">
            Buat playlist sendiri dan simpan lagu yang kamu temukan.
          </p>
        </div>
      </div>
      <PersonalLibrary tracks={catalog.tracks} />
    </>
  );
}
