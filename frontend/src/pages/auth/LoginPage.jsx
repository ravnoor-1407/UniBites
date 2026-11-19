import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, UserCheck, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, route automatically based on role
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'vendor') {
        navigate('/vendor', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your roll number or email, and password.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await login(identifier.trim(), password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'vendor') {
        navigate('/vendor', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } else {
      setError(res.message || 'Invalid credentials.');
    }
  };

  const handleFillDemo = (demoId, demoPass) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FBF6EC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-soft mb-3">
            <UtensilsCrossed className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-serif font-black text-3xl text-primary tracking-tight">
            UniBites
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-text-muted mt-1 font-bold">
            Campus Food Pre-Ordering System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-card border border-border shadow-soft">
          
          <div className="mb-6">
            <h2 className="font-serif font-bold text-xl text-text">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Enter your student roll number or canteen vendor email
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-danger/10 border border-danger/30 rounded-xl text-xs font-medium text-danger flex items-start gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-text uppercase mb-1.5">
                Roll Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 12204891 or vendor@unibites.app"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-sm text-text focus:outline-none focus:bg-white focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-text uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-sm text-text focus:outline-none focus:bg-white focus:border-primary transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Create student account link */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-text-muted">
              New to UniBites?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create student account
              </Link>
            </p>
          </div>

          {/* Small Demo Accounts Box */}
          <div className="mt-6 p-3.5 bg-surface-alt rounded-xl border border-border">
            <div className="flex items-center gap-1.5 mb-2.5">
              <UserCheck className="w-4 h-4 text-accent" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text">
                Demo Accounts
              </span>
            </div>
            
            <div className="space-y-2 text-xs">
              {/* Student */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-border/70">
                <div className="min-w-0">
                  <p className="font-bold text-text truncate">Student</p>
                  <p className="text-[11px] font-mono text-text-muted truncate">Roll: 12204891</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillDemo('12204891', 'demo123')}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold bg-surface-alt hover:bg-border text-text rounded-md transition-colors"
                >
                  Fill
                </button>
              </div>

              {/* Vendor 1 */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-border/70">
                <div className="min-w-0">
                  <p className="font-bold text-text truncate">Belgian Waffle Co.</p>
                  <p className="text-[11px] font-mono text-text-muted truncate">vendor1@unibites.app</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillDemo('vendor1@unibites.app', 'demo123')}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold bg-surface-alt hover:bg-border text-text rounded-md transition-colors"
                >
                  Fill
                </button>
              </div>

              {/* Vendor 2 */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-border/70">
                <div className="min-w-0">
                  <p className="font-bold text-text truncate">Block 14 Canteen (MSB)</p>
                  <p className="text-[11px] font-mono text-text-muted truncate">vendor2@unibites.app</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillDemo('vendor2@unibites.app', 'demo123')}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold bg-surface-alt hover:bg-border text-text rounded-md transition-colors"
                >
                  Fill
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
