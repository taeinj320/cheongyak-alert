import { NextRequest, NextResponse } from "next/server";
import { BlogPost } from "@/lib/types";

export const revalidate = 21600;

function formatPostDate(value: string): string {
  if (!value || value.length !== 8) return value;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function removeHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

function buildQueryCandidates(rawQuery: string): string[] {
  const base = rawQuery.replace(/\s*청약정보\s*$/u, "").trim();
  const candidates = [rawQuery, `${base} 청약`, `${base} 분양`, `${base} 분양 후기`];
  return Array.from(new Set(candidates.map((item) => item.trim()).filter(Boolean)));
}

async function searchOneQuery(
  query: string,
  clientId: string,
  clientSecret: string
): Promise<BlogPost[]> {
  const apiUrl = new URL("https://openapi.naver.com/v1/search/blog.json");
  apiUrl.searchParams.set("query", query);
  apiUrl.searchParams.set("display", "3");
  apiUrl.searchParams.set("sort", "sim");

  const response = await fetch(apiUrl.toString(), {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    next: { revalidate: 21600 },
  });

  if (!response.ok) {
    throw new Error(`네이버 API 실패: ${response.status}`);
  }

  const data = (await response.json()) as {
    items?: Array<Record<string, string>>;
  };

  return (data.items || []).map((item) => ({
    title: removeHtml(item.title || ""),
    link: item.link || "",
    description: removeHtml(item.description || ""),
    postDate: formatPostDate(item.postdate || ""),
    bloggerName: item.bloggername || "",
  }));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "query 파라미터가 필요합니다." }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      warning:
        "NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 설정이 없어 블로그 검색을 비활성화했습니다.",
      items: [],
    });
  }

  try {
    const candidates = buildQueryCandidates(query);
    const merged: BlogPost[] = [];
    const linkSet = new Set<string>();

    for (const candidate of candidates) {
      const posts = await searchOneQuery(candidate, clientId, clientSecret);
      for (const post of posts) {
        if (!post.link || linkSet.has(post.link)) continue;
        linkSet.add(post.link);
        merged.push(post);
        if (merged.length >= 3) {
          return NextResponse.json({ items: merged });
        }
      }
    }

    return NextResponse.json({ items: merged });
  } catch (error) {
    const message = error instanceof Error ? error.message : "네이버 API 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
