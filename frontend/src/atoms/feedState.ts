import { atom } from "recoil";

export interface WishItem {
  id: string;
  title: string;
  description: string;
  pledgeTotal: number;
  deadline: string; // ISO8601
  status: string;
  creator: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface FeedState {
  items: WishItem[];
  nextCursor: string;
}

export const feedState = atom<FeedState>({
  key: "feedState",
  default: {
    items: [],
    nextCursor: "",
  },
});
