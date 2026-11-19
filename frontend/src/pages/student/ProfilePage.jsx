import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, MapPin, Mail, Shield, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import Button from '../../components/ui/Button';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedLocation } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn pb-24">
      
      <div className="border-b border-border pb-3">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text">
          Student Profile
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Your campus account and pre-order settings
        </p>
      </div>

      <div className="bg-white rounded-card border border-border shadow-soft p-6 space-y-6">
        
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-serif font-bold text-2xl shadow-soft">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-text">
              {user?.name || 'Aarav Sharma'}
            </h2>
            <p className="text-xs font-mono font-bold text-primary mt-0.5">
              Roll No: {user?.rollNumber || '12204891'}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-success/15 text-success uppercase">
              Verified Student
            </span>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-alt">
            <span className="text-text-muted flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>Campus Email:</span>
            </span>
            <span className="font-bold text-text">{user?.email || 'student@unibites.app'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-alt">
            <span className="text-text-muted flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Current Block:</span>
            </span>
            <span className="font-bold text-text">{selectedLocation}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-alt">
            <span className="text-text-muted flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Account Role:</span>
            </span>
            <span className="font-bold text-text uppercase">{user?.role || 'STUDENT'}</span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-2">
          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Campus Dining</span>
          </Button>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
