import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EditModal from '../components/EditReservationModal';
import Layout from '../layouts/DashboardLayout';

export default function Reservations() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [editData, setEditData] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [showDeleted, setShowDeleted] = useState(false);

    const [form, setForm] = useState({
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
        const [c, h, r] = await Promise.all([
            api.get('/clients'),
            api.get('/hotels'),
            api.get('/reservations')
        ]);
        setClients(c.data);
        setHotels(h.data);
        setReservations(r.data);
    };

    useEffect(() => { load(); }, []);

    const submit = async () => {
        try {
            if (!form.id_client || !form.id_hotel || !form.checkin || !form.checkout) {
                alert('Please fill in all required fields (Client, Hotel, CheckIn, CheckOut)');
                return;
            }
            await api.post('/reservations', form);
            alert('Reservation created successfully');
            load();
        } catch (err) {
            console.error(err);
            alert('Failed to create reservation: ' + (err.response?.data?.message || err.message));
        }
    };

    const saveEdit = async (payload) => {
        await api.put(`/reservations/${payload.no_rsv}/payment`, payload);
        setEditData(null);
        load();
    };

    const deleteRsv = async (no_rsv) => {
        if (!confirm('Hapus reservasi ini?')) return;
        await api.delete(`/reservations/${no_rsv}`);
        load();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const labelClass = "text-[10px] font-bold text-textSub mb-2 block uppercase tracking-wide ml-1 opacity-70";
    const inputClass = "w-full bg-neu border-none rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-neu-pressed transition-all placeholder-textSub/30 font-medium";

    const filteredReservations = showDeleted ? reservations : reservations.filter(r => r.tag_status !== 'delete');

    return (
        <Layout title="Reservations">
            <div className="mb-8 flex justify-left">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-neu text-primary px-6 py-3 rounded-xl hover:text-primaryHover transition-all font-black tracking-wide shadow-neu-flat hover:shadow-neu-button active:shadow-neu-pressed hover:-translate-y-0.5"
                >
                    {showForm ? 'CANCEL RESERVATION' : '+ NEW RESERVATION'}
                </button>
            </div>

            {/* FORM CREATE */}
            {showForm && (
                <div className="bg-neu rounded-2xl p-8 shadow-neu-flat border-none mb-10 max-w-[1200px] grid grid-cols-2 gap-x-8 gap-y-6 animate-fade-in-up">

                    <div>
                        <label className={labelClass}>Client</label>
                        <select
                            className={inputClass}
                            onChange={e => setForm({ ...form, id_client: e.target.value })}
                        >
                            <option value="">Select Client</option>
                            {clients.filter(c => c.tag_status !== 'delete').map(c => (
                                <option key={c.id_client} value={c.id_client}>{c.nama_client}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Hotel</label>
                        <select
                            className={inputClass}
                            onChange={e => setForm({ ...form, id_hotel: e.target.value })}
                        >
                            <option value="">Select Hotel</option>
                            {hotels.filter(h => h.tag_status !== 'delete').map(h => (
                                <option key={h.id_hotel} value={h.id_hotel}>{h.nama_hotel}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Checkin</label>
                        <input type="date" className={inputClass} onChange={e => setForm({ ...form, checkin: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Checkout</label>
                        <input type="date" className={inputClass} onChange={e => setForm({ ...form, checkout: e.target.value })} />
                    </div>

                    <div>
                        <label className={labelClass}>Room Double</label>
                        <input placeholder="Qty" type="number" className={inputClass} onChange={e => setForm({ ...form, room_double: +e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Rate Double (SAR)</label>
                        <input placeholder="Rate in SAR" type="number" className={inputClass} onChange={e => setForm({ ...form, room_double_rate: +e.target.value })} />
                    </div>

                    <div>
                        <label className={labelClass}>Room Triple</label>
                        <input placeholder="Qty" type="number" className={inputClass} onChange={e => setForm({ ...form, room_triple: +e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Rate Triple (SAR)</label>
                        <input placeholder="Rate in SAR" type="number" className={inputClass} onChange={e => setForm({ ...form, room_triple_rate: +e.target.value })} />
                    </div>

                    <div>
                        <label className={labelClass}>Room Quad</label>
                        <input placeholder="Qty" type="number" className={inputClass} onChange={e => setForm({ ...form, room_quad: +e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Rate Quad (SAR)</label>
                        <input placeholder="Rate in SAR" type="number" className={inputClass} onChange={e => setForm({ ...form, room_quad_rate: +e.target.value })} />
                    </div>

                    <div>
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

                    <div>
                        <label className={labelClass}>Deadline Payment</label>
                        <input type="date" className={inputClass} onChange={e => setForm({ ...form, deadline_payment: e.target.value })} />
                    </div>

                    <div className="col-span-2 pt-6">
                        <button onClick={submit} className="w-full bg-neu text-primary py-4 rounded-xl hover:text-primaryHover transition-all font-black tracking-wide text-lg shadow-neu-flat active:shadow-neu-pressed hover:-translate-y-0.5">
                            CREATE RESERVATION
                        </button>
                    </div>
                </div>
            )}

            {/* TABLE */}
            <div className="bg-neu rounded-2xl shadow-neu-flat border-none w-full overflow-hidden p-6">
                <div className="overflow-x-auto rounded-xl">
                    <table className="w-full min-w-max text-sm text-textMain whitespace-nowrap border-collapse">
                        <thead className="text-textSub">
                            <tr>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">RSV</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Client</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Hotel</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Check In</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Check Out</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Amount (SAR)</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Meal</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Paid (SAR)</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Booking</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Payment</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider w-[120px] opacity-70">
                                    <button
                                        onClick={() => setShowDeleted(!showDeleted)}
                                        className="flex items-center gap-2 hover:text-primary transition-colors focus:outline-none group opacity-100"
                                        title={showDeleted ? "Hide Deleted" : "Show Deleted"}
                                    >
                                        <span>STATUS</span>
                                        {showDeleted ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-primary">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-primary">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        )}
                                    </button>
                                </th>
                                <th className="p-4 text-right font-bold uppercase text-[10px] tracking-wider opacity-70">Action</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-2">
                            {filteredReservations.map(r => {
                                const isDeleted = r.tag_status === 'delete';
                                return (
                                    <tr key={r.no_rsv} className={`transition-colors border-b border-transparent ${isDeleted ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
                                        <td className="p-4 relative text-primary font-bold font-mono text-xs">
                                            {r.no_rsv}
                                            {isDeleted && <span className="ml-2 text-[8px] text-red-500 font-bold border border-red-200 px-1 rounded block w-fit">DELETED</span>}
                                        </td>
                                        <td className="p-4 font-bold">{r.nama_client}</td>
                                        <td className="p-4 text-xs font-medium text-textSub">{r.nama_hotel}</td>
                                        <td className="p-4">{formatDate(r.checkin)}</td>
                                        <td className="p-4">{formatDate(r.checkout)}</td>
                                        <td className="p-4 font-mono">{Number(r.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-xs">{r.meal}</td>
                                        <td className="p-4 font-mono">{Number(r.paid_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-neu-pressed ${r.status_booking === 'Definite'
                                                ? 'text-green-600'
                                                : r.status_booking === 'Tentative'
                                                    ? 'text-red-500'
                                                    : 'text-gray-400'
                                                }`}>
                                                {r.status_booking}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-neu-pressed ${r.status_payment === 'full_payment' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {(() => {
                                                    const map = {
                                                        'unpaid': 'UNPAID',
                                                        'dp_30': 'DP 30%',
                                                        'partial': 'PARTIAL',
                                                        'full_payment': 'FULL PAYMENT'
                                                    };
                                                    return map[r.status_payment] || r.status_payment;
                                                })()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {r.tag_status === 'new' && <span className="shadow-neu-pressed text-green-600 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">NEW</span>}
                                            {r.tag_status === 'edited' && <span className="shadow-neu-pressed text-blue-500 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">EDITED</span>}
                                            {r.tag_status === 'delete' && <span className="shadow-neu-pressed text-red-500 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">DELETED</span>}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            {!isDeleted && (
                                                <button
                                                    onClick={() => setEditData(r)}
                                                    className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg font-bold text-[10px] uppercase tracking-wide hover:bg-blue-500/20 transition-all"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (r.status_booking !== 'Definite') {
                                                        alert('Comparison Letter hanya untuk status Definite');
                                                    } else {
                                                        const url = `/cl/${r.no_rsv}`;
                                                        window.open(url, '_blank');
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold text-[10px] uppercase tracking-wide hover:bg-primary/20 transition-all"
                                            >
                                                Print CL
                                            </button>
                                            {!isDeleted && (
                                                <button
                                                    onClick={() => deleteRsv(r.no_rsv)}
                                                    className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg font-bold text-[10px] uppercase tracking-wide hover:bg-red-500/20 transition-all"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                            {isDeleted && <span className="text-xs text-textSub italic opacity-50 px-3 py-1.5">Read Only</span>}
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
