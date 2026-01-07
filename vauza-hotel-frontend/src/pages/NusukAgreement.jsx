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
            const nusuk = resNusuk.data || []; // Array of {nusuk_no, no_rsv, status}

            // Map nusuk data by no_rsv for easy access
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
        // Optimistic update locally
        setNusukData(prev => ({
            ...prev,
            [no_rsv]: {
                ...prev[no_rsv],
                [field]: value
            }
        }));

        // Trigger save (debounced or immediate? Immediate for simple use case, but handle status separately)
        saveChanges(no_rsv, field, value);
    };

    const saveChanges = async (no_rsv, field, value) => {
        setUpdating(prev => ({ ...prev, [no_rsv]: true }));
        try {
            const current = nusukData[no_rsv] || {};
            // If changing field is 'status', use new value, else use current. Same for nusuk_no.
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${showDeleted ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-textSub hover:bg-gray-50 border border-gray-200'}`}
                >
                    {showDeleted ? <><Eye size={14} /> Hide Deleted</> : <><EyeOff size={14} /> Show Deleted</>}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-500 uppercase text-xs">RSV No</th>
                                <th className="p-4 font-semibold text-gray-500 uppercase text-xs">Client</th>
                                <th className="p-4 font-semibold text-gray-500 uppercase text-xs">Hotel</th>
                                <th className="p-4 font-semibold text-gray-500 uppercase text-xs">Check In</th>
                                <th className="p-4 font-semibold text-gray-500 uppercase text-xs">Check Out</th>
                                <th className="p-4 font-semibold text-gray-500 uppercase text-xs w-48">Nusuk No</th>
                                <th className="p-4 font-semibold text-gray-500 uppercase text-xs w-48">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="7" className="p-8">
                                            <Skeleton className="h-8 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : processedReservations.map(r => {
                                const isDeleted = r.tag_status === 'delete';
                                // We use r.nusuk_status and r.nusuk_no from combined data, 
                                // BUT input should update local state to reflect changes instantly.
                                // It effectively works because handleUpdate updates nusukData -> useMemo -> combinedData -> re-render.
                                // Just need to be careful with binding.
                                const nData = nusukData[r.no_rsv] || { nusuk_no: '', status: 'blank' };

                                const statusColor = {
                                    'blank': 'bg-gray-100 text-gray-500',
                                    'waiting approval': 'bg-purple-100 text-purple-700',
                                    'approved': 'bg-green-100 text-green-700',
                                    'rejected': 'bg-red-100 text-red-700',
                                }[nData.status] || 'bg-gray-100';

                                return (
                                    <tr key={r.no_rsv} className={`hover:bg-gray-50 transition-colors ${isDeleted ? 'opacity-50 grayscale' : ''}`}>
                                        <td className="p-4 font-mono font-bold text-xs text-primary">{r.no_rsv}</td>
                                        <td className="p-4 font-bold text-textMain">{r.nama_client}</td>
                                        <td className="p-4 text-textSub text-xs uppercase font-medium">{r.nama_hotel}</td>
                                        <td className="p-4 text-xs font-mono text-textMain">{formatDate(r.checkin)}</td>
                                        <td className="p-4 text-xs font-mono text-textMain">{formatDate(r.checkout)}</td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                className="border border-gray-200 rounded-lg px-3 py-2 w-full text-xs font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                                                value={nData.nusuk_no || ''}
                                                placeholder="Nusuk No"
                                                onChange={(e) => handleUpdate(r.no_rsv, 'nusuk_no', e.target.value)}
                                                disabled={isDeleted}
                                            // Removed onBlur explicit save as we save on change via handleUpdate's debounce/immediate logic
                                            // Actually logic says handleUpdate calls saveChanges immediately.
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="relative">
                                                <select
                                                    className={`appearance-none border-0 rounded-full px-3 py-1.5 w-full text-[10px] font-bold uppercase cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-primary/20 ${statusColor} text-center`}
                                                    value={nData.status || 'blank'}
                                                    onChange={(e) => {
                                                        handleUpdate(r.no_rsv, 'status', e.target.value);
                                                    }}
                                                    disabled={isDeleted}
                                                >
                                                    <option value="blank">Blank</option>
                                                    <option value="waiting approval">Waiting</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                                {updating[r.no_rsv] && (
                                                    <div className="absolute top-1/2 -right-4 -translate-y-1/2">
                                                        <Loader size={12} className="animate-spin text-primary" />
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
