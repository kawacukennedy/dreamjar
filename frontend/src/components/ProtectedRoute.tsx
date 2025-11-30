import { ReactNode } from "react";
import { useRecoilValue } from "recoil";
import { userAuthState } from "../atoms/userAuthState";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { walletConnected } = useRecoilValue(userAuthState);

  if (requireAuth && !walletConnected) {
    // Redirect to connect wallet or show message
    return <div>Please connect your wallet to access this page.</div>;
  }

  return <>{children}</>;
};
