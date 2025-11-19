import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
const Login = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const navigate = useNavigate();
const { setUser } = useAuth();
const submit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true); setError(null);
try {
const res = await fetch('/api/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },

body: JSON.stringify({ email, password }),
credentials: 'include',
});
const data = await res.json();
if (!res.ok) throw new Error(data.message || 'Login failed');
setUser(data); // save user in context
navigate('/'); // redirect to dashboard
} catch (err) {
setError(err.message);
} finally {
setLoading(false);
}
};
return (
<div className="min-h-screen flex items-center justify-center bg-gradientto-br from-slate-50 to-white">
<div className="max-w-md w-full bg-card shadow-lg p-8 rounded-2xl">
<h2 className="text-2xl font-bold mb-2 text-foreground">Welcome back</
h2>
<p className="text-sm text-muted-foreground mb-6">Sign in to access
your dashboard</p>
<form onSubmit={submit} className="space-y-4">
<div>
<label className="block text-sm font-medium mb-1">Email</label>
<input
type="email"
required
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full rounded-md border px-3 py-2"
placeholder="you@company.com"
/>
</div>
<div>
<label className="block text-sm font-medium mb-1">Password</label>
<input
type="password"
required
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full rounded-md border px-3 py-2"
placeholder="Your password"
/>
</div>

{error && <div className="text-sm text-destructive">{error}</div>}
<button
type="submit"
disabled={loading}
className="w-full mt-2 py-2 rounded-lg bg-gradient-primary textwhite font-semibold hover:opacity-95"
>
{loading ? 'Signing in...' : 'Sign in'}
</button>
</form>
<div className="mt-6 text-center text-sm text-muted-foreground">
Need an account? <a className="text-primary underline"
href="#">Register</a>
</div>
</div>
</div>
);
};
export default Login;