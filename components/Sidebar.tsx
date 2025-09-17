import React from 'react';
import { Page } from '../types';

export interface NavItemType {
  page: string;
  label: string;
  // FIX: Update icon prop type to allow cloning with a className prop, resolving TypeScript error.
  icon: React.ReactElement<{ className?: string }>;
}

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: any) => void;
  navItems: NavItemType[];
  title: string;
}

const NavItem: React.FC<{
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors duration-200 ${
        isActive ? 'bg-primary-700 text-white' : ''
      }`}
    >
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
      <span className="ml-3">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, navItems, title }) => {
  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="overflow-y-auto h-full py-4 px-3 bg-sidebar-background text-sidebar-foreground flex flex-col">
        <div className="flex items-center pl-2.5 mb-5 h-16">
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">{title}</span>
        </div>
        <ul className="space-y-2 flex-grow">
          {navItems.map((item) => (
            <NavItem
              key={item.page}
              icon={item.icon}
              label={item.label}
              isActive={currentPage === item.page}
              onClick={() => setCurrentPage(item.page)}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;