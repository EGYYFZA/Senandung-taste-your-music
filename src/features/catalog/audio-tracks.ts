import type { Track } from "./types";

export type AudioProvider = NonNullable<Track["provider"]>;
export const providerName = (track: Track) =>
  track.provider === "yesnowave"
    ? "Yes No Wave Music"
    : track.provider === "audius"
      ? "Audius"
      : track.provider === "jamendo"
        ? "Jamendo"
        : "YouTube";
export const libraryTrackId = (track: Track) => track.youtubeId ?? track.id;
export const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
export function validProviderId(provider: unknown, id: unknown): id is string {
  return (
    typeof id === "string" &&
    (provider === "yesnowave"
      ? /^yesno[0-9]{3}-[1-9][0-9]?$/.test(id)
      : provider === "audius"
        ? /^[a-zA-Z0-9]{1,32}$/.test(id)
        : provider === "jamendo" && /^[0-9]{1,20}$/.test(id))
  );
}
export function publicHttps(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 4096) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname) ||
      /\.(local|localhost|internal)$/i.test(url.hostname)
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
export function parseAudioTrack(value: unknown): Track | null {
  if (
    !record(value) ||
    !validProviderId(value.provider, value.providerId) ||
    value.id !== `${value.provider}:${value.providerId}` ||
    typeof value.title !== "string" ||
    !value.title.trim() ||
    value.title.length > 500 ||
    typeof value.artist !== "string" ||
    !value.artist.trim() ||
    value.artist.length > 200 ||
    typeof value.durationSeconds !== "number" ||
    !Number.isFinite(value.durationSeconds) ||
    value.durationSeconds <= 0 ||
    value.durationSeconds > 86400
  )
    return null;
  const sourceUrl = publicHttps(value.sourceUrl);
  const artworkUrl = value.artworkUrl === "" ? "" : publicHttps(value.artworkUrl);
  if (
    !sourceUrl ||
    artworkUrl === null ||
    !new URL(sourceUrl).hostname.match(
      value.provider === "yesnowave"
        ? /^yesnowave\.com$/
        : value.provider === "audius"
          ? /^(www\.)?audius\.co$/
          : /^(www\.)?jamendo\.com$/,
    )
  )
    return null;
  const licenseUrl = value.licenseUrl ? publicHttps(value.licenseUrl) : undefined;
  if (value.licenseUrl && !licenseUrl) return null;
  return {
    id: value.id as string,
    provider: value.provider as AudioProvider,
    providerId: value.providerId,
    title: value.title.trim(),
    artist: value.artist.trim(),
    durationSeconds: value.durationSeconds,
    sourceUrl,
    artworkUrl,
    ...(licenseUrl ? { licenseUrl } : {}),
    albumId: "",
    mood: "Musik",
    tone: "sky",
    lyricVideo: false,
  };
}
