import { NextResponse } from "next/server";
import { getPropertiesByIds } from "@/lib/properties/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").filter(Boolean).slice(0, 3) || [];
  const properties = await getPropertiesByIds(ids);
  return NextResponse.json({ properties }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}