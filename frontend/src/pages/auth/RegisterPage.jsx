import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !rollNumber.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await register({
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
    });

    setLoading(false);

    if (res.success) {
      navigate('/home', { replace: true });
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6EC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-soft mb-3">
            <UtensilsCrossed className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-serif font-black text-3xl text-primary tracking-tight">
            UniBites
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-text-muted mt-1 font-bold">
            Create Student Account
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 rounded-card border border-border shadow-soft">
          
          {error && (
            <div className="mb-5 p-3.5 bg-danger/10 border border-danger/30 rounded-xl text-xs font-medium text-danger flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-text uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-sm text-text focus:outline-none focus:bg-white focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-text uppercase mb-1">
                University Roll Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 12204891"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-sm text-text focus:outline-none focus:bg-white focus:border-primary transition-colors uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-text uppercase mb-1">
                Campus Email *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. aarav@unibites.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-sm text-text focus:outline-none focus:bg-white focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-text uppercase mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-sm text-text focus:outline-none focus:bg-white focus:border-primary transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-text uppercase mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Create secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-sm text-text focus:outline-none focus:bg-white focus:border-primary transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
