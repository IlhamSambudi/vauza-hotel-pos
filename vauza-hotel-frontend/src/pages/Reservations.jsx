import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';
import EditModal from '../components/EditReservationModal';
import Layout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import useTable from '../hooks/useTable';
import TableControls from '../components/TableControls';
import Tooltip from '../components/Tooltip';
import { Edit2, Printer, Trash2, Eye, EyeOff, Plus, Calendar, User, Building, CreditCard } from 'lucide-react';

const StatusBadge = ({ status }) => {
    if (status === 'new') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">NEW</span>;
    if (status === 'edited') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">EDITED</span>;
    if (status === 'delete') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">DELETED</span>;
    return null;
};

const BookingBadge = ({ status }) => {
    const styles = {
        'Definite': 'bg-emerald-100 text-emerald-700',
        'Tentative': 'bg-red-100 text-red-600',
        'Amend': 'bg-purple-100 text-purple-700',
        'Upgraded': 'bg-blue-100 text-blue-700',
        'default': 'bg-gray-100 text-gray-600'
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[status] || styles.default}`}>
            {status}
        </span>
    );
};

const PaymentBadge = ({ status }) => {
    const styles = {
        'unpaid': 'bg-red-100 text-red-600',
        'dp_30': 'bg-orange-100 text-orange-700',
        'partial': 'bg-yellow-100 text-yellow-700',
        'full_payment': 'bg-emerald-100 text-emerald-700',
        'default': 'bg-gray-100 text-gray-600'
    };
    const map = {
        'unpaid': 'UNPAID',
        'dp_30': 'DP 30%',
        'partial': 'PARTIAL',
        'full_payment': 'FULL PAYMENT'
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[status] || styles.default}`}>
            {map[status] || status}
        </span>
    );
};

