import { atom } from "recoil";

export interface WishItem {
  id: string;
  title: string;
  description: string;
  pledgeTotal: number;
  deadline: Date;
  status: string;
}

export interface FeedState {
  paginatedFeed: {
    items: WishItem[];
    nextCursor: string | null;
  };
}

export const feedState = atom<FeedState>({
  key: "feedState",
  default: {
    paginatedFeed: {
      items: [],
      nextCursor: null,
    },
  },
});
