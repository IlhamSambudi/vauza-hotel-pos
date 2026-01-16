import React, { useEffect, useState } from 'react';
import authService from '../services/auth.service';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';
import { Users, Building, CalendarDays, Wallet, BadgeCheck, Eye, EyeOff, TriangleAlert, Clock, ScrollText, FileSpreadsheet, Building2, MapPin } from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import RecentTable from '../components/RecentTable';

const Dashboard = () => {
    const user = authService.getCurrentUser();
    const [currency, setCurrency] = useState('IDR');

    const [stats, setStats] = useState({
        clients: 0, hotels: 0, reservations: 0, revenue: 0, revenueSar: 0,
        nusuk: 0, supply: 0,
        tagNew: 0, tagEdited: 0, tagDeleted: 0
    });

    const [recents, setRecents] = useState({
        clients: [], hotels: [], reservations: [], payments: []
    });

    const [alerts, setAlerts] = useState([]);
    const [showDeleted, setShowDeleted] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [c, h, r, p, n, s] = await Promise.all([
                    api.get('/clients'),
                    api.get('/hotels'),
                    api.get('/reservations'),
                    api.get('/payments'),
                    api.get('/nusuk'),
                    api.get('/supply')
                ]);

                const clients = c.data || [];
                const hotels = h.data || [];
                const reservations = r.data || [];
                const payments = p.data || [];
                const nusukBy = n.data || [];
                const supply = s.data || [];

                const activePayments = payments.filter(p => p.tag_status !== 'delete');
                const totalRevenue = activePayments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
                const totalRevenueSar = activePayments.reduce((sum, pay) => sum + (Number(pay.amount_sar) || 0), 0);

                // Process Alerts
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const processedAlerts = reservations
                    .filter(res =>
                        res.tag_status !== 'delete' &&
                        res.status_payment !== 'full_payment' &&
                        res.status_payment !== 'payment_done' && // Handle both
                        res.status_payment !== 'payment done' &&
                        res.deadline_payment
                    )
                    .map(res => {
                        let deadline = null;

                        if (typeof res.deadline_payment === 'string') {
                            if (res.deadline_payment.includes('/')) {
                                const parts = res.deadline_payment.split('/');
                                if (parts.length === 3) {
                                    const day = parseInt(parts[0], 10);
                                    const month = parseInt(parts[1], 10) - 1;
                                    const year = parseInt(parts[2], 10);
                                    deadline = new Date(year, month, day);
                                }
                            } else if (res.deadline_payment.includes('-')) {
                                const parts = res.deadline_payment.split(/[-T]/);
                                const year = parseInt(parts[0], 10);
                                const month = parseInt(parts[1], 10) - 1;
                                const day = parseInt(parts[2], 10);
                                deadline = new Date(year, month, day);
                            }
                        }

                        if (!deadline || isNaN(deadline.getTime())) {
                            deadline = new Date(res.deadline_payment);
                            deadline.setHours(0, 0, 0, 0);
                        }

                        const diffTime = deadline.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        let type = null;
                        if (diffDays < 0) type = 'overdue';
                        else if (diffDays <= 4) type = 'urgent';

                        return { ...res, diffDays, type };
                    })
                    .filter(res => res.type)
                    .sort((a, b) => a.diffDays - b.diffDays);

                setAlerts(processedAlerts);

                const countTag = (tag) => {
                    const allData = [...clients, ...hotels, ...reservations, ...payments, ...nusukBy, ...supply];
                    return allData.filter(item => item.tag_status === tag).length;
                };

                setStats({
                    clients: clients.filter(i => i.tag_status !== 'delete').length,
                    hotels: hotels.filter(i => i.tag_status !== 'delete').length,
                    reservations: reservations.filter(i => i.tag_status !== 'delete').length,
                    revenue: totalRevenue,
                    revenueSar: totalRevenueSar,
                    nusuk: nusukBy.length,
                    supply: supply.length,
                    tagNew: countTag('new'),
                    tagEdited: countTag('edited'),
                    tagDeleted: countTag('delete')
                });

                const getRecentSimple = (arr) => arr.slice().reverse().slice(0, 5);

                setRecents({
                    clients: getRecentSimple(clients),
                    hotels: getRecentSimple(hotels),
                    reservations: getRecentSimple(reservations),
                    payments: getRecentSimple(payments)
                });

            } catch (e) {
                console.error("Failed to load stats", e);
            }
        };
        loadStats();
    }, [showDeleted]);

    const toggleCurrency = () => {
        setCurrency(curr => curr === 'IDR' ? 'SAR' : 'IDR');
    };

    return (
        <DashboardLayout title="Overview">
            {/* WELCOME CARD */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 shadow-2xl shadow-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-white group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-4xl shadow-inner border border-white/10 ring-1 ring-white/5">
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-1">Welcome back, {user?.username}</h2>
                        <p className="text-slate-400 font-medium tracking-wide">Here's your operational summary for today.</p>
                    </div>
                </div>
                <button
                    onClick={toggleCurrency}
                    className="relative z-10 flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all text-xs font-bold bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 border border-white/20 hover:border-white shadow-lg uppercase tracking-wider group-active:scale-95"
                >
                    <Wallet size={16} strokeWidth={2.5} />
                    <span>{currency} Mode</span>
                </button>
            </div>

            {/* ALERT SECTION */}
            {alerts.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                        <TriangleAlert className="text-amber-500" />
                        Payment Reminders
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alerts.map((alert) => (
                            <div
                                key={alert.no_rsv}
                                className={`p-5 rounded-2xl border flex flex-col gap-4 shadow-sm transition-all hover:shadow-lg ${alert.type === 'overdue'
                                    ? 'bg-rose-50/50 border-rose-100 hover:shadow-rose-100'
                                    : 'bg-amber-50/50 border-amber-100 hover:shadow-amber-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${alert.type === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                            <Clock size={18} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-wider ${alert.type === 'overdue' ? 'text-rose-600' : 'text-amber-600'}`}>
                                                {alert.type === 'overdue' ? 'Overdue' : 'Due Soon'}
                                            </p>
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{alert.nama_client}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded-lg text-slate-500 border border-slate-100">
                                        {alert.no_rsv}
                                    </span>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <Building2 size={12} className="text-primary" />
                                        <span className="truncate" title={alert.nama_hotel}>{alert.nama_hotel}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <CalendarDays size={12} />
                                        <span>{formatDate(alert.checkin)} - {formatDate(alert.checkout)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Deadline</p>
                                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                            {formatDate(alert.deadline_payment)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Remaining</p>
                                        <p className="text-sm font-black text-slate-800">
                                            {(Number(alert.total_amount) - Number(alert.paid_amount || 0)).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {alert.type === 'overdue' ? (
                                    <div className="text-[10px] font-bold text-rose-600 bg-rose-100/50 px-3 py-2 rounded-lg text-center mt-1 uppercase tracking-wide">
                                        {Math.abs(alert.diffDays)} days late
                                    </div>
                                ) : (
                                    <div className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-3 py-2 rounded-lg text-center mt-1 uppercase tracking-wide">
                                        Due in {alert.diffDays} days
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-10">
                <StatCard title="Total Clients" value={stats.clients} icon={Users} />
                <StatCard title="Partner Hotels" value={stats.hotels} icon={Building} />
                <StatCard title="Active RSV" value={stats.reservations} icon={CalendarDays} />
                <StatCard title="Nusuk Agmt" value={stats.nusuk} icon={ScrollText} />
                <StatCard title="Supply CL" value={stats.supply} icon={FileSpreadsheet} />
                <StatCard
                    title={`Revenue (${currency})`}
                    value={currency === 'IDR' ? stats.revenue : stats.revenueSar}
                    icon={BadgeCheck}
                    isCurrency
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
                        <tr key={c.id_client} className={`group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${c.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-6 py-4 font-bold text-slate-700">{c.nama_client}</td>
                            <td className="px-6 py-4 text-right"><StatusBadge status={c.tag_status} /></td>
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
                        <tr key={h.id_hotel} className={`group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${h.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-6 py-4 font-bold text-slate-700">
                                <span className="block">{h.nama_hotel}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <MapPin size={10} /> {h.city}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right"><StatusBadge status={h.tag_status} /></td>
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
                        <tr key={r.no_rsv} className={`group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${r.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-6 py-4">
                                <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md whitespace-nowrap">
                                    {r.no_rsv}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700 truncate max-w-[120px]">{r.nama_client}</td>
                            <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[120px] font-medium">{r.nama_hotel}</td>
                            <td className="px-6 py-4 text-right"><StatusBadge status={r.tag_status} /></td>
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
                        <tr key={p.id_payment} className={`group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${p.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-6 py-4 text-slate-500 text-xs font-bold tabular-nums tracking-tight">{formatDate(p.date)}</td>
                            <td className="px-6 py-4 font-bold text-slate-700 truncate max-w-[120px]">{p.nama_client}</td>
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">
                                {currency === 'IDR'
                                    ? Number(p.amount).toLocaleString()
                                    : `${Number(p.amount_sar || 0).toLocaleString()} SAR`
                                }
                            </td>
                            <td className="px-6 py-4 text-right"><StatusBadge status={p.tag_status} /></td>
                        </tr>
                    )}
                />
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
