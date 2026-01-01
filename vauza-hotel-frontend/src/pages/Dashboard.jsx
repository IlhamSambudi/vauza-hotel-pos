import React, { useEffect, useState } from 'react';
import authService from '../services/auth.service';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';
import { Users, Building, CalendarDays, Wallet, BadgeCheck, Eye, EyeOff } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, isCurrency, colorClass = "text-textMain" }) => (
    <div className="bg-white p-6 rounded-card shadow-card hover:shadow-lg transition-all duration-300 border border-gray-100 group">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-textSub font-bold text-xs uppercase tracking-wider">{title}</h3>
            <div className={`p-2 rounded-lg bg-gray-50 text-textSub group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
                <Icon size={20} />
            </div>
        </div>
        <div>
            <span className={`text-3xl font-bold tracking-tight text-textMain`}>
                {isCurrency ? (
                    <span className="flex items-baseline gap-1">
                        <span className="text-lg text-textSub font-medium">{value.toString().split(/[0-9]/)[0]}</span>
                        {value.toLocaleString()}
                    </span>
                ) : value}
            </span>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    if (status === 'new') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success uppercase tracking-wide">NEW</span>;
    if (status === 'edited') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary uppercase tracking-wide">EDITED</span>;
    if (status === 'delete') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-danger/10 text-danger uppercase tracking-wide">DELETED</span>;
    return null;
};

const RecentTable = ({ title, data = [], headers, renderRow, hasStatusToggle, showDeleted, onToggleDelete }) => {
    const safeData = Array.isArray(data) ? data : [];
    const filteredData = showDeleted ? safeData : safeData.filter(item => item.tag_status !== 'delete');

    return (
        <div className="bg-white rounded-card p-6 shadow-card border border-gray-100 flex-1 min-w-[300px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-textMain tracking-tight">
                    {title}
                </h3>
                {hasStatusToggle && (
                    <button
                        onClick={onToggleDelete}
                        className={`p-2 rounded-lg transition-all ${showDeleted ? 'bg-primary/10 text-primary' : 'text-textSub hover:bg-gray-50'}`}
                        title={showDeleted ? "Hide Deleted" : "Show Deleted"}
                    >
                        {showDeleted ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {headers.map((h, i) => (
                                <th key={i} className="py-3 px-4 font-bold text-xs uppercase text-textSub tracking-wider">
                                    {h === 'Status' ? '' : h}
                                </th>
                            ))}
                            {title === "Recent Reservations" && <th className="py-3 px-4"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, i) => renderRow(item, i))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={headers.length + (title === "Recent Reservations" ? 1 : 0)} className="py-8 text-center text-textSub text-sm">No data found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const user = authService.getCurrentUser();
    const [currency, setCurrency] = useState('IDR');

    const [stats, setStats] = useState({
        clients: 0, hotels: 0, reservations: 0, revenue: 0, revenueSar: 0,
        tagNew: 0, tagEdited: 0, tagDeleted: 0
    });

    const [recents, setRecents] = useState({
        clients: [], hotels: [], reservations: [], payments: []
    });

    const [showDeleted, setShowDeleted] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [c, h, r, p] = await Promise.all([
                    api.get('/clients'),
                    api.get('/hotels'),
                    api.get('/reservations'),
                    api.get('/payments')
                ]);

                const clients = c.data || [];
                const hotels = h.data || [];
                const reservations = r.data || [];
                const payments = p.data || [];

                const activePayments = payments.filter(p => p.tag_status !== 'delete');
                const totalRevenue = activePayments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
                const totalRevenueSar = activePayments.reduce((sum, pay) => sum + (Number(pay.amount_sar) || 0), 0);

                const allData = [...clients, ...hotels, ...reservations, ...payments];
                const countTag = (tag) => allData.filter(item => item.tag_status === tag).length;

                setStats({
                    clients: clients.length,
                    hotels: hotels.length,
                    reservations: reservations.length,
                    revenue: totalRevenue,
                    revenueSar: totalRevenueSar,
                    tagNew: countTag('new'),
                    tagEdited: countTag('edited'),
                    tagDeleted: countTag('delete')
                });

                const getRecent = (arr) => arr.slice(-5).reverse();
                setRecents({
                    clients: getRecent(clients),
                    hotels: getRecent(hotels),
                    reservations: getRecent(reservations),
                    payments: getRecent(payments)
                });

            } catch (e) {
                console.error("Failed to load stats", e);
            }
        };
        loadStats();
    }, []);

    const toggleCurrency = () => {
        setCurrency(curr => curr === 'IDR' ? 'SAR' : 'IDR');
    };

    return (
        <DashboardLayout title="Overview">
            {/* WELCOME CARD */}
            <div className="bg-white rounded-card p-6 shadow-card border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-textMain">Welcome back, {user?.username}</h2>
                        <p className="text-sm text-textSub">Here's what's happening today.</p>
                    </div>
                </div>
                <button
                    onClick={toggleCurrency}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold border ${currency === 'IDR' ? 'border-gray-200 text-textSub hover:border-primary hover:text-primary' : 'bg-primary text-white border-primary shadow-lg'}`}
                >
                    <Wallet size={16} />
                    <span>{currency} Currency</span>
                </button>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Clients" value={stats.clients} icon={Users} colorClass="text-blue-600" />
                <StatCard title="Partner Hotels" value={stats.hotels} icon={Building} colorClass="text-orange-600" />
                <StatCard title="Active Reservations" value={stats.reservations} icon={CalendarDays} colorClass="text-purple-600" />
                <StatCard
                    title={`Total Revenue (${currency})`}
                    value={currency === 'IDR' ? stats.revenue : stats.revenueSar}
                    icon={BadgeCheck}
                    isCurrency
                    colorClass="text-green-600"
                />
            </div>

            {/* RECENT TABLES */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* CLIENTS */}
                <RecentTable
                    title="Recent Clients"
                    data={recents.clients}
                    headers={["Name", "Status"]}
                    hasStatusToggle={true}
                    showDeleted={showDeleted}
                    onToggleDelete={() => setShowDeleted(!showDeleted)}
                    renderRow={(c) => (
                        <tr key={c.id_client} className={`hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${c.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="p-4 font-bold text-textMain">{c.nama_client}</td>
                            <td className="p-4 text-right"><StatusBadge status={c.tag_status} /></td>
                        </tr>
                    )}
                />

                {/* HOTELS */}
                <RecentTable
                    title="Recent Hotels"
                    data={recents.hotels}
                    headers={["Name", "City", "Status"]}
                    hasStatusToggle={true}
                    showDeleted={showDeleted}
                    onToggleDelete={() => setShowDeleted(!showDeleted)}
                    renderRow={(h) => (
                        <tr key={h.id_hotel} className={`hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${h.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="p-4 font-bold text-textMain">{h.nama_hotel}</td>
                            <td className="p-4 text-textSub text-xs font-semibold uppercase">{h.city}</td>
                            <td className="p-4 text-right"><StatusBadge status={h.tag_status} /></td>
                        </tr>
                    )}
                />

                {/* RESERVATIONS */}
                <RecentTable
                    title="Recent Reservations"
                    data={recents.reservations}
                    headers={["RSV No", "Client", "Hotel", "Status"]}
                    hasStatusToggle={true}
                    showDeleted={showDeleted}
                    onToggleDelete={() => setShowDeleted(!showDeleted)}
                    renderRow={(r) => (
                        <tr key={r.no_rsv} className={`hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${r.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="p-4 font-mono text-xs font-bold text-primary">{r.no_rsv}</td>
                            <td className="p-4 font-bold text-textMain truncate max-w-[120px]">{r.nama_client}</td>
                            <td className="p-4 text-textSub text-xs truncate max-w-[120px]">{r.nama_hotel}</td>
                            <td className="p-4 text-right"><StatusBadge status={r.tag_status} /></td>
                        </tr>
                    )}
                />

                {/* PAYMENTS */}
                <RecentTable
                    title="Recent Payments"
                    data={recents.payments}
                    headers={["Date", "Client", `Amount (${currency})`, "Status"]}
                    hasStatusToggle={true}
                    showDeleted={showDeleted}
                    onToggleDelete={() => setShowDeleted(!showDeleted)}
                    renderRow={(p) => (
                        <tr key={p.id_payment} className={`hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${p.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="p-4 text-textSub text-xs font-medium">{formatDate(p.date)}</td>
                            <td className="p-4 font-bold text-textMain truncate max-w-[120px]">{p.nama_client}</td>
                            <td className="p-4 font-mono text-xs font-bold text-textMain">
                                {currency === 'IDR'
                                    ? Number(p.amount).toLocaleString()
                                    : `${Number(p.amount_sar || 0).toLocaleString()} SAR`
                                }
                            </td>
                            <td className="p-4 text-right"><StatusBadge status={p.tag_status} /></td>
                        </tr>
                    )}
                />
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
