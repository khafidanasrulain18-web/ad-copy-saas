import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await authApi.login(email, password);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }

  // Register TIDAK langsung set token/user — akun masih perlu diverifikasi dulu
  async function register(email, password) {
    const res = await authApi.register(email, password);
    return res.data; // { email, requiresVerification, ... }
  }

  // Dipanggil setelah OTP berhasil diverifikasi
  function completeVerification(token, verifiedUser) {
    localStorage.setItem('token', token);
    setUser(verifiedUser);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, completeVerification, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}