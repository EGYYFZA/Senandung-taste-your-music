export type ArtworkTone = "sky" | "sage" | "peach" | "lilac";

export type Track = {
  id: string;
  title: string;
  artist: string;
  albumId: string;
  durationSeconds: number;
  mood: string;
  tone: ArtworkTone;
  youtubeId?: string;
  provider?: "audius" | "jamendo" | "yesnowave";
  providerId?: string;
  licenseUrl?: string;
  artworkUrl: string;
  sourceUrl: string;
  lyricVideo: boolean;
};

export type MusicCollection = {
  id: string;
  title: string;
  description: string;
  mood: string;
  tone: ArtworkTone;
  trackIds: string[];
  artworkUrl?: string;
};

export type Catalog = { tracks: Track[]; albums: MusicCollection[]; playlists: MusicCollection[] };
