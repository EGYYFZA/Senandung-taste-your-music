export async function GET() {
  return Response.json(
    { error: "Chart wilayah digantikan katalog musisi Indonesia.", catalog: "/api/music" },
    { status: 410 },
  );
}
