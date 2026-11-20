import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kredit, sumber & privasi" };
export default function CreditsPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Kredit, sumber & privasi.</h1>
        </div>
      </div>
      <section className="design-panel">
        <h2>Rekaman dan sampul</h2>
        <p>
          Rilisan audio bersumber dari Yes No Wave Music. Setiap lagu mencantumkan artis, tautan
          rilis asli dan lisensi. Rekaman diputar dari alamat audio yang diterbitkan label. Materi
          berlisensi CC BY-NC digunakan untuk pemutaran nonkomersial.
        </p>
        <a
          className="text-link"
          href="https://yesnowave.com/about/"
          target="_blank"
          rel="noreferrer"
        >
          Tentang Yes No Wave Music
        </a>
      </section>
      <section className="design-panel">
        <h2>Koleksi dan privasi</h2>
        <p>
          Pencarian berlangsung di katalog Senandung. Saat sampul atau audio dimuat, browser
          terhubung ke penyedia media yang dapat menerima alamat IP dan informasi perangkat.
          Playlist dan lagu tersimpan pada browser ini. Saat kamu memilih cuplikan, Senandung memuat
          pemutar resmi Apple Music. Lagu dari tautan YouTube memakai pemutar resmi YouTube.
        </p>
      </section>
      <section className="design-panel">
        <h2>Desain & open source</h2>
        <p>
          Senandung adalah proyek independen. Font Inter Variable menggunakan SIL Open Font License
          dan ikon Lucide menggunakan lisensi ISC.
        </p>
        <a className="text-link" href="https://rsms.me/inter/" target="_blank" rel="noreferrer">
          Inter & lisensi
        </a>
      </section>
    </>
  );
}
