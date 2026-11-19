CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) BETWEEN 1 AND 64),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 1000),
  mood TEXT NOT NULL CHECK (length(mood) BETWEEN 1 AND 60),
  tone TEXT NOT NULL CHECK (tone IN ('sky', 'sage', 'peach', 'lilac')),
  artwork_url TEXT,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0)
) STRICT;

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) BETWEEN 1 AND 64),
  youtube_id TEXT NOT NULL UNIQUE CHECK (
    length(youtube_id) = 11 AND youtube_id NOT GLOB '*[^A-Za-z0-9_-]*'
  ),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
  artist TEXT NOT NULL CHECK (length(artist) BETWEEN 1 AND 200),
  album_id TEXT NOT NULL REFERENCES albums(id) ON DELETE RESTRICT,
  album_position INTEGER NOT NULL CHECK (album_position >= 0),
  duration_seconds REAL NOT NULL CHECK (duration_seconds BETWEEN 0 AND 86400),
  mood TEXT NOT NULL CHECK (length(mood) BETWEEN 1 AND 60),
  tone TEXT NOT NULL CHECK (tone IN ('sky', 'sage', 'peach', 'lilac')),
  artwork_url TEXT NOT NULL,
  source_url TEXT NOT NULL CHECK (source_url = 'https://www.youtube.com/watch?v=' || youtube_id),
  lyric_video INTEGER NOT NULL CHECK (lyric_video IN (0, 1)),
  verified_at TEXT NOT NULL CHECK (length(verified_at) = 10),
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0)
) STRICT;

CREATE INDEX IF NOT EXISTS tracks_album_position ON tracks(album_id, album_position);

CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY NOT NULL CHECK (length(id) BETWEEN 1 AND 64),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 1000),
  mood TEXT NOT NULL CHECK (length(mood) BETWEEN 1 AND 60),
  tone TEXT NOT NULL CHECK (tone IN ('sky', 'sage', 'peach', 'lilac')),
  artwork_url TEXT,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0)
) STRICT;

CREATE TABLE IF NOT EXISTS playlist_tracks (
  playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL CHECK (position >= 0),
  PRIMARY KEY (playlist_id, track_id)
) STRICT;

CREATE INDEX IF NOT EXISTS playlist_tracks_track ON playlist_tracks(track_id);
