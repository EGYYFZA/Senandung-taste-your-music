import { searchIndonesianTracks } from "@/features/catalog/indonesian-releases";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim();
  const offset = params.get("offset") ?? "0";
  const provider = params.get("providers");
  if (
    params.getAll("q").length > 1 ||
    params.getAll("providers").length > 1 ||
    params.getAll("offset").length > 1 ||
    query.length > 100 ||
    !/^\d{1,7}$/.test(offset) ||
    Number(offset) > 1000000 ||
    (provider !== null && provider !== "yesnowave")
  ) {
    return Response.json({ error: "Parameter pencarian tidak valid." }, { status: 400 });
  }
  const results = searchIndonesianTracks(query);
  const start = Number(offset);
  const end = start + 20;
  return Response.json({
    tracks: results.slice(start, end),
    more: results.length > end ? ["yesnowave"] : [],
    failed: [],
    messages: [],
  });
}
