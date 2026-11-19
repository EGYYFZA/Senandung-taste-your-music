import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <>
      <h1 className="sr-only">Halaman tidak ditemukan</h1>
      <EmptyState
        title="Sepertinya kita kehilangan nadanya."
        action={
          <Link className="button button--primary" href="/">
            Kembali ke Beranda
          </Link>
        }
      >
        Halaman atau koleksi ini belum tersedia. Ada banyak suasana lain untuk dijelajahi.
      </EmptyState>
    </>
  );
}
