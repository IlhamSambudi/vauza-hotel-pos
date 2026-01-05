import { useEffect, useState } from 'react';
import api from '../services/api';
import { Printer } from 'lucide-react';

export default function OverviewHotelOrder() {
    const [clientList, setClientList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reservations').then(res => {
            const reservations = res.data;

            // Group by Client
            const groups = {};
            reservations.forEach(r => {
                const clientId = r.id_client || 'unknown';
                const clientName = r.nama_client || "Unknown Client";

                if (!groups[clientId]) {
                    groups[clientId] = {
                        id_client: clientId,
                        nama_client: clientName,
                        total_reservations: 0,
                        latest_date: r.checkin // Could sort later
                    };
                }
                groups[clientId].total_reservations += 1;
            });

            // Convert to array and sort by Name
            const list = Object.values(groups).sort((a, b) => a.nama_client.localeCompare(b.nama_client));

            setClientList(list);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load reservations", err);
            setLoading(false);
        });
    }, []);

    const totalClients = clientList.length;
    const totalOrders = clientList.reduce((acc, curr) => acc + curr.total_reservations, 0);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-textMain animate-fade-in-up">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight mb-2">Overview Hotel Orders</h1>
                    <p className="text-gray-500 font-medium">Consolidated order report by client.</p>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Clients</span>
                        <span className="block text-3xl font-black text-gray-800">{totalClients}</span>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Reservations</span>
                        <span className="block text-3xl font-black text-primary">{totalOrders}</span>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-white shadow-sm sticky top-0 z-10">
                                <tr>
                                    <th className="p-6 w-20 font-semibold text-textSub uppercase text-[10px] tracking-wider text-center border-b border-gray-100">No</th>
                                    <th className="p-6 font-semibold text-textSub uppercase text-[10px] tracking-wider border-b border-gray-100">Client Name</th>
                                    <th className="p-6 text-center font-semibold text-textSub uppercase text-[10px] tracking-wider border-b border-gray-100">Total Orders</th>
                                    <th className="p-6 text-right font-semibold text-textSub uppercase text-[10px] tracking-wider border-b border-gray-100">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {clientList.map((client, index) => (
                                    <tr key={client.id_client} className="group hover:bg-gray-50 transition-colors">
                                        <td className="p-6 text-center text-gray-400 font-mono text-xs font-bold">{index + 1}</td>
                                        <td className="p-6">
                                            <div className="font-bold text-textMain text-lg">{client.nama_client}</div>
                                            <div className="text-xs text-textSub font-medium mt-0.5">ID: {client.id_client}</div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 font-black rounded-2xl text-xl">
                                                {client.total_reservations}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => window.open(`/overview-order/print/${client.id_client}`, '_blank')}
                                                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all font-bold text-xs shadow-sm uppercase tracking-wide group-hover:shadow-md"
                                            >
                                                <Printer size={16} strokeWidth={2} /> Print Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {clientList.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-textSub italic">No clients found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
