import { atom } from "recoil";

export interface UserAuthState {
  walletConnected: boolean;
  walletAddress: string;
  sessionJWT: string;
  tokenExpiry: string; // ISO8601
}

export const userAuthState = atom<UserAuthState>({
  key: "userAuthState",
  default: {
    walletConnected: false,
    walletAddress: "",
    sessionJWT: "",
    tokenExpiry: "",
  },
});
