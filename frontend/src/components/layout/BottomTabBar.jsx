import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Clock, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BottomTabBar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/break-planner', label: 'Planner', icon: Sparkles },
    { to: '/orders', label: 'Orders', icon: Clock },
    { 
      to: isAuthenticated ? '/profile' : '/login', 
      label: isAuthenticated ? 'Profile' : 'Sign In', 
      icon: isAuthenticated ? User : LogIn 
    },
  ];

  const handleTabClick = (e, tab) => {
    if (!isAuthenticated && tab.to !== '/home') {
      e.preventDefault();
      navigate('/login', {
        state: {
          message: `Please sign in first to access ${tab.label}.`,
          from: tab.to,
        },
      });
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-card pb-safe">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              onClick={(e) => handleTabClick(e, tab)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 select-none transition-colors ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-text-muted hover:text-text'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
