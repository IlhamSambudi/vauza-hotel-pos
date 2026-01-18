import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Building, CalendarDays, CreditCard, LogOut, ClipboardList, BookOpen, Briefcase, ShieldCheck } from 'lucide-react';
import authService from '../services/auth.service';

const menu = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Clients", path: "/clients", icon: Users },
    { name: "Hotels", path: "/hotels", icon: Building },
    { name: "Reservations", path: "/reservations", icon: CalendarDays },
    { name: "Payments", path: "/payments", icon: CreditCard },
    { name: "Overview Order", path: "/overview-order", icon: ClipboardList },
    { name: "Nusuk Agreement", path: "/nusuk-agreement", icon: BookOpen },
    { name: "Supply Hotel", path: "/supply", icon: Briefcase },
];

export default function Sidebar() {
    return (
        <aside className="w-64 shrink-0 px-4 py-8 h-screen sticky top-0 flex flex-col bg-neu border-r border-gray-100 print:hidden">
            <div className="px-6 mb-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <ShieldCheck size={24} strokeWidth={2.5} className="relative z-10" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Vauza<span className="text-primary">Hotel</span></h1>
                    <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">POS System</span>
                </div>
            </div>

            <nav className="flex flex-col gap-2 flex-1 px-4">
                {menu.map((m) => (
                    <NavLink
                        key={m.path}
                        to={m.path}
                        className={({ isActive }) =>
                            `px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-4 group relative overflow-hidden
                            ${isActive
                                ? "bg-primary text-white shadow-lg shadow-primary/25 translate-x-1"
                                : "text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm hover:translate-x-1"}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <m.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors relative z-10 ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`} />
                                <span className="relative z-10">{m.name}</span>
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full"></div>}
                            </>
                        )}
                    </NavLink>
                ))}

                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to logout?")) {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }
                    }}
                    className="px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-4 group relative overflow-hidden text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm mt-auto"
                >
                    <LogOut size={20} strokeWidth={2} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                    <span>Logout</span>
                </button>
            </nav>

            {/* <div className="px-6 mt-auto">
                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-3 group hover:border-primary/20 transition-colors cursor-default">
                    <span className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></span>
                    <div>
                        <p className="text-[10px] font-bold text-textSub uppercase tracking-wider mb-0.5">Status</p>
                        <p className="text-xs font-bold text-textMain group-hover:text-primary transition-colors">System Online</p>
                    </div>
                </div>
            </div> */}
        </aside>
    );
}
