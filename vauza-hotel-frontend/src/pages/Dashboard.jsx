import React, { useEffect, useState } from 'react';
import authService from '../services/auth.service';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';
import { Users, Building, CalendarDays, Wallet, BadgeCheck, Eye, EyeOff, TriangleAlert, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import RecentTable from '../components/RecentTable';

const Dashboard = () => {
    const user = authService.getCurrentUser();
    const [currency, setCurrency] = useState('IDR');

    // ... stats state loading logic ... (Keep unchanged mostly)
    const [stats, setStats] = useState({
        clients: 0, hotels: 0, reservations: 0, revenue: 0, revenueSar: 0,
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

                // Process Alerts
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Local Midnight

                const processedAlerts = reservations
                    .filter(res =>
                        res.tag_status !== 'delete' &&
                        res.status_payment !== 'full_payment' &&
                        res.deadline_payment
                    )
                    .map(res => {
                        // Parse deadline as Local Calendar Date
                        // Support both dd/mm/yyyy (Google Sheets) and yyyy-mm-dd (ISO)
                        let deadline = null;

                        if (typeof res.deadline_payment === 'string') {
                            if (res.deadline_payment.includes('/')) {
                                // Assume dd/mm/yyyy
                                const parts = res.deadline_payment.split('/');
                                if (parts.length === 3) {
                                    const day = parseInt(parts[0], 10);
                                    const month = parseInt(parts[1], 10) - 1;
                                    const year = parseInt(parts[2], 10);
                                    deadline = new Date(year, month, day);
                                }
                            } else if (res.deadline_payment.includes('-')) {
                                // Assume yyyy-mm-dd
                                const parts = res.deadline_payment.split(/[-T]/);
                                const year = parseInt(parts[0], 10);
                                const month = parseInt(parts[1], 10) - 1;
                                const day = parseInt(parts[2], 10);
                                deadline = new Date(year, month, day);
                            }
                        }

                        // Fallback or ensure valid date
                        if (!deadline || isNaN(deadline.getTime())) {
                            deadline = new Date(res.deadline_payment);
                            deadline.setHours(0, 0, 0, 0);
                        }

                        // Calculate difference in Calendar Days
                        const diffTime = deadline.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        let type = null;
                        if (diffDays < 0) type = 'overdue';
                        else if (diffDays <= 4) type = 'urgent';

                        return { ...res, diffDays, type };
                    })
                    .filter(res => res.type) // Only keep overdue or urgent
                    .sort((a, b) => a.diffDays - b.diffDays); // Sort by urgency (most overdue first)

                setAlerts(processedAlerts);

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
            <div className="bg-gradient-to-r from-primary/90 to-primary rounded-2xl p-8 shadow-lg shadow-primary/20 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl shadow-inner border border-white/20">
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.username}</h2>
                        <p className="text-indigo-100 mt-1 font-medium">Here's your operational summary for today.</p>
                    </div>
                </div>
                <button
                    onClick={toggleCurrency}
                    className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-sm font-bold bg-white text-primary shadow-lg hover:shadow-xl active:scale-95 border border-white"
                >
                    <Wallet size={18} strokeWidth={2.5} />
                    <span>{currency} Mode</span>
                </button>
            </div>

            {/* ALERT SECTION */}
            {alerts.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                        <TriangleAlert className="text-amber-500" />
                        Payment Reminders
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alerts.map((alert) => (
                            <div
                                key={alert.no_rsv}
                                className={`p-4 rounded-2xl border flex flex-col gap-3 shadow-sm transition-all hover:shadow-md ${alert.type === 'overdue'
                                    ? 'bg-red-50 border-red-100'
                                    : 'bg-amber-50 border-amber-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-full ${alert.type === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                            <Clock size={16} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold uppercase tracking-wide ${alert.type === 'overdue' ? 'text-red-600' : 'text-amber-600'
                                                }`}>
                                                {alert.type === 'overdue' ? 'Overdue' : 'Due Soon'}
                                            </p>
                                            <p className="text-sm font-bold text-textMain line-clamp-1">{alert.nama_client}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-bold bg-white/50 px-2 py-1 rounded-lg text-textSub">
                                        {alert.no_rsv}
                                    </span>
                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-textMain">
                                        <Building size={12} className="text-primary" />
                                        <span className="truncate" title={alert.nama_hotel}>{alert.nama_hotel}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-textSub">
                                        <CalendarDays size={12} />
                                        <span>{formatDate(alert.checkin)} - {formatDate(alert.checkout)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-black/5 pt-3">
                                    <div>
                                        <p className="text-xs text-textSub mb-0.5">Deadline</p>
                                        <p className="text-sm font-semibold text-textMain flex items-center gap-1">
                                            <CalendarDays size={14} className="text-textSub" />
                                            {formatDate(alert.deadline_payment)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-textSub mb-0.5">Remaining</p>
                                        <p className="text-sm font-bold text-textMain">
                                            {(Number(alert.total_amount) - Number(alert.paid_amount || 0)).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {alert.type === 'overdue' ? (
                                    <div className="text-xs font-bold text-red-600 bg-red-100/50 px-3 py-1.5 rounded-lg text-center mt-1">
                                        {Math.abs(alert.diffDays)} days late
                                    </div>
                                ) : (
                                    <div className="text-xs font-bold text-amber-700 bg-amber-100/50 px-3 py-1.5 rounded-lg text-center mt-1">
                                        Due in {alert.diffDays} days
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Clients" value={stats.clients} icon={Users} />
                <StatCard title="Partner Hotels" value={stats.hotels} icon={Building} />
                <StatCard title="Active Reservations" value={stats.reservations} icon={CalendarDays} />
                <StatCard
                    title={`Total Revenue (${currency})`}
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
                        <tr key={c.id_client} className={`group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${c.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-6 py-4 font-bold text-textMain">{c.nama_client}</td>
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
                        <tr key={h.id_hotel} className={`group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${h.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-6 py-4 font-bold text-textMain">{h.nama_hotel}</td>
                            <td className="px-6 py-4 text-textSub text-xs font-semibold uppercase tracking-wider">{h.city}</td>
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
                        <tr key={r.no_rsv} className={`group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${r.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-6 py-4 font-mono text-xs font-bold text-primary bg-primary/5 rounded-lg w-min whitespace-nowrap px-3">{r.no_rsv}</td>
                            <td className="px-6 py-4 font-bold text-textMain truncate max-w-[120px]">{r.nama_client}</td>
                            <td className="px-6 py-4 text-textSub text-xs truncate max-w-[120px]">{r.nama_hotel}</td>
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
                        <tr key={p.id_payment} className={`group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${p.tag_status === 'delete' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-6 py-4 text-textSub text-xs font-medium tabular-nums">{formatDate(p.date)}</td>
                            <td className="px-6 py-4 font-bold text-textMain truncate max-w-[120px]">{p.nama_client}</td>
                            <td className="px-6 py-4 font-mono text-xs font-bold text-textMain">
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
