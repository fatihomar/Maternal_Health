import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, LayoutDashboard, Users, UserRound, CalendarHeart, FileClock } from 'lucide-react';

const Sidebar = () => {
  const role = localStorage.getItem('role') || 'Admin';

  const allMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['Admin'] },
    { name: 'Patients', icon: Users, path: '/patients', roles: ['Admin'] },
    { name: 'Appointments', icon: CalendarHeart, path: '/appointments', roles: ['Admin', 'Patient'] },
    { name: 'Risk Prediction', icon: Activity, path: '/vitals/add', roles: ['Admin'] },
    { name: 'Medical Records', icon: FileClock, path: '/vitals/history', roles: ['Admin', 'Patient'] },
    { name: 'My Status', icon: LayoutDashboard, path: '/', roles: ['Patient'] },
    { name: 'Submit Vitals', icon: Activity, path: '/vitals/add', roles: ['Patient'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  return (
    <div className="h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 pt-16 transition-colors duration-300">
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400 shadow-sm border border-medical-100 dark:border-medical-800/50'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      
      {/* Clinic Branding at Bottom */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-medical-100 dark:bg-medical-900/40 flex items-center justify-center text-medical-600 dark:text-medical-400 font-bold">
            MH
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Maternal Health</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Clinic System v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
