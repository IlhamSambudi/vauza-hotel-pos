import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import useTable from '../hooks/useTable';
import TableControls from '../components/TableControls';
import Skeleton from '../components/Skeleton';
import { formatDate } from '../utils/formatDate';
import { Save, Loader, Eye, EyeOff } from 'lucide-react';

export default function NusukAgreement() {
    const [reservations, setReservations] = useState([]);
    const [nusukData, setNusukData] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [showDeleted, setShowDeleted] = useState(false);

    // Combine Data for Table
    const combinedData = React.useMemo(() => {
        return reservations.map(r => {
            const nData = nusukData[r.no_rsv] || { nusuk_no: '', status: 'blank' };
            return {
                ...r,
                nusuk_no: nData.nusuk_no,
                nusuk_status: nData.status
            };
        });
    }, [reservations, nusukData]);

    // Integrate useTable
    const {
        data: processedReservations,
        search, setSearch,
        sort, setSort,
        filters, setFilter
    } = useTable({
        data: showDeleted ? combinedData : combinedData.filter(r => r.tag_status !== 'delete'),
        defaultSort: { key: 'no_rsv', direction: 'desc' },
        filterTypes: {
            nusuk_status: (item, value) => {
                if (!value) return true;
                return item.nusuk_status === value;
            }
        }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [resReservations, resNusuk] = await Promise.all([
                api.get('/reservations'),
                api.get('/nusuk')
            ]);

            const rsv = resReservations.data || [];
            const nusuk = resNusuk.data || [];

            const nusukMap = {};
            nusuk.forEach(item => {
                if (item.no_rsv) {
                    nusukMap[item.no_rsv] = {
                        nusuk_no: item.nusuk_no,
                        status: item.status
                    };
                }
            });

            setReservations(rsv);
            setNusukData(nusukMap);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            toast.error("Failed to load data");
        }
    };

    const handleUpdate = async (no_rsv, field, value) => {
        setNusukData(prev => ({
            ...prev,
            [no_rsv]: {
                ...prev[no_rsv],
                [field]: value
            }
        }));
        saveChanges(no_rsv, field, value);
    };

    const saveChanges = async (no_rsv, field, value) => {
        setUpdating(prev => ({ ...prev, [no_rsv]: true }));
        try {
            const current = nusukData[no_rsv] || {};
            const payload = {
                no_rsv,
                nusuk_no: field === 'nusuk_no' ? value : (current.nusuk_no || ''),
                status: field === 'status' ? value : (current.status || 'blank')
            };

            await api.post('/nusuk/update', payload);
        } catch (err) {
            console.error("Failed to save", err);
            toast.error("Failed to save changes");
        } finally {
            setUpdating(prev => ({ ...prev, [no_rsv]: false }));
        }
    };

    return (
        <DashboardLayout title="Nusuk Agreement">

            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                    <TableControls
                        search={search} setSearch={setSearch}
                        sort={sort} setSort={setSort}
                        filters={filters} setFilter={setFilter}
                        sortOptions={[
                            { key: 'no_rsv', label: 'RSV No' },
                            { key: 'nama_client', label: 'Client' },
                            { key: 'nusuk_no', label: 'Nusuk No' },
                            { key: 'checkin', label: 'Check In' }
                        ]}
                        filterOptions={[
                            {
                                key: 'nusuk_status',
                                label: 'Status',
                                options: [
                                    { value: 'blank', label: 'Blank' },
                                    { value: 'waiting approval', label: 'Waiting Approval' },
                                    { value: 'approved', label: 'Approved' },
                                    { value: 'rejected', label: 'Rejected' }
                                ]
                            }
                        ]}
                    />
                </div>

                <button
                    onClick={() => setShowDeleted(!showDeleted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${showDeleted ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    {showDeleted ? <><Eye size={14} /> Hide Deleted</> : <><EyeOff size={14} /> Show Deleted</>}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 z-20 bg-slate-50/50 shadow-sm border-b border-slate-100 backdrop-blur-sm">
                            <tr>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">RSV No</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Client</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Hotel</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Check In</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Check Out</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider w-48">Nusuk No</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider w-48">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="7" className="p-8">
                                            <Skeleton className="h-8 w-full rounded-md" />
                                        </td>
                                    </tr>
                                ))
                            ) : processedReservations.map(r => {
                                const isDeleted = r.tag_status === 'delete';
                                const nData = nusukData[r.no_rsv] || { nusuk_no: '', status: 'blank' };

                                const statusColor = {
                                    'blank': 'bg-slate-100 text-slate-500 border-slate-200',
                                    'waiting approval': 'bg-purple-50 text-purple-600 border-purple-100',
                                    'approved': 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                    'rejected': 'bg-rose-50 text-rose-600 border-rose-100',
                                }[nData.status] || 'bg-slate-100';

                                const isCancelled = r.status_booking === 'CANCEL' || r.status_booking === 'Cancel';

                                return (
                                    <tr key={r.no_rsv} className={`group hover:bg-slate-50/80 transition-colors ${isDeleted ? 'opacity-50 grayscale bg-slate-50' : ''}`}>
                                        <td className="p-4">
                                            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                                {r.no_rsv}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-700">{r.nama_client}</td>
                                        <td className="p-4 text-slate-500 text-xs font-medium">{r.nama_hotel}</td>
                                        <td className="p-4 text-xs font-mono font-medium text-slate-600">{formatDate(r.checkin)}</td>
                                        <td className="p-4 text-xs font-mono font-medium text-slate-600">{formatDate(r.checkout)}</td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                className="border border-slate-200 bg-white rounded-lg px-3 py-2 w-full text-xs font-bold text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                                                value={nData.nusuk_no || ''}
                                                placeholder="Enter Nusuk No"
                                                onChange={(e) => handleUpdate(r.no_rsv, 'nusuk_no', e.target.value)}
                                                disabled={isDeleted || isCancelled}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="relative">
                                                <select
                                                    className={`appearance-none border rounded-lg px-3 py-2 w-full text-[10px] font-black uppercase cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-primary/20 ${statusColor} text-center transition-all bg-transparent`}
                                                    value={nData.status || 'blank'}
                                                    onChange={(e) => {
                                                        handleUpdate(r.no_rsv, 'status', e.target.value);
                                                    }}
                                                    disabled={isDeleted || isCancelled}
                                                >
                                                    <option value="blank">Blank</option>
                                                    <option value="waiting approval">Waiting</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                                {updating[r.no_rsv] && (
                                                    <div className="absolute top-1/2 -right-5 -translate-y-1/2">
                                                        <Loader size={14} className="animate-spin text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
