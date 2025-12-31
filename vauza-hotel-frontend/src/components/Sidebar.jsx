import { NavLink } from "react-router-dom";

const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Clients", path: "/clients" },
    { name: "Hotels", path: "/hotels" },
    { name: "Reservations", path: "/reservations" },
    { name: "Payments", path: "/payments" },
];

export default function Sidebar() {
    return (
        <aside className="w-64 shrink-0 px-6 py-8 h-screen sticky top-0 flex flex-col bg-neu">
            <h1 className="text-2xl font-black mb-10 text-primary tracking-tighter drop-shadow-sm">Vauza Hotel POS</h1>
            <nav className="flex flex-col gap-4 flex-1">
                {menu.map((m) => (
                    <NavLink
                        key={m.path}
                        to={m.path}
                        className={({ isActive }) =>
                            `px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3
              ${isActive
                                ? "text-primary shadow-neu-pressed" // Pressed look for active
                                : "text-textSub shadow-neu-flat hover:text-primary hover:-translate-y-0.5"}` // Popped out for inactive
                        }
                    >
                        {m.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
