import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  ArrowRight, 
  UserCheck, 
  Lock, 
  Mail, 
  ShieldAlert, 
  Info,
  GraduationCap,
  Store,
  ChefHat,
  Zap,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const promptMessage = location.state?.message || '';
  const redirectTarget = location.state?.from || null;
  const { login, isAuthenticated, role } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'vendors'
  const [lastFilledId, setLastFilledId] = useState(null);

  // If already authenticated, route automatically based on role or return path
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'vendor') {
        navigate('/vendor', { replace: true });
      } else if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, redirectTarget]);

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
      } else if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
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
    setLastFilledId(demoId);
    setTimeout(() => setLastFilledId(null), 2000);
  };

  const handleDirectDemoLogin = async (demoId, demoPass) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    const res = await login(demoId, demoPass);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'vendor') {
        navigate('/vendor', { replace: true });
      } else if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } else {
      setError(res.message || 'Invalid credentials.');
    }
  };

  const studentDemos = [
    {
      id: '12204891',
      name: 'Aarav Sharma',
      badge: 'B.Tech CSE • Block 34',
      highlight: 'Primary demo account with active past order',
      roll: '12204891',
    },
    {
      id: '12204892',
      name: 'Simran Kaur',
      badge: 'MBA • Mittal School (MSB)',
      highlight: 'Lecture break ordering & quick pickup',
      roll: '12204892',
    },
    {
      id: '12204893',
      name: 'Rohan Verma',
      badge: 'Hosteller • BH-2 Complex',
      highlight: 'Late evening dining & hostel food courts',
      roll: '12204893',
    },
  ];

  const vendorDemos = [
    {
      court: 'Campus Café',
      courtBadge: 'Main Gate Hub',
      vendors: [
        {
          id: 'vendor1@unibites.app',
          name: 'The Belgian Waffle Co.',
          spot: 'Campus Café Kiosk #01',
          cuisine: 'Warm Waffles, Sundaes & Shakes',
          email: 'vendor1@unibites.app',
        },
        {
          id: 'vendor.wowchina@unibites.app',
          name: 'WOW! China',
          spot: 'Campus Café Kiosk #03',
          cuisine: 'Hakka Noodles, Momos, Fried Rice',
          email: 'vendor.wowchina@unibites.app',
        },
      ],
    },
    {
      court: 'BH-2 Apartment Side Food Court',
      courtBadge: 'Hostel & Apartments Hub',
      vendors: [
        {
          id: 'vendor.hangouts@unibites.app',
          name: 'Hangouts South Indian',
          spot: 'BH-2 Food Court',
          cuisine: 'Masala Dosa, Ghee Roast, Vada',
          email: 'vendor.hangouts@unibites.app',
        },
        {
          id: 'vendor.shahji@unibites.app',
          name: "Shahji's Amritsari Kulcha",
          spot: 'BH-2 Food Court',
          cuisine: 'Stuffed Kulchas with Chole & Nutri',
          email: 'vendor.shahji@unibites.app',
        },
      ],
    },
    {
      court: 'Behind 34 Block Food Court',
      courtBadge: 'Block 34 Hub',
      vendors: [
        {
          id: 'vendor.khaopiyo@unibites.app',
          name: 'Khao Piyo (Pav Bhaji & Bhature)',
          spot: 'Behind Block 34',
          cuisine: 'Amul Butter Pav Bhaji, Chole Bhature',
          email: 'vendor.khaopiyo@unibites.app',
        },
        {
          id: 'vendor.chaap@unibites.app',
          name: 'The Chaap Express',
          spot: 'Behind Block 34',
          cuisine: 'Afghani Malai & Tandoori Chaap',
          email: 'vendor.chaap@unibites.app',
        },
      ],
    },
    {
      court: 'Academic Block Rooftop Canteens',
      courtBadge: '100-Seat Dining Halls',
      vendors: [
        {
          id: 'vendor2@unibites.app',
          name: 'Block 14 Canteen (MSB)',
          spot: 'Block 14 Ground Floor',
          cuisine: 'Breakfast Poha, Samosa, Thalis',
          email: 'vendor2@unibites.app',
        },
        {
          id: 'vendor.b34canteen@unibites.app',
          name: 'Block 34 Canteen',
          spot: 'Block 34 Ground Floor Atrium',
          cuisine: 'Hakka Noodles, Samosa Chaat, Thalis',
          email: 'vendor.b34canteen@unibites.app',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF6EC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
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
        <div className="bg-white py-8 px-6 sm:px-9 rounded-card border border-border shadow-soft">
          
          <div className="mb-5">
            <h2 className="font-serif font-bold text-xl text-text">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Enter your student roll number or food court vendor email
            </p>
          </div>

          {promptMessage && (
            <div className="mb-5 p-3.5 bg-accent/20 border border-accent/60 rounded-xl text-xs font-semibold text-text flex items-start gap-2.5 animate-fadeIn">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-primary">Sign In First: </span>
                {promptMessage}
              </div>
            </div>
          )}

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
                  placeholder="e.g. 12204891 or vendor1@unibites.app"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-surface-alt border rounded-xl text-sm text-text focus:outline-none focus:bg-white focus:border-primary transition-colors ${
                    lastFilledId ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
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
                  placeholder="Enter password (demo accounts: demo123)"
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
          <div className="mt-5 pt-4 border-t border-border text-center">
            <p className="text-xs text-text-muted">
              New to UniBites?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create student account
              </Link>
            </p>
          </div>

          {/* Enhanced Autofill & Demo Sign-In Section */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-accent fill-accent" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text">
                  Instant Demo Autofill
                </span>
              </div>
              <span className="text-[11px] font-mono text-text-muted">
                Password: <strong className="text-primary font-bold">demo123</strong>
              </span>
            </div>

            {/* Role Tabs */}
            <div className="flex items-center p-1 bg-surface-alt rounded-xl border border-border mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === 'students'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Students (3)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vendors')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === 'vendors'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Food Court & Canteen Vendors (8)</span>
              </button>
            </div>

            {/* Tab 1: Student Accounts */}
            {activeTab === 'students' && (
              <div className="space-y-2.5 animate-fadeIn">
                {studentDemos.map((s) => {
                  const isFilled = lastFilledId === s.roll;
                  return (
                    <div
                      key={s.id}
                      className="p-3 bg-white rounded-xl border border-border hover:border-primary/40 transition-colors shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-text">{s.name}</p>
                          <span className="px-1.5 py-0.5 rounded bg-accent/20 text-text font-mono text-[10px] font-bold">
                            Roll: {s.roll}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {s.badge} • <span className="italic">{s.highlight}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleFillDemo(s.roll, 'demo123')}
                          className="px-2.5 py-1 text-[11px] font-mono font-bold bg-surface-alt hover:bg-border text-text rounded-lg transition-colors flex items-center gap-1"
                        >
                          {isFilled ? <Check className="w-3 h-3 text-success" /> : null}
                          <span>{isFilled ? 'Filled' : 'Fill'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectDemoLogin(s.roll, 'demo123')}
                          disabled={loading}
                          className="px-2.5 py-1 text-[11px] font-mono font-bold bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors flex items-center gap-1 shadow-soft"
                        >
                          <span>Sign In</span>
                          <ArrowRight className="w-3 h-3 text-accent" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Food Court Vendor Accounts */}
            {activeTab === 'vendors' && (
              <div className="space-y-4 animate-fadeIn">
                {vendorDemos.map((group) => (
                  <div key={group.court} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-serif font-bold text-text">
                        {group.court}
                      </span>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {group.courtBadge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {group.vendors.map((v) => {
                        const isFilled = lastFilledId === v.email;
                        return (
                          <div
                            key={v.id}
                            className="p-3 bg-white rounded-xl border border-border hover:border-primary/40 transition-colors shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-xs text-text">{v.name}</p>
                                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                                  {v.spot}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-text-muted mt-0.5 truncate">
                                {v.email}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleFillDemo(v.email, 'demo123')}
                                className="px-2.5 py-1 text-[11px] font-mono font-bold bg-surface-alt hover:bg-border text-text rounded-lg transition-colors flex items-center gap-1"
                              >
                                {isFilled ? <Check className="w-3 h-3 text-success" /> : null}
                                <span>{isFilled ? 'Filled' : 'Fill'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDirectDemoLogin(v.email, 'demo123')}
                                disabled={loading}
                                className="px-2.5 py-1 text-[11px] font-mono font-bold bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors flex items-center gap-1 shadow-soft"
                              >
                                <span>Terminal</span>
                                <ArrowRight className="w-3 h-3 text-accent" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
