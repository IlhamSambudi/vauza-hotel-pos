import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';
import { Save, Loader } from 'lucide-react';

export default function NusukAgreement() {
    const [reservations, setReservations] = useState([]);
    const [nusukData, setNusukData] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});

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
            // Revert? For now just log.
        } finally {
            setUpdating(prev => ({ ...prev, [no_rsv]: false }));
        }
    };

    return (
        <DashboardLayout title="Nusuk Agreement">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
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
                                <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr>
                            ) : reservations.map(r => {
                                const nData = nusukData[r.no_rsv] || { nusuk_no: '', status: 'blank' };
                                const statusColor = {
                                    'blank': 'bg-gray-100 text-gray-500',
                                    'waiting approval': 'bg-purple-100 text-purple-700',
                                    'approved': 'bg-green-100 text-green-700',
                                    'rejected': 'bg-red-100 text-red-700',
                                }[nData.status] || 'bg-gray-100';

                                return (
                                    <tr key={r.no_rsv} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono font-bold text-xs">{r.no_rsv}</td>
                                        <td className="p-4 font-bold">{r.nama_client}</td>
                                        <td className="p-4 text-gray-600">{r.nama_hotel}</td>
                                        <td className="p-4 text-xs">{formatDate(r.checkin)}</td>
                                        <td className="p-4 text-xs">{formatDate(r.checkout)}</td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                className="border border-gray-300 rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-primary"
                                                value={nData.nusuk_no || ''}
                                                placeholder="Input Nusuk No"
                                                onChange={(e) => handleUpdate(r.no_rsv, 'nusuk_no', e.target.value)}
                                                onBlur={(e) => saveChanges(r.no_rsv, 'nusuk_no', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <select
                                                className={`border-0 rounded-full px-3 py-1 w-full text-xs font-bold uppercase cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-primary ${statusColor}`}
                                                value={nData.status || 'blank'}
                                                onChange={(e) => {
                                                    handleUpdate(r.no_rsv, 'status', e.target.value);
                                                    saveChanges(r.no_rsv, 'status', e.target.value); // specific explicit save call
                                                }}
                                            >
                                                <option value="blank">Blank</option>
                                                <option value="waiting approval">Waiting Approval</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                            {updating[r.no_rsv] && <span className="text-[10px] text-gray-400 ml-1">Saving...</span>}
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
