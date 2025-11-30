import { atom } from "recoil";

export interface UserAuthState {
  walletConnected: boolean;
  walletAddress: string | null;
  sessionJWT: string | null;
  tokenExpiry: Date | null;
}

export const userAuthState = atom<UserAuthState>({
  key: "userAuthState",
  default: {
    walletConnected: false,
    walletAddress: null,
    sessionJWT: null,
    tokenExpiry: null,
  },
});
