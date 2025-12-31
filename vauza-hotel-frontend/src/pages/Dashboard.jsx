import React, { useEffect, useState } from 'react';
import authService from '../services/auth.service';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';

// Sub-components defined outside to prevent re-creation on every render
const StatCard = ({ title, value, icon, isCurrency, colorClass = "text-primary" }) => (
    <div className="bg-neu p-6 rounded-2xl shadow-neu-flat hover:shadow-neu-button transition-all group">
        <h3 className="text-textSub font-bold mb-3 uppercase text-[10px] tracking-widest">{title}</h3>
        <div className="flex items-end justify-between">
            <span className={`text-2xl font-black transition-colors ${colorClass} tracking-tight`}>
                {isCurrency ? `Rp ${value.toLocaleString()}` : value}
            </span>
            <div className={`text-2xl opacity-40 group-hover:opacity-100 transition-opacity ${colorClass} drop-shadow-sm`}>
                {icon}
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    if (status === 'new') return <span className="shadow-neu-pressed px-3 py-1 rounded-full text-[10px] font-extrabold text-green-600 uppercase tracking-widest">NEW</span>;
    if (status === 'edited') return <span className="shadow-neu-pressed px-3 py-1 rounded-full text-[10px] font-extrabold text-blue-500 uppercase tracking-widest">EDITED</span>;
    if (status === 'delete') return <span className="shadow-neu-pressed px-3 py-1 rounded-full text-[10px] font-extrabold text-red-500 uppercase tracking-widest">DELETED</span>;
    return null;
};

