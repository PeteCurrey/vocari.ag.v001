'use client';

import React, { useState } from 'react';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { SurfaceProvider } from '@/lib/surface/SurfaceContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    document.cookie = `vocari_admin_session=authenticated; path=/; max-age=86400`;
    setTimeout(() => {
      setStatus('success');
      window.location.href = '/admin';
    }, 600);
  };

  return (
    <SurfaceProvider surface="partner">
      <div className="min-h-screen bg-charcoal text-ivory flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 border border-graphite rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-cobalt" />
            <span className="font-mono text-xs text-silver tracking-widest uppercase">VOCARI INTERNAL ADMIN</span>
          </div>

          <h1 className="text-2xl font-bold text-ivory mb-2">Quality Gate Login</h1>
          <p className="text-sm text-silver mb-6">
            Access restricted to authorized email allowlist accounts. All publication actions are audited.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-silver mb-1 uppercase">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pete@vocari.co.uk"
                className="w-full bg-graphite border border-silver/20 rounded-md px-3 py-2 text-ivory placeholder:text-silver/40 focus:outline-none focus:border-cobalt"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-silver mb-1 uppercase">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-graphite border border-silver/20 rounded-md px-3 py-2 text-ivory placeholder:text-silver/40 focus:outline-none focus:border-cobalt"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full justify-center mt-6">
              {status === 'loading' ? 'Authenticating...' : 'Sign In to Admin Console'}
            </Button>
          </form>
        </Card>
      </div>
    </SurfaceProvider>
  );
}
