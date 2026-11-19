import type { AudioProvider } from "@/features/catalog/audio-tracks";
import { activeProviders, searchMusic } from "@/features/catalog/music.server";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim();
  const providers = params.get("providers")?.split(",") ?? activeProviders();
  const offset = params.get("offset") ?? "0";
  if (
    query.length > 100 ||
    !/^\d{1,7}$/.test(offset) ||
    Number(offset) > 1000000 ||
    providers.length > 2 ||
    new Set(providers).size !== providers.length ||
    providers.some((p) => !["audius", "jamendo"].includes(p))
  )
    return Response.json({ error: "Parameter pencarian tidak valid." }, { status: 400 });
  return Response.json(await searchMusic(query, providers as AudioProvider[], Number(offset)), {
    headers: { "Cache-Control": "no-store" },
  });
}
