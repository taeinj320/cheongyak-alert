"use client";

import { useMemo, useState } from "react";

interface BenefitItem {
  id: string;
  title: string;
  region: string;
  category: string;
  target: string;
  description: string;
  link: string;
}

const BENEFIT_DATA: BenefitItem[] = [
  {
    id: "benefit-1",
    title: "서울시 청년 월세 지원",
    region: "서울",
    category: "주거",
    target: "청년",
    description: "소득 기준 충족 청년 대상 월세 일부를 지원합니다.",
    link: "https://youth.seoul.go.kr",
  },
  {
    id: "benefit-2",
    title: "경기도 신혼부부 전세자금 대출이자 지원",
    region: "경기",
    category: "주거",
    target: "신혼부부",
    description: "경기도 거주 신혼부부 대상 전세자금 이자 일부를 지원합니다.",
    link: "https://www.gg.go.kr",
  },
  {
    id: "benefit-3",
    title: "부산 청년 교통비 지원",
    region: "부산",
    category: "생활",
    target: "청년",
    description: "대중교통 이용 실적에 따라 교통비를 환급해 주는 사업입니다.",
    link: "https://www.busan.go.kr",
  },
  {
    id: "benefit-4",
    title: "대구 출산가정 양육지원금",
    region: "대구",
    category: "육아",
    target: "가정",
    description: "출산 가정의 초기 양육 부담 완화를 위한 지원금 제도입니다.",
    link: "https://www.daegu.go.kr",
  },
  {
    id: "benefit-5",
    title: "광주 소상공인 정책자금 지원",
    region: "광주",
    category: "일자리",
    target: "소상공인",
    description: "운영자금 및 시설자금 융자 프로그램을 제공합니다.",
    link: "https://www.gwangju.go.kr",
  },
  {
    id: "benefit-6",
    title: "전국 청약 공고 알리미",
    region: "전국",
    category: "주거",
    target: "예비청약자",
    description: "지역과 월 기준으로 최신 청약 공고와 관련 정보를 확인할 수 있습니다.",
    link: "/cheongyak",
  },
];

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "전국"];
const CATEGORIES = ["전체", "주거", "생활", "육아", "일자리"];

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("전체");
  const [category, setCategory] = useState("전체");

  const filtered = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    return BENEFIT_DATA.filter((item) => {
      const byRegion = region === "전체" || item.region === region;
      const byCategory = category === "전체" || item.category === category;
      const byKeyword =
        !lower ||
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.target.toLowerCase().includes(lower);
      return byRegion && byCategory && byKeyword;
    });
  }, [keyword, region, category]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            우리동네 혜택 알리미
          </p>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">지역 혜택 검색</h1>
          <p className="mt-1 text-sm text-slate-600">
            지역별 혜택 정보를 검색하고, 청약 공고 페이지와 함께 하나의 사이트에서 이용할 수 있습니다.
          </p>
        </header>

        <section className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block font-semibold">검색어</span>
              <input
                className="w-full rounded-md border px-3 py-2"
                placeholder="예: 청년, 전세, 교통비"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold">지역</span>
              <select
                className="w-full rounded-md border px-3 py-2"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold">카테고리</span>
              <select
                className="w-full rounded-md border px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="mb-3 text-sm text-slate-600">검색 결과: {filtered.length}건</section>

        <section className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.region}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                  {item.category}
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700">
                  {item.target}
                </span>
              </div>
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <a
                href={item.link}
                className="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
                target={item.link.startsWith("http") ? "_blank" : "_self"}
                rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                자세히 보기
              </a>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