const RecentTable = ({ title, data = [], headers, renderRow, hasStatusToggle, showDeleted, onToggleDelete }) => {
    // Safety check for data
    const safeData = Array.isArray(data) ? data : [];
    const filteredData = showDeleted ? safeData : safeData.filter(item => item.tag_status !== 'delete');

    return (
        <div className="bg-neu rounded-2xl p-6 shadow-neu-flat flex-1 min-w-[300px]">
            <h3 className="text-lg font-black text-textMain mb-6 tracking-tight flex justify-between items-center">
                {title}
                {hasStatusToggle && (
                    <button
                        onClick={onToggleDelete}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showDeleted ? 'shadow-neu-pressed text-primary' : 'shadow-neu-flat text-gray-400 hover:text-primary'}`}
                        title={showDeleted ? "Hide Deleted" : "Show Deleted"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                )}
            </h3>
            <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-textSub">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="p-4 font-bold uppercase text-[10px] tracking-wider opacity-70">
                                    {h === 'Status' ? '' : h} {/* Hide Status Label since button is in header */}
                                </th>
                            ))}
                            {/* Add a header for actions if needed */}
                            {title === "Recent Reservations" && <th className="p-4 font-bold uppercase text-[10px] tracking-wider opacity-70"></th>}
                        </tr>
                    </thead>
                    <tbody className="space-y-2">
                        {filteredData.map((item, i) => renderRow(item, i))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={headers.length + (title === "Recent Reservations" ? 1 : 0)} className="p-6 text-center text-textSub italic font-medium opacity-50">No data found.</td>
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
    const [currency, setCurrency] = useState('IDR'); // 'IDR' or 'SAR'

    const [stats, setStats] = useState({
        clients: 0, hotels: 0, reservations: 0, revenue: 0, revenueSar: 0, // Added revenueSar
        tagNew: 0, tagEdited: 0, tagDeleted: 0
    });

    // Recent Data States
    const [recents, setRecents] = useState({
        clients: [],
        hotels: [],
        reservations: [],
        payments: []
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

                // Calculate Revenue (Exclude Deleted)
                const activePayments = payments.filter(p => p.tag_status !== 'delete');
                const totalRevenue = activePayments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
                const totalRevenueSar = activePayments.reduce((sum, pay) => sum + (Number(pay.amount_sar) || 0), 0); // Sum SAR

                // Calculate Tag Stats
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

                // Get Recent 5
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
        <DashboardLayout title="Dashboard">
            <div className="mb-10">
                <div className="bg-neu rounded-2xl p-8 flex items-center justify-between shadow-neu-flat">
                    <div>
                        <h2 className="text-2xl font-black text-textMain tracking-tight">Welcome back, <span className="text-primary">{user?.username}</span>!</h2>
                        <p className="text-textSub font-medium mt-2">Manage your property with style.</p>
                    </div>
                    {/* Currency Toggle */}
                    <button
                        onClick={toggleCurrency}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all font-bold text-sm tracking-wide text-textMain
                            ${currency === 'IDR' ? 'shadow-neu-flat' : 'shadow-neu-pressed text-primary'}
                        `}
                        title="Switch Currency Overview"
                    >
                        <span>{currency === 'IDR' ? '🇮🇩 IDR' : '🇸🇦 SAR'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* MAIN STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <StatCard title="Total Clients" value={stats.clients} icon="👥" />
                <StatCard title="Partner Hotels" value={stats.hotels} icon="🏨" />
                <StatCard title="Active Reservations" value={stats.reservations} icon="📅" />
                <StatCard
                    title={`Total Revenue (${currency})`}
                    value={currency === 'IDR' ? stats.revenue : stats.revenueSar}
                    icon={currency === 'IDR' ? "💰" : "💱"}
                    isCurrency
                />
            </div>

            {/* RECENT DATA TABLES GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* 1. RECENT CLIENTS */}
                <RecentTable
                    title="Recent Clients"
                    data={recents.clients}
                    headers={["Name", "Status"]}
                    hasStatusToggle={true}
                    showDeleted={showDeleted}
                    onToggleDelete={() => setShowDeleted(!showDeleted)}
                    renderRow={(c) => (
                        <tr key={c.id_client} className={`transition-all ${c.tag_status === 'delete' ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
                            <td className="p-4 font-bold text-textMain border-b border-transparent">{c.nama_client}</td>
                            <td className="p-4 text-right border-b border-transparent"><StatusBadge status={c.tag_status} /></td>
                        </tr>
                    )}
                />

                {/* 2. RECENT HOTELS */}
                <RecentTable
                    title="Recent Hotels"
                    data={recents.hotels}
                    headers={["Name", "City", "Status"]}
                    hasStatusToggle={true}
                    showDeleted={showDeleted}
                    onToggleDelete={() => setShowDeleted(!showDeleted)}
                    renderRow={(h) => (
                        <tr key={h.id_hotel} className={`transition-all ${h.tag_status === 'delete' ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
                            <td className="p-4 font-bold text-textMain border-b border-transparent">{h.nama_hotel}</td>
                            <td className="p-4 text-textSub text-xs font-semibold uppercase tracking-wide border-b border-transparent">{h.city}</td>
                            <td className="p-4 text-right border-b border-transparent"><StatusBadge status={h.tag_status} /></td>
                        </tr>
                    )}
                />

                {/* 3. RECENT RESERVATIONS */}
                <RecentTable
                    title="Recent Reservations"
                    data={recents.reservations}
                    headers={["RSV No", "Client", "Hotel", "Status"]}
                    hasStatusToggle={true}
                    showDeleted={showDeleted}
                    onToggleDelete={() => setShowDeleted(!showDeleted)}
                    renderRow={(r) => (
                        <tr key={r.no_rsv} className={`transition-all ${r.tag_status === 'delete' ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
                            <td className="p-4 font-mono text-xs font-bold text-primary border-b border-transparent">{r.no_rsv}</td>
                            <td className="p-4 font-bold text-textMain truncate max-w-[150px] border-b border-transparent">{r.nama_client}</td>
                            <td className="p-4 text-textSub text-xs font-medium border-b border-transparent truncate max-w-[150px]">{r.nama_hotel}</td>
                            <td className="p-4 text-right border-b border-transparent"><StatusBadge status={r.tag_status} /></td>
                        </tr>
                    )}
                />

                {/* 4. RECENT PAYMENTS */}
                <RecentTable
                    title="Recent Payments"
                    data={recents.payments}
                    headers={["Date", "Client", `Amount (${currency})`, "Status"]}
                    hasStatusToggle={true}
                    showDeleted={showDeleted}
                    onToggleDelete={() => setShowDeleted(!showDeleted)}
                    renderRow={(p) => (
                        <tr key={p.id_payment} className={`transition-all ${p.tag_status === 'delete' ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
                            <td className="p-4 text-textSub text-xs font-bold border-b border-transparent">{formatDate(p.date)}</td>
                            <td className="p-4 font-bold text-textMain truncate max-w-[150px] border-b border-transparent">{p.nama_client}</td>
                            <td className="p-4 font-mono text-xs font-bold text-primary border-b border-transparent">
                                {currency === 'IDR'
                                    ? `Rp ${Number(p.amount).toLocaleString()}`
                                    : `${Number(p.amount_sar || 0).toLocaleString()} SAR`
                                }
                            </td>
                            <td className="p-4 text-right border-b border-transparent"><StatusBadge status={p.tag_status} /></td>
                        </tr>
                    )}
                />

            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
