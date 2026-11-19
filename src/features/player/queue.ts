export type RepeatMode = "off" | "all" | "one";

export function nextQueueIndex(
  length: number,
  index: number,
  repeat: RepeatMode,
  shuffle: boolean,
  ended = false,
  random = Math.random(),
): number | null {
  if (length < 1 || index < 0 || index >= length) return null;
  if (ended && repeat === "one") return index;
  if (shuffle && length > 1) {
    const offset = Math.min(length - 2, Math.max(0, Math.floor(random * (length - 1))));
    return offset >= index ? offset + 1 : offset;
  }
  if (index + 1 < length) return index + 1;
  return repeat === "all" ? 0 : null;
}

export function previousQueueIndex(length: number, index: number, repeat: RepeatMode) {
  if (length < 1 || index < 0 || index >= length) return null;
  if (index > 0) return index - 1;
  return repeat === "all" ? length - 1 : null;
}

export function playbackTime(seconds: number) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export function youtubeErrorMessage(code: number) {
  if (code === 100)
    return "Video ini tidak tersedia atau telah dihapus. Pilih lagu lain atau buka sumber YouTube.";
  if (code === 101 || code === 150)
    return "Pemilik video membatasi pemutaran di situs lain. Buka YouTube atau pilih lagu lain.";
  if (code === 153)
    return "YouTube tidak dapat memverifikasi asal pemutar. Buka sumber YouTube atau coba browser lain.";
  if (code === 2) return "ID video tidak valid. Pilih lagu lain dari katalog.";
  if (code === 5) return "Browser belum dapat memutar video ini. Coba lagi atau buka YouTube.";
  return "Pemutaran YouTube belum berhasil. Coba lagi atau pilih lagu lain.";
}
