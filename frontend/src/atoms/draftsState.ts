import { atom } from "recoil";

export interface DraftWish {
  id: string;
  title: string;
  description: string;
  stakeAmount: number;
  deadline: Date;
  proofMethod: string;
  visibility: string;
  categoryTags: string[];
  lastModified: Date;
}

export interface DraftsState {
  drafts: DraftWish[];
}

export const draftsState = atom<DraftsState>({
  key: "draftsState",
  default: {
    drafts: [],
  },
});
