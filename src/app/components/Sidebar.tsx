import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    LogOut,
    User,
    GraduationCap,
    ShieldCheck,
    X
} from 'lucide-react';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = user?.role === 'student' ? [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
        { name: 'My Courses', icon: BookOpen, path: '/student' },
    ] : [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/lecturer' },
        { name: 'My Classes', icon: BookOpen, path: '/lecturer' },
    ];

    const handleNavClick = (path: string) => {
        navigate(path);
        onClose?.();
    };

    const sidebarContent = (
        <div className="w-64 bg-ttu-navy h-full flex flex-col text-white shadow-xl">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-ttu-navy-light flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                    <img src="/assets/ttu-logo.png" alt="TTU" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                    <h1 className="font-bold text-lg leading-tight text-white">SmartAttend</h1>
                    <p className="text-xs text-ttu-navy-light uppercase tracking-widest font-semibold">TTU Portal</p>
                </div>
                {/* Close button — visible only on mobile */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={index}
                            onClick={() => handleNavClick(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-white/10 text-white font-semibold'
                                : 'text-ttu-navy-light hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-ttu-navy-light group-hover:text-white'}`} />
                            <span>{item.name}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
                        </button>
                    );
                })}
            </nav>

            {/* User Area */}
            <div className="p-4 mt-auto">
                <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-ttu-navy-light to-white/20 flex items-center justify-center border border-white/10">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
                            <div className="flex items-center gap-1">
                                {user?.role === 'lecturer' ? (
                                    <ShieldCheck className="w-3 h-3 text-green-400" />
                                ) : (
                                    <GraduationCap className="w-3 h-3 text-ttu-navy-light" />
                                )}
                                <p className="text-[10px] text-ttu-navy-light uppercase font-bold tracking-wider">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-lg transition-all duration-200 border border-white/5 hover:border-red-500/20 text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>

                <p className="text-[10px] text-center text-ttu-navy-light/50 pb-2">
                    © 2026 Takoradi Technical University
                </p>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar — always visible at lg+ */}
            <div className="hidden lg:block flex-shrink-0">
                {sidebarContent}
            </div>

            {/* Mobile sidebar — overlay drawer */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    {/* Drawer */}
                    <div className="relative z-50 animate-in slide-in-from-left duration-300">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
};
