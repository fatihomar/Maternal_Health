import React, { useState, useRef, useEffect } from 'react';
import { Bell, HeartPulse, Search, User, Settings, Moon, Sun, LogOut } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import NotificationsModal from '../components/NotificationsModal';

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });
  
  const profileRef = useRef(null);
  
  const role = localStorage.getItem('role') || 'Visitor';
  const userName = localStorage.getItem('user_name') || 'User';
  
  // Get initial for avatar
  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('patient_id');
    window.location.href = '/login';
  };

  return (
    <>
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-0 right-0 left-64 flex items-center justify-between px-8 z-10 transition-colors duration-300">
      
      {/* Title / Logo context */}
      <div className="flex items-center gap-2">
        <HeartPulse className="text-medical-600 dark:text-medical-400" size={24} />
        <h1 className="text-xl font-bold bg-gradient-to-r from-medical-600 to-medical-400 bg-clip-text text-transparent">
          MHI System
        </h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">

        
        <button 
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 text-slate-400 hover:text-medical-600 transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-slate-900"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-8 w-8 rounded-full bg-medical-600 text-white flex items-center justify-center font-bold text-sm shadow-md hover:bg-medical-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500"
          >
            {role === 'Admin' ? 'Dr' : initial}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-2 animate-fade-in z-50 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{role}</p>
              </div>
              
              <div className="py-1">
                <button 
                  onClick={() => { setIsProfileModalOpen(true); setIsProfileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-medical-50 dark:hover:bg-slate-700 hover:text-medical-600 dark:hover:text-medical-400 flex items-center gap-2 transition-colors"
                >
                  <User size={16} /> My Profile
                </button>
                <button 
                  onClick={() => { setIsDarkMode(!isDarkMode); setIsProfileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-medical-50 dark:hover:bg-slate-700 hover:text-medical-600 dark:hover:text-medical-400 flex items-center gap-2 transition-colors"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-700 py-1">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </header>
    
    <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
};

export default Header;
