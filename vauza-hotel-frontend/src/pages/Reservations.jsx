import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import EditModal from '../components/EditReservationModal';
import Layout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import Tooltip from '../components/Tooltip';
import { Edit2, Printer, Trash2, Eye, EyeOff, Plus, Calendar, User, Building, CreditCard } from 'lucide-react';

const StatusBadge = ({ status }) => {
    if (status === 'new') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success uppercase tracking-wide">NEW</span>;
    if (status === 'edited') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary uppercase tracking-wide">EDITED</span>;
    if (status === 'delete') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-danger/10 text-danger uppercase tracking-wide">DELETED</span>;
    return null;
};

const BookingBadge = ({ status }) => {
    const styles = {
        'Definite': 'bg-green-100 text-green-700',
        'Tentative': 'bg-red-100 text-red-700',
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
        'full_payment': 'bg-success/10 text-success',
        'default': 'bg-warning/10 text-warning'
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
        no_rsv: '',
        id_client: '',
        id_hotel: '',
        checkin: '',
        checkout: '',
        room_double: 0,
        room_triple: 0,
        room_quad: 0,
        room_double_rate: 0,
        room_triple_rate: 0,
        room_quad_rate: 0,
        meal: '',
        deadline_payment: ''
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
            await api.put(`/reservations/${payload.no_rsv}/payment`, payload);
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const labelClass = "text-[10px] font-bold text-textSub mb-2 block uppercase tracking-wide ml-1";
    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 font-medium";
    const filteredReservations = showDeleted ? reservations : reservations.filter(r => r.tag_status !== 'delete');

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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${showDeleted ? 'bg-primary/10 text-primary' : 'bg-white text-textSub hover:bg-gray-50 border border-gray-200'}`}
                >
                    {showDeleted ? <><Eye size={14} /> Hide Deleted</> : <><EyeOff size={14} /> Show Deleted</>}
                </button>
            </div>

            {/* FORM CREATE */}
            {showForm && (
                <div className="bg-white rounded-card p-8 shadow-card border border-gray-100 mb-10 animate-fade-in-up">
                    <h3 className="text-lg font-black text-textMain mb-6 flex items-center gap-2">
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
                            <input type="date" className={inputClass} onChange={e => setForm({ ...form, checkin: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Checkout</label>
                            <input type="date" className={inputClass} onChange={e => setForm({ ...form, checkout: e.target.value })} />
                        </div>

                        {/* Rooms & Rates - Grouped */}
                        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div>
                                <label className={labelClass}>Double Qty</label>
                                <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_double: +e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Double Rate (SAR)</label>
                                <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_double_rate: +e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Triple Qty</label>
                                <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_triple: +e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Triple Rate (SAR)</label>
                                <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_triple_rate: +e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Quad Qty</label>
                                <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_quad: +e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Quad Rate (SAR)</label>
                                <input placeholder="0" type="number" className={inputClass} onChange={e => setForm({ ...form, room_quad_rate: +e.target.value })} />
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
                            <input type="date" className={inputClass} onChange={e => setForm({ ...form, deadline_payment: e.target.value })} />
                        </div>

                        <div className="md:col-span-4 pt-4 flex justify-end">
                            <Button onClick={submit} className="px-8 py-3 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                CREATE RESERVATION
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white rounded-card shadow-card border border-gray-100 w-full overflow-hidden p-6">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-textMain whitespace-nowrap border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">RSV #</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Client</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Hotel</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Dates</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Amount (SAR)</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Meal</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Paid (SAR)</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Booking</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Payment</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Status</th>
                                <th className="py-3 px-4 text-right font-bold uppercase text-[10px] tracking-wider text-textSub">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0">
                                        <td colSpan="11" className="p-4">
                                            <Skeleton className="h-12 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredReservations.map(r => {
                                const isDeleted = r.tag_status === 'delete';
                                return (
                                    <tr key={r.no_rsv} className={`transition-all border-b border-gray-50 last:border-0 ${isDeleted ? 'opacity-50 grayscale' : 'hover:bg-gray-50'}`}>
                                        <td className="p-4 relative">
                                            <span className="font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded-md text-xs">{r.no_rsv}</span>
                                        </td>
                                        <td className="p-4 font-bold text-textMain">{r.nama_client}</td>
                                        <td className="p-4 text-xs font-semibold text-textSub">{r.nama_hotel}</td>
                                        <td className="p-4 text-xs text-textSub">
                                            <div>In: <span className="text-textMain font-medium">{formatDate(r.checkin)}</span></div>
                                            <div>Out: <span className="text-textMain font-medium">{formatDate(r.checkout)}</span></div>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-textMain">{Number(r.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-xs font-medium">{r.meal}</td>
                                        <td className="p-4 font-mono text-textSub">{Number(r.paid_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-4">
                                            <BookingBadge status={r.status_booking} />
                                        </td>
                                        <td className="p-4">
                                            <PaymentBadge status={r.status_payment} />
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={r.tag_status} />
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2 items-center">
                                            {!isDeleted && (
                                                <Tooltip text="Edit Reservation">
                                                    <button
                                                        onClick={() => setEditData(r)}
                                                        className="p-2 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </Tooltip>
                                            )}
                                            <Tooltip text="Print Confirmation Letter">
                                                <button
                                                    onClick={() => {
                                                        if (r.status_booking !== 'Definite') {
                                                            toast.error('Comparison Letter hanya untuk status Definite');
                                                        } else {
                                                            const url = `/cl/${r.no_rsv}`;
                                                            window.open(url, '_blank');
                                                        }
                                                    }}
                                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                            </Tooltip>
                                            {!isDeleted && (
                                                <Tooltip text="Permanently Delete">
                                                    <button
                                                        onClick={() => deleteRsv(r.no_rsv)}
                                                        className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {isDeleted && <span className="text-xs text-textSub italic font-medium px-2">Read Only</span>}
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
