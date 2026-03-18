import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kova_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kova_token');
    if (token) {
      authApi.me().then(r => {
        setUser(r.data.user);
        localStorage.setItem('kova_user', JSON.stringify(r.data.user));
      }).catch(() => {
        localStorage.removeItem('kova_token');
        localStorage.removeItem('kova_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await authApi.login({ email, password });
    localStorage.setItem('kova_token', r.data.token);
    localStorage.setItem('kova_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data;
  };

  const register = async (name, email, password) => {
    const r = await authApi.register({ name, email, password });
    localStorage.setItem('kova_token', r.data.token);
    localStorage.setItem('kova_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data;
  };

  const logout = () => {
    localStorage.removeItem('kova_token');
    localStorage.removeItem('kova_user');
    setUser(null);
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem('kova_user', JSON.stringify(u));
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
