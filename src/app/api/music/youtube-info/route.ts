import { takeMusicRequest } from "@/features/catalog/request-budget";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[\w-]{11}$/.test(id)) return Response.json({}, { status: 400 });
  if (!takeMusicRequest()) return Response.json({}, { status: 429 });
  const canonical = `https://www.youtube.com/watch?v=${id}`;
  const url = new URL("https://www.youtube.com/oembed");
  url.searchParams.set("url", canonical);
  url.searchParams.set("format", "json");
  try {
    const response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!response.ok) throw Error();
    const info = await response.json();
    if (typeof info.title !== "string" || !info.title.trim() || info.title.length > 500)
      throw Error();
    return Response.json(
      {
        title: info.title,
        artist:
          typeof info.author_name === "string" && info.author_name.trim()
            ? info.author_name.trim().slice(0, 200)
            : "YouTube",
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json({}, { status: 502 });
  }
}
