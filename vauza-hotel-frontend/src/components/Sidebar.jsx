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
        <aside className="w-64 shrink-0 px-4 py-8 h-screen sticky top-0 flex flex-col bg-neu border-r border-gray-100">
            <div className="px-6 mb-12 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primaryHover flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-textMain tracking-tight leading-none">Vauza<span className="text-primary">Hotel</span></h1>
                    <span className="text-[10px] font-semibold text-textSub tracking-wider uppercase">Enterprise</span>
                </div>
            </div>

            <nav className="flex flex-col gap-1.5 flex-1 px-3">
                {menu.map((m) => (
                    <NavLink
                        key={m.path}
                        to={m.path}
                        className={({ isActive }) =>
                            `px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-3.5 group relative overflow-hidden
                            ${isActive
                                ? "bg-primary text-white shadow-md shadow-primary/25"
                                : "text-textSub hover:bg-white hover:text-primaryHover hover:shadow-sm"}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <m.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors relative z-10 ${isActive ? "text-white" : "text-textSub group-hover:text-primaryHover"}`} />
                                <span className="relative z-10">{m.name}</span>
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
                    className="px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-3.5 group relative overflow-hidden text-textSub hover:bg-red-50 hover:text-red-600 hover:shadow-sm mt-auto"
                >
                    <LogOut size={20} strokeWidth={2} className="text-textSub group-hover:text-red-600 transition-colors" />
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
