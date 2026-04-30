import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a12', padding: 20 }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(34,211,164,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #22d3a4, #6c63ff)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="white" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="white" strokeWidth="2"/></svg>
          </div>
          <h1 style={{ fontSize: 28, color: '#e8e8f5', marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: '#5a5a8a', fontSize: 14 }}>Join your team workspace</p>
        </div>

        <div style={{ background: '#14142a', border: '1.5px solid #2a2a4a', borderRadius: 18, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#9090b8', marginBottom: 6, fontWeight: 500 }}>Full Name</label>
              <input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#9090b8', marginBottom: 6, fontWeight: 500 }}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#9090b8', marginBottom: 6, fontWeight: 500 }}>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#9090b8', marginBottom: 6, fontWeight: 500 }}>Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['member', 'admin'].map(r => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                    style={{
                      padding: '10px', borderRadius: 10, border: `1.5px solid ${form.role === r ? '#6c63ff' : '#2a2a4a'}`,
                      background: form.role === r ? 'rgba(108,99,255,0.15)' : 'transparent',
                      color: form.role === r ? '#a78bfa' : '#5a5a8a', fontWeight: 500, fontSize: 14, textTransform: 'capitalize', transition: 'all 0.2s'
                    }}>
                    {r === 'admin' ? '👑 Admin' : '👤 Member'}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#5a5a8a', marginTop: 6 }}>
                {form.role === 'admin' ? 'Can create projects and assign tasks' : 'Can view and update assigned tasks'}
              </p>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: loading ? '#2a2a4a' : 'linear-gradient(135deg, #22d3a4, #6c63ff)', color: 'white', borderRadius: 10, fontWeight: 600, fontSize: 15, fontFamily: 'Syne', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#5a5a8a', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
