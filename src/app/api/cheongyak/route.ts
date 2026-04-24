import { NextRequest, NextResponse } from "next/server";
import {
  matchesRegion,
  normalizeCheongyakItem,
  parseApiItems,
  safeRegion,
} from "@/lib/cheongyak";
import { CheongyakItem } from "@/lib/types";

export const revalidate = 3600;

const FALLBACK_ITEMS: CheongyakItem[] = [
  {
    id: "fallback-1",
    houseName: "예시 센트럴 아파트",
    region: "서울",
    address: "서울시 강남구 예시로 10",
    noticeDate: "2026-04-15",
    receiptStartDate: "2026-04-20",
    receiptEndDate: "2026-04-22",
    winnerDate: "2026-04-30",
    supplyType: "민간분양",
    housingType: "아파트",
    supplyMethod: "일반공급",
    qualifications: ["신혼부부", "생애최초", "일반"],
    totalSupplyHouseholdCount: 500,
    applyHomeUrl: "https://www.applyhome.co.kr",
    status: "접수 예정",
    sourceApi: "fallback",
  },
];

function getMonthRange(month: string): { startDate: string; endDate: string } {
  const normalized = month.replace("-", "");
  const year = Number(normalized.slice(0, 4));
  const m = Number(normalized.slice(4, 6));
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m, 0);
  const format = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return { startDate: format(start), endDate: format(end) };
}

async function fetchOneApi(
  endpoint: string,
  serviceKey: string,
  region: string,
  month: string
): Promise<CheongyakItem[]> {
  const { startDate, endDate } = getMonthRange(month);
  const url = new URL(endpoint);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("type", "json");
  url.searchParams.set("numOfRows", "100");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("cond[SUBSCRPT_AREA_CODE_NM::EQ]", region);
  url.searchParams.set("cond[RCRIT_PBLANC_DE::GTE]", startDate);
  url.searchParams.set("cond[RCRIT_PBLANC_DE::LTE]", endDate);

  const extraQuery = process.env.PUBLIC_DATA_EXTRA_QUERY;
  if (extraQuery) {
    for (const pair of extraQuery.split("&")) {
      const [key, value] = pair.split("=");
      if (key && value) {
        url.searchParams.set(decodeURIComponent(key), decodeURIComponent(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`공공데이터 API 실패: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const rows = parseApiItems(payload);
  return rows
    .map((row) => normalizeCheongyakItem(row, endpoint))
    .filter((item): item is CheongyakItem => item !== null);
}

export async function GET(request: NextRequest) {
  const region = safeRegion(request.nextUrl.searchParams.get("region") || "서울");
  const month =
    request.nextUrl.searchParams.get("month") ||
    new Date().toISOString().slice(0, 7);

  const serviceKey = process.env.PUBLIC_DATA_SERVICE_KEY;
  const apiUrls = process.env.PUBLIC_DATA_API_URLS?.split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  if (!serviceKey || !apiUrls || apiUrls.length === 0) {
    return NextResponse.json({
      source: "fallback",
      warning:
        "PUBLIC_DATA_SERVICE_KEY 또는 PUBLIC_DATA_API_URLS 설정이 없어 샘플 데이터를 반환합니다.",
      items: FALLBACK_ITEMS.filter((item) => matchesRegion(item.region, region)),
    });
  }

  try {
    const results = await Promise.all(
      apiUrls.map((url) => fetchOneApi(url, serviceKey, region, month))
    );

    const flattened = results
      .flat()
      .filter((item) => matchesRegion(item.region, region));

    const unique = Array.from(new Map(flattened.map((item) => [item.id, item])).values());

    return NextResponse.json({
      source: "public-data",
      count: unique.length,
      items: unique,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      {
        source: "fallback",
        error: message,
        items: FALLBACK_ITEMS.filter((item) => matchesRegion(item.region, region)),
      },
      { status: 200 }
    );
  }
}
