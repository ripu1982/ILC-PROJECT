import React, { createContext, useContext, useEffect, useState } from 'react';
type User = { id: number; name?: string; email: string } | null;
const AuthContext = createContext<{
user: User;
setUser: (u: User) => void;
loading: boolean;
logout: () => Promise<void>;
}>({ user: null, setUser: () => {}, loading: true, logout: async () => {} });
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
children }) => {
const [user, setUser] = useState<User>(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
// on app load, try to fetch /api/auth/me

(async () => {
try {
const res = await fetch('/api/auth/me', { credentials: 'include' });
if (res.ok) {
const json = await res.json();
setUser(json);
}
} catch (e) {
// ignore
} finally {
setLoading(false);
}
})();
}, []);
const logout = async () => {
await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
setUser(null);
};
return (
<AuthContext.Provider value={{ user, setUser, loading, logout }}>
{children}
</AuthContext.Provider>
);
};
export const useAuth = () => useContext(AuthContext);