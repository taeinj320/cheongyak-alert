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
    return NextResponse.json(
      { error: `네이버 API 실패: ${response.status}` },
      { status: 500 }
    );
  }

  const data = (await response.json()) as {
    items?: Array<Record<string, string>>;
  };

  const items: BlogPost[] = (data.items || []).map((item) => ({
    title: removeHtml(item.title || ""),
    link: item.link || "",
    description: removeHtml(item.description || ""),
    postDate: formatPostDate(item.postdate || ""),
    bloggerName: item.bloggername || "",
  }));

  return NextResponse.json({ items });
}
