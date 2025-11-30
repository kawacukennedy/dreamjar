import { atom } from "recoil";

export interface UiState {
  theme: "light" | "dark";
  locale: "en" | "hi";
}

export const uiState = atom<UiState>({
  key: "uiState",
  default: {
    theme: "light",
    locale: "en",
  },
});
