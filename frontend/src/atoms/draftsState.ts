import { atom } from "recoil";
import localforage from "localforage";

export interface DraftWish {
  id: string;
  title: string;
  description: string;
  stakeAmount: string;
  deadline: string; // ISO8601
  proofMethod: "media" | "gps" | "github" | "strava" | "custom";
  visibility: "public" | "private" | "friends";
  category: string;
  lastModified: string; // ISO8601
}

export interface DraftsState {
  drafts: DraftWish[];
}

// Initialize localForage for drafts
const draftsStorage = localforage.createInstance({
  name: "dreamjar",
  storeName: "drafts",
});

export const draftsState = atom<DraftsState>({
  key: "draftsState",
  default: {
    drafts: [],
  },
  effects: [
    ({ setSelf, onSet }) => {
      // Load from localForage on initialization
      draftsStorage.getItem<DraftWish[]>("drafts").then((storedDrafts) => {
        if (storedDrafts) {
          setSelf({ drafts: storedDrafts });
        }
      });

      // Save to localForage when state changes
      onSet((newValue) => {
        draftsStorage.setItem("drafts", newValue.drafts);
      });
    },
  ],
});
