import { type AudioProvider, validProviderId } from "@/features/catalog/audio-tracks";
import { resolveStream } from "@/features/catalog/music.server";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const provider = params.get("provider");
  const id = params.get("id");
  if (!validProviderId(provider, id))
    return Response.json({ error: "Identitas lagu tidak valid." }, { status: 400 });
  try {
    return new Response(null, {
      status: 307,
      headers: {
        Location: await resolveStream(provider as AudioProvider, id),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Audio belum tersedia. Coba lagi atau pilih lagu lain." },
      { status: 502 },
    );
  }
}
