import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      {/* Sidebar is fixed width 64 (16rem) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        
        {/* Content Box below Header */}
        <main className="flex-1 mt-16 p-8">
          <div className="max-w-7xl mx-auto">
            {/* The individual page content gets injected here via React Router */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
