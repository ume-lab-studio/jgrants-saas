import { NextRequest, NextResponse } from "next/server";
import { searchSubsidies } from "@/lib/jgrants/client";
import { summarizeSubsidy } from "@/lib/claude/summarize";

const SUMMARY_COUNT = 3;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const keyword = searchParams.get("keyword") ?? undefined;
  const area = searchParams.get("area") ?? undefined;

  const params: Record<string, string> = {};
  if (keyword) params.keyword = keyword;
  if (area) params.area = area;

  let subsidiesData: unknown;
  try {
    subsidiesData = await searchSubsidies(params);
  } catch (error: unknown) {
    if (getErrorMessage(error) === "JGRANTS_AUTH_REQUIRED") {
      return NextResponse.json(
        { success: false, error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }

  const raw = subsidiesData as Record<string, unknown>;
  const items = Array.isArray(raw?.result)
    ? (raw.result as unknown[])
    : Array.isArray(subsidiesData)
      ? subsidiesData
      : [];

  const withSummaries = await Promise.all(
    items.map(async (item, index) => {
      if (index >= SUMMARY_COUNT) return item;
      try {
        const summary = await summarizeSubsidy(item);
        return { ...(item as object), summary };
      } catch {
        return item;
      }
    })
  );

  return NextResponse.json({ success: true, data: withSummaries });
}
