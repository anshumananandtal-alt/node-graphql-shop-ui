import { useEffect, useState } from "react";
import {
  clearSession,
  getSessionExpiry,
  hasValidSession,
} from "../utils/session";

function useSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasValidSession);

  useEffect(() => {
    const refreshSession = () => setIsAuthenticated(hasValidSession());
    window.addEventListener("storage", refreshSession);

    return () => window.removeEventListener("storage", refreshSession);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const expiry = getSessionExpiry();
    if (!expiry) {
      clearSession();
      setIsAuthenticated(false);
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      clearSession();
      setIsAuthenticated(false);
    }, Math.max(expiry - Date.now(), 0));

    return () => window.clearTimeout(timeout);
  }, [isAuthenticated]);

  return isAuthenticated;
}

export default useSession;
