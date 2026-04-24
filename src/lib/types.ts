export type CheongyakStatus =
  | "접수 예정"
  | "접수 중"
  | "접수 마감"
  | "당첨자 발표";

export type SupplyType = "민간분양" | "공공분양" | "기타";

export interface CheongyakItem {
  id: string;
  houseName: string;
  region: string;
  address: string;
  noticeDate: string;
  receiptStartDate: string;
  receiptEndDate: string;
  winnerDate: string;
  supplyType: SupplyType;
  housingType: string;
  supplyMethod: string;
  qualifications: string[];
  totalSupplyHouseholdCount: number;
  applyHomeUrl: string;
  status: CheongyakStatus;
  sourceApi: string;
}

export interface BlogPost {
  title: string;
  link: string;
  description: string;
  postDate: string;
  bloggerName: string;
}
