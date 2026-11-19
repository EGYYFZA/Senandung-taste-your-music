import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kredit, sumber & privasi" };
export default function CreditsPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Kredit, sumber & privasi.</h1>
          <p className="page-description">
            Senandung adalah proyek independen; tidak berafiliasi dengan Spotify atau YouTube.
          </p>
        </div>
      </div>
      <section className="design-panel">
        <h2>Audius & Jamendo</h2>
        <p>
          Beranda dan pencarian menggunakan katalog Audius serta Jamendo bila dikonfigurasi. Judul,
          sampul, artis dan tautan sumber berasal dari provider. Musik hanya diputar jika sumber
          mengizinkan akses streaming; lisensi tiap lagu tetap berlaku. Tidak ada unduhan atau
          penyimpanan file audio.
        </p>
        <p>
          Kata pencarian dikirim melalui server Senandung dan dapat di-cache dua menit. Saat memutar
          musik atau memuat sampul, browser menghubungi provider/CDN yang dapat menerima alamat IP
          dan informasi perangkat. Koleksi pribadi menyimpan metadata di browser; alamat streaming
          sementara tidak disimpan. Lirik sinkron belum tersedia pada integrasi audio ini.
        </p>
        <div className="design-row">
          <a className="text-link" href="https://audius.co" target="_blank" rel="noreferrer">
            Audius
          </a>
          <a className="text-link" href="https://www.jamendo.com" target="_blank" rel="noreferrer">
            Musik dari Jamendo
          </a>
          <a
            className="text-link"
            href="https://devportal.jamendo.com/api_terms_of_use"
            target="_blank"
            rel="noreferrer"
          >
            Ketentuan API Jamendo
          </a>
        </div>
      </section>
      <section className="design-panel">
        <h2>Chart Indonesia</h2>
        <p>
          Bagian Populer di Indonesia memakai feed Top Songs Apple Music wilayah Indonesia. Tanggal
          mengikuti pembaruan sumber. Server mencoba memperbarui chart setelah satu jam. Jika
          pembaruan gagal, salinan terakhir dapat ditampilkan hingga 24 jam sejak diambil. Chart
          mencakup lagu lokal dan internasional, bukan ukuran viralitas TikTok. Tautan Cari audio
          mencari judul dan artis di katalog Senandung tanpa menjamin rekaman yang sama tersedia.
        </p>
        <a
          className="text-link"
          href="https://rss.marketingtools.apple.com/"
          target="_blank"
          rel="noreferrer"
        >
          Apple Music Marketing Tools — RSS
        </a>
      </section>
      <section className="design-panel">
        <h2>Desain & open source</h2>
        <p>
          Logo, copy dan artwork playlist dibuat untuk Senandung. Tipografi Inter Variable
          berlisensi SIL Open Font License; ikon Lucide berlisensi ISC. React YouTube (MIT)
          menghubungkan aplikasi ke IFrame API resmi. Font dan logo Spotify tidak digunakan.
        </p>
        <a className="text-link" href="https://rsms.me/inter/" target="_blank" rel="noreferrer">
          Inter & lisensi
        </a>
      </section>
    </>
  );
}
