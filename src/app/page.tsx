"use client";

import { useEffect, useMemo, useState } from "react";
import { BlogPost, CheongyakItem } from "@/lib/types";

const REGIONS = [
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

const SUPPLY_FILTERS = ["민간분양", "공공분양"];
const HOUSING_FILTERS = [
  "아파트",
  "오피스텔",
  "도시형생활주택",
  "민간임대",
  "생활숙박시설",
];
const STATUS_FILTERS = ["접수 예정", "접수 중", "접수 마감", "당첨자 발표"];
const AD_SLOTS = [
  {
    title: "광고 영역 A",
    description: "지역 부동산/이사/인테리어 제휴 광고를 배치할 수 있습니다.",
  },
  {
    title: "광고 영역 B",
    description: "청약 관련 금융/상담 서비스 배너를 노출할 수 있습니다.",
  },
  {
    title: "광고 영역 C",
    description: "생활 편의/지역 혜택 서비스 광고를 노출할 수 있습니다.",
  },
];

type BlogMap = Record<string, BlogPost[]>;

function monthLabel(value: string): string {
  const [year, month] = value.split("-");
  return `${year}년 ${month}월`;
}

function matchOrAll(selected: string[], value: string): boolean {
  return selected.length === 0 || selected.includes(value);
}

function toggleValue(current: string[], value: string): string[] {
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}

export default function Home() {
  const [region, setRegion] = useState("서울");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [items, setItems] = useState<CheongyakItem[]>([]);
  const [blogs, setBlogs] = useState<BlogMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [supplyFilters, setSupplyFilters] = useState<string[]>([]);
  const [housingFilters, setHousingFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const clearFilters = () => {
    setSupplyFilters([]);
    setHousingFilters([]);
    setStatusFilters([]);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/cheongyak?region=${encodeURIComponent(region)}&month=${encodeURIComponent(month)}`
        );
        const data = (await response.json()) as { items?: CheongyakItem[]; error?: string };
        if (!response.ok) throw new Error(data.error || "청약 데이터 조회 실패");
        setItems(data.items || []);
      } catch (e) {
        const message = e instanceof Error ? e.message : "조회 중 오류가 발생했습니다.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [region, month]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const bySupply = matchOrAll(supplyFilters, item.supplyType);
        const byHousing = matchOrAll(housingFilters, item.housingType);
        const byStatus = matchOrAll(statusFilters, item.status);
        return bySupply && byHousing && byStatus;
      }),
    [items, supplyFilters, housingFilters, statusFilters]
  );

  const loadBlogs = async (item: CheongyakItem) => {
    if (blogs[item.id]) return;
    const query = `${item.houseName} 청약정보`;
    const response = await fetch(`/api/blog-search?query=${encodeURIComponent(query)}`);
    const data = (await response.json()) as { items?: BlogPost[] };
    setBlogs((prev) => ({ ...prev, [item.id]: data.items || [] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              독립형 MVP
            </p>
            <p className="text-xs text-slate-500">배포 준비 상태</p>
          </div>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">청약 공고 알리미</h1>
          <p className="mt-1 text-sm text-slate-600">
            지역별 청약 공고를 조회하고 관련 블로그 상위 3개를 바로 확인할 수 있습니다.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-slate-50 p-3">
              <p className="text-xs text-slate-500">선택 지역</p>
              <p className="text-base font-semibold">{region}</p>
            </div>
            <div className="rounded-lg border bg-slate-50 p-3">
              <p className="text-xs text-slate-500">조회 월</p>
              <p className="text-base font-semibold">{monthLabel(month)}</p>
            </div>
            <div className="rounded-lg border bg-slate-50 p-3">
              <p className="text-xs text-slate-500">필터 적용 결과</p>
              <p className="text-base font-semibold">{filteredItems.length}건</p>
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">지역</span>
              <select
                className="rounded-md border px-3 py-2"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">조회 월</span>
              <input
                className="rounded-md border px-3 py-2"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </label>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-sm font-semibold">공급유형</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {SUPPLY_FILTERS.map((value) => (
                  <label key={value} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={supplyFilters.includes(value)}
                      onChange={() => setSupplyFilters((prev) => toggleValue(prev, value))}
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">주거형태</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {HOUSING_FILTERS.map((value) => (
                  <label key={value} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={housingFilters.includes(value)}
                      onChange={() => setHousingFilters((prev) => toggleValue(prev, value))}
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">청약상태</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {STATUS_FILTERS.map((value) => (
                  <label key={value} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={statusFilters.includes(value)}
                      onChange={() => setStatusFilters((prev) => toggleValue(prev, value))}
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="rounded-md border bg-slate-50 px-3 py-2 text-sm font-medium hover:bg-slate-100"
              onClick={clearFilters}
            >
              필터 초기화
            </button>
          </div>
        </section>

        <section className="mb-3">
          <p className="text-sm text-slate-600">
            {monthLabel(month)} / {region} 검색 결과: {filteredItems.length}건
          </p>
        </section>

        {loading && <p className="rounded-md bg-white p-4 text-sm">데이터를 불러오는 중입니다...</p>}
        {error && <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!loading && !error && filteredItems.length === 0 && (
          <p className="rounded-md bg-white p-4 text-sm">조건에 맞는 공고가 없습니다.</p>
        )}

        <section className="mb-6 mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AD_SLOTS.map((ad) => (
            <article
              key={ad.title}
              className="rounded-xl border border-dashed border-slate-300 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold text-slate-500">광고</p>
              <h3 className="mt-1 text-base font-bold">{ad.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{ad.description}</p>
              <button className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-xs text-white">
                광고 문의
              </button>
            </article>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => {
            const isOpen = expandedCardId === item.id;
            const blogItems = blogs[item.id] || [];
            return (
              <article key={item.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-2 inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                  {item.status}
                </div>
                <h2 className="text-lg font-bold">{item.houseName}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.address || item.region}</p>
                <p className="mt-2 text-sm">공급유형: {item.supplyType}</p>
                <p className="text-sm">주거형태: {item.housingType}</p>
                <p className="text-sm">모집공고일: {item.noticeDate || "-"}</p>
                <p className="text-sm">
                  청약접수: {item.receiptStartDate || "-"} ~ {item.receiptEndDate || "-"}
                </p>
                <p className="text-sm">당첨자발표: {item.winnerDate || "-"}</p>
                <p className="text-sm">총 공급세대수: {item.totalSupplyHouseholdCount || 0}세대</p>

                <div className="mt-3 flex gap-2">
                  <a
                    className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
                    href={item.applyHomeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    청약홈 바로가기
                  </a>
                  <button
                    className="rounded-md border px-3 py-2 text-sm"
                    onClick={async () => {
                      if (!isOpen) await loadBlogs(item);
                      setExpandedCardId(isOpen ? null : item.id);
                    }}
                  >
                    관련 블로그 {isOpen ? "닫기" : "보기"}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 border-t pt-3">
                    <p className="mb-2 text-sm font-semibold">관련 블로그</p>
                    {blogItems.length === 0 ? (
                      <p className="text-sm text-slate-500">관련 글이 없습니다.</p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {blogItems.map((blog) => (
                          <li key={blog.link}>
                            <a
                              className="font-medium text-indigo-700 hover:underline"
                              href={blog.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {blog.title}
                            </a>
                            <p className="text-slate-500">
                              {blog.bloggerName} · {blog.postDate}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <footer className="mt-8 rounded-lg border bg-white p-4 text-xs text-slate-500">
          본 서비스는 공공데이터포털 및 네이버 검색 API 데이터를 기반으로 제공되며, 데이터 정확성과
          최종 자격 판단은 청약홈 공식 사이트에서 반드시 재확인해 주시기 바랍니다.
        </footer>
      </main>
    </div>
  );
}
