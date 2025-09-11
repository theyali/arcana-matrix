import React from "react";
import { api } from "../api/client";

const AuthCtx = React.createContext(null);
export function useAuth(){ return React.useContext(AuthCtx); }

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    (async()=>{
      try {
        const me = await api.me();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  },[]);

  const login = async (identifier, password) => {
    await api.login({ identifier, password });
    const me = await api.me();
    setUser(me);
  };

  const register = async (email, password, username) => {
    const u = await api.register({ email, password, username });
    setUser(u);
  };

  const logout = () => { api.logout(); setUser(null); };

  const value = { user, loading, login, register, logout };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
