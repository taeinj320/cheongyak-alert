import { CheongyakItem, CheongyakStatus, SupplyType } from "@/lib/types";

const REGION_LIST = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

function readString(raw: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function readNumber(raw: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.replace(/,/g, ""));
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

export function inferSupplyType(rawType: string): SupplyType {
  if (/(국민|공공|LH)/.test(rawType)) return "공공분양";
  if (/(민영|민간)/.test(rawType)) return "민간분양";
  return "기타";
}

function inferSupplyTypeFromRaw(raw: Record<string, unknown>): SupplyType {
  const detailedType = readString(raw, [
    "HOUSE_DTL_SECD_NM",
    "HOUSE_DTL_SECD",
    "houseDetailType",
  ]);
  const simpleType = readString(raw, ["HOUSE_SECD_NM", "houseType", "주택구분"]);
  const joined = `${detailedType} ${simpleType}`.trim();

  // 코드값이 문자열로 내려오는 경우를 함께 처리합니다.
  if (/\b03\b/.test(joined)) return "공공분양";
  if (/\b01\b/.test(joined)) return "민간분양";
  return inferSupplyType(joined);
}

export function inferHousingType(name: string): string {
  if (/오피스텔/.test(name)) return "오피스텔";
  if (/도시형/.test(name)) return "도시형생활주택";
  if (/임대/.test(name)) return "민간임대";
  if (/생활숙박/.test(name)) return "생활숙박시설";
  return "아파트";
}

export function inferStatus(
  receiptStartDate: string,
  receiptEndDate: string,
  winnerDate: string
): CheongyakStatus {
  const today = new Date();
  const start = receiptStartDate ? new Date(receiptStartDate) : null;
  const end = receiptEndDate ? new Date(receiptEndDate) : null;
  const winner = winnerDate ? new Date(winnerDate) : null;

  if (start && today < start) return "접수 예정";
  if (start && end && today >= start && today <= end) return "접수 중";
  if (winner && today >= winner) return "당첨자 발표";
  return "접수 마감";
}

function normalizeDate(value: string): string {
  if (!value) return "";
  const v = value.replace(/[.]/g, "-").replace(/\//g, "-");
  if (/^\d{8}$/.test(v)) {
    return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
  }
  return v.slice(0, 10);
}

export function normalizeCheongyakItem(
  raw: Record<string, unknown>,
  sourceApi: string
): CheongyakItem | null {
  const houseName = readString(raw, ["HOUSE_NM", "houseNm", "주택명", "title"]);
  const region = readString(raw, [
    "SUBSCRPT_AREA_CODE_NM",
    "region",
    "sido",
    "공급지역",
  ]);
  if (!houseName || !region) return null;

  const noticeDate = normalizeDate(
    readString(raw, ["RCRIT_PBLANC_DE", "noticeDate", "모집공고일"])
  );
  const receiptStartDate = normalizeDate(
    readString(raw, ["RCEPT_BGNDE", "receiptStartDate", "청약접수시작일"])
  );
  const receiptEndDate = normalizeDate(
    readString(raw, ["RCEPT_ENDDE", "receiptEndDate", "청약접수종료일"])
  );
  const winnerDate = normalizeDate(
    readString(raw, ["PRZWNER_PRESNATN_DE", "winnerDate", "당첨자발표일"])
  );
  const supplyType = inferSupplyTypeFromRaw(raw);

  const item: CheongyakItem = {
    id:
      readString(raw, ["PBLANC_NO", "공고번호", "id"]) ||
      `${sourceApi}-${houseName}-${noticeDate}`,
    houseName,
    region,
    address: readString(raw, ["HSSPLY_ADRES", "address", "공급위치"]),
    noticeDate,
    receiptStartDate,
    receiptEndDate,
    winnerDate,
    supplyType,
    housingType: inferHousingType(houseName),
    supplyMethod: readString(raw, ["supplyMethod", "공급방식"]) || "일반공급",
    qualifications: ["일반"],
    totalSupplyHouseholdCount: readNumber(raw, [
      "TOT_SUPLY_HSHLDCO",
      "totalSupply",
      "총공급세대수",
    ]),
    applyHomeUrl:
      readString(raw, ["PBLANC_URL", "detailUrl", "청약홈URL"]) ||
      "https://www.applyhome.co.kr",
    status: inferStatus(receiptStartDate, receiptEndDate, winnerDate),
    sourceApi,
  };
  return item;
}

export function parseApiItems(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];
  const body = payload as Record<string, unknown>;
  const candidates = [
    body.data,
    body.items,
    body.response,
    body.result,
    body.results,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as Record<string, unknown>[];
    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      const keys = ["item", "items", "data", "list"];
      for (const key of keys) {
        if (Array.isArray(nested[key])) {
          return nested[key] as Record<string, unknown>[];
        }
      }
    }
  }
  return [];
}

export function matchesRegion(itemRegion: string, selectedRegion: string): boolean {
  if (!selectedRegion) return true;
  return itemRegion.includes(selectedRegion);
}

export function safeRegion(region: string): string {
  return REGION_LIST.includes(region) ? region : "서울";
}
