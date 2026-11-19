import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, Clock, User } from 'lucide-react';

const BottomTabBar = () => {
  const tabs = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/break-planner', label: 'Planner', icon: Sparkles },
    { to: '/orders', label: 'Orders', icon: Clock },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-card pb-safe">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
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
