import React from 'react';
import { NavItemType } from './Sidebar';

interface BottomNavBarProps {
    items: NavItemType[];
    currentPage: string;
    setCurrentPage: (page: any) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ items, currentPage, setCurrentPage }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-sidebar-background border-t border-border/20 md:hidden z-50">
            <div className="flex justify-around items-center h-16">
                {items.map(item => (
                    <button
                        key={item.page}
                        onClick={() => setCurrentPage(item.page)}
                        className={`flex flex-col items-center justify-center w-full h-full text-xs transition-colors duration-200 ${
                            currentPage === item.page ? 'text-primary-400' : 'text-muted-foreground/80 hover:text-sidebar-foreground'
                        }`}
                    >
                        {/* FIX: Removed unnecessary type assertion as the icon type is now correctly inferred. */}
                        {React.cloneElement(item.icon, { className: 'w-6 h-6 mb-1' })}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNavBar;