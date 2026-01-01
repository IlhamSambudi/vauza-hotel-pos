import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Building, CalendarDays, CreditCard, ShieldCheck } from "lucide-react";

const menu = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Clients", path: "/clients", icon: Users },
    { name: "Hotels", path: "/hotels", icon: Building },
    { name: "Reservations", path: "/reservations", icon: CalendarDays },
    { name: "Payments", path: "/payments", icon: CreditCard },
];

export default function Sidebar() {
    return (
        <aside className="w-64 shrink-0 px-4 py-8 h-screen sticky top-0 flex flex-col bg-neu border-r border-gray-100">
            <div className="px-4 mb-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                    <ShieldCheck size={18} />
                </div>
                <h1 className="text-xl font-bold text-textMain tracking-tight">Vauza<span className="text-primary">POS</span></h1>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                {menu.map((m) => (
                    <NavLink
                        key={m.path}
                        to={m.path}
                        className={({ isActive }) =>
                            `px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3
                            ${isActive
                                ? "bg-primary/10 text-primary font-bold shadow-none"
                                : "text-textSub hover:bg-gray-50 hover:text-textMain"}`
                        }
                    >
                        <m.icon size={20} strokeWidth={1.75} />
                        {m.name}
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 mt-auto">
                <div className="p-4 rounded-card bg-bgMain border border-gray-100">
                    <p className="text-xs font-bold text-textSub uppercase mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        <span className="text-xs font-medium text-textMain">System Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