export default function Reservations() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);

    const [form, setForm] = useState({
        no_rsv: '', id_client: '', id_hotel: '', checkin: '', checkout: '',
        room_double: 0, room_triple: 0, room_quad: 0, room_extra: 0,
        room_double_rate: 0, room_triple_rate: 0, room_quad_rate: 0, room_extra_rate: 0,
        meal: '', deadline_payment: ''
    });

    const load = async () => {
        setLoading(true);
        try {
            const [c, h, r] = await Promise.all([
                api.get('/clients'),
                api.get('/hotels'),
                api.get('/reservations')
            ]);
            setClients(c.data);
            setHotels(h.data);
            setReservations(r.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const submit = async () => {
        try {
            if (!form.no_rsv || !form.id_client || !form.id_hotel || !form.checkin || !form.checkout) {
                toast.error('Please fill in Reservation ID, checkin/out, client, hotel');
                return;
            }
            await api.post('/reservations', form);
            toast.success('Reservation created successfully');
            setShowForm(false);
            load();
        } catch (err) {
            console.error(err);
            toast.error('Failed to create reservation: ' + (err.response?.data?.message || err.message));
        }
    };

    const saveEdit = async (payload) => {
        try {
            await api.put(`/reservations/${payload.no_rsv}`, payload);
            toast.success("Reservation updated");
            setEditData(null);
            load();
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    const deleteRsv = async (no_rsv) => {
        if (!confirm('Hapus reservasi ini?')) return;
        try {
            await api.delete(`/reservations/${no_rsv}`);
            toast.success("Reservation deleted");
            load();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };



    const labelClass = "text-xs font-semibold text-textSub mb-2 block uppercase tracking-wide ml-1";
    const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 font-medium";

    // Integrate useTable
    const {
        data: processedReservations,
        search, setSearch,
        sort, setSort,
        filters, setFilter
    } = useTable({
        data: showDeleted ? reservations : reservations.filter(r => r.tag_status !== 'delete'),
        defaultSort: { key: 'no_rsv', direction: 'desc' }
    });

    return (
        <Layout title="Reservations">
            <div className="mb-6 flex justify-between items-center">
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="shadow-sm hover:shadow-md"
                >
                    <span className="flex items-center gap-2">
                        {showForm ? 'CANCEL' : <><Plus size={18} /> NEW RESERVATION</>}
                    </span>
                </Button>

                <button
                    onClick={() => setShowDeleted(!showDeleted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${showDeleted ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-textSub hover:bg-gray-50 border border-gray-200'}`}
                >
                    {showDeleted ? <><Eye size={14} /> Hide Deleted</> : <><EyeOff size={14} /> Show Deleted</>}
                </button>
            </div>

            {/* FORM CREATE */}
            {showForm && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10 animate-fade-in-up">
                    <h3 className="text-lg font-bold text-textMain mb-6 flex items-center gap-2">
                        <Calendar className="text-primary" size={24} />
                        New Reservation Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Reservation ID (Manual) */}
                        <div className="md:col-span-4">
                            <label className={labelClass}>Reservation No (ID)</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={form.no_rsv}
                                onChange={e => setForm({ ...form, no_rsv: e.target.value })}
                                placeholder="e.g 123"
                            />
                        </div>

                        {/* Client & Hotel */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Client</label>
                                <div className="relative">
                                    <select
                                        className={`${inputClass} appearance-none`}
                                        onChange={e => setForm({ ...form, id_client: e.target.value })}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select Client</option>
                                        {clients.filter(c => c.tag_status !== 'delete').map(c => (
                                            <option key={c.id_client} value={c.id_client}>{c.nama_client}</option>
                                        ))}
                                    </select>
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Hotel</label>
                                <div className="relative">
                                    <select
                                        className={`${inputClass} appearance-none`}
                                        onChange={e => setForm({ ...form, id_hotel: e.target.value })}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select Hotel</option>
                                        {hotels.filter(h => h.tag_status !== 'delete').map(h => (
                                            <option key={h.id_hotel} value={h.id_hotel}>{h.nama_hotel}</option>
                                        ))}
                                    </select>
                                    <Building className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div>
                            <label className={labelClass}>Checkin</label>
                            <input
                                type="date"
                                className={inputClass}
                                onChange={e => {
                                    const dateVal = e.target.value;
                                    const deadline = new Date(dateVal);
                                    deadline.setDate(deadline.getDate() - 15);
                                    const deadlineStr = deadline.toISOString().split('T')[0];

                                    setForm({
                                        ...form,
                                        checkin: dateVal,
                                        deadline_payment: deadlineStr
                                    });
                                }}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Checkout</label>
                            <input type="date" className={inputClass} onChange={e => setForm({ ...form, checkout: e.target.value })} />
                        </div>

                        {/* Rooms & Rates - Grouped */}
                        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">

                            {/* Layout: Qty | Rate for each type */}
                            <div className="col-span-1 grid grid-cols-2 gap-2 border-r border-gray-200 pr-4">
                                <div>
                                    <label className={labelClass}>Dbl Qty</label>
                                    <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_double: +e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Rate</label>
                                    <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_double_rate: +e.target.value })} />
                                </div>
                            </div>

                            <div className="col-span-1 grid grid-cols-2 gap-2 border-r border-gray-200 pr-4">
                                <div>
                                    <label className={labelClass}>Trpl Qty</label>
                                    <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_triple: +e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Rate</label>
                                    <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_triple_rate: +e.target.value })} />
                                </div>
                            </div>

                            <div className="col-span-1 grid grid-cols-2 gap-2 border-r border-gray-200 pr-4">
                                <div>
                                    <label className={labelClass}>Quad Qty</label>
                                    <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_quad: +e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Rate</label>
                                    <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_quad_rate: +e.target.value })} />
                                </div>
                            </div>

                            <div className="col-span-1 grid grid-cols-2 gap-2">
                                <div>
                                    <label className={labelClass}>Extra/Sts</label>
                                    <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_extra: +e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Rate</label>
                                    <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_extra_rate: +e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Other Details */}
                        <div className="md:col-span-2">
                            <label className={labelClass}>Meal Type</label>
                            <select
                                value={form.meal}
                                onChange={(e) => setForm({ ...form, meal: e.target.value })}
                                className={inputClass}
                            >
                                <option value="">Select Meal</option>
                                <option value="ASIAN F.B">ASIAN F.B</option>
                                <option value="BF ONLY">BF ONLY</option>
                                <option value="INTERNATIONAL BUFFET">INTERNATIONAL BUFFET</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Deadline Payment</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.deadline_payment}
                                onChange={e => setForm({ ...form, deadline_payment: e.target.value })}
                            />
                        </div>

                        {/* Add Note */}
                        <div className="md:col-span-4">
                            <label className={labelClass}>Add Note</label>
                            <textarea
                                className={`${inputClass} min-h-[80px]`}
                                value={form.note || ''}
                                onChange={e => setForm({ ...form, note: e.target.value })}
                                placeholder="Additional information..."
                            />
                        </div>

                        <div className="md:col-span-4 pt-4 flex justify-end">
                            <Button onClick={submit} className="bg-primary text-white hover:bg-primaryHover uppercase font-bold tracking-wide rounded-full shadow-lg shadow-primary/30">
                                CREATE RESERVATION
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <TableControls
                search={search} setSearch={setSearch}
                sort={sort} setSort={setSort}
                filters={filters} setFilter={setFilter}
                sortOptions={[
                    { key: 'no_rsv', label: 'RSV No' },
                    { key: 'checkin', label: 'Check-in Date' },
                    { key: 'nama_client', label: 'Client Name' },
                    { key: 'nama_hotel', label: 'Hotel Name' }
                ]}
                filterOptions={[
                    {
                        key: 'status_payment',
                        label: 'Payment',
                        options: [
                            { value: 'unpaid', label: 'Unpaid' },
                            { value: 'dp_30', label: 'DP 30%' },
                            { value: 'partial', label: 'Partial' },
                            { value: 'full_payment', label: 'Full Payment' }
                        ]
                    }
                ]}
            />

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="sticky top-0 z-20 bg-white shadow-sm">
                            <tr>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub border-b border-gray-100">No RSV</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub border-b border-gray-100">Client</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub border-b border-gray-100">Hotel</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub border-b border-gray-100">Stay Dates</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub border-b border-gray-100">Room Type</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub border-b border-gray-100">Meal</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub text-right border-b border-gray-100">Amount (SAR)</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub text-right border-b border-gray-100">Paid (SAR)</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub text-center border-b border-gray-100">Booking</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub text-center border-b border-gray-100">Payment</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub text-center border-b border-gray-100">Status</th>
                                <th className="py-4 px-6 font-semibold uppercase text-[10px] tracking-wider text-textSub text-right border-b border-gray-100">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="12" className="p-6">
                                            <Skeleton className="h-8 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : processedReservations.map(r => {
                                const isDeleted = r.tag_status === 'delete';
                                // Room Type Aggregation
                                const roomTypes = [];
                                if (r.room_double > 0) roomTypes.push(`Dbl:${r.room_double}`);
                                if (r.room_triple > 0) roomTypes.push(`Trpl:${r.room_triple}`);
                                if (r.room_quad > 0) roomTypes.push(`Quad:${r.room_quad}`);
                                if (r.room_extra > 0) roomTypes.push(`Ext:${r.room_extra}`);
                                const roomTypeStr = roomTypes.join(', ');

                                return (
                                    <tr key={r.no_rsv} className={`group hover:bg-gray-50 transition-colors ${isDeleted ? 'opacity-50 grayscale bg-gray-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">{r.no_rsv}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-textMain">{r.nama_client}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-semibold text-textSub uppercase tracking-wide">{r.nama_hotel}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-2 text-textSub">
                                                    <span className="w-8 uppercase font-bold text-[10px] text-gray-400">In</span>
                                                    <span className="font-medium bg-gray-50 px-1.5 py-0.5 rounded text-textMain">{formatDate(r.checkin)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-textSub">
                                                    <span className="w-8 uppercase font-bold text-[10px] text-gray-400">Out</span>
                                                    <span className="font-medium bg-gray-50 px-1.5 py-0.5 rounded text-textMain">{formatDate(r.checkout)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-textSub bg-gray-50 px-2 py-1 rounded inline-block">{roomTypeStr || "-"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-textSub bg-gray-50 px-2 py-1 rounded inline-block">{r.meal}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-mono font-bold text-textMain">{Number(r.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-mono text-textSub">{Number(r.paid_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <BookingBadge status={r.status_booking} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <PaymentBadge status={r.status_payment} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={r.tag_status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isDeleted && (
                                                    <>
                                                        <Tooltip text="Edit">
                                                            <button
                                                                onClick={() => setEditData(r)}
                                                                className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                            >
                                                                <Edit2 size={16} strokeWidth={2} />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Print">
                                                            <button
                                                                onClick={() => window.open(`/cl/${r.no_rsv}`, '_blank')}
                                                                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                                                            >
                                                                <Printer size={16} strokeWidth={2} />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Delete">
                                                            <button
                                                                onClick={() => deleteRsv(r.no_rsv)}
                                                                className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 size={16} strokeWidth={2} />
                                                            </button>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {isDeleted && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deleted</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {editData && (
                <EditModal
                    data={editData}
                    onClose={() => setEditData(null)}
                    onSave={saveEdit}
                />
            )}
        </Layout>
    );
}
