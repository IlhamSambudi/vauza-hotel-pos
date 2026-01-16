import React, { useEffect, useState } from 'react';
import Layout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';
import useTable from '../hooks/useTable';
import TableControls from '../components/TableControls';
import Tooltip from '../components/Tooltip';
import StatusBadge from '../components/StatusBadge';
import { Plus, FileText, Building, ExternalLink, Edit2, Trash2, Eye, EyeOff, Calendar, List, DollarSign } from 'lucide-react';

export default function Supply() {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDeleted, setShowDeleted] = useState(false);

    const initialForm = {
        vendor: '', no_rsv: '', id_hotel: '', checkin: '', checkout: '', stay_night: 0, meal: '',
        double: 0, triple: 0, quad: 0, extra: 0,
        double_rates: 0, triple_rates: 0, quad_rates: 0, extra_rates: 0,
        total_amount: 0, file: null
    };

    const [form, setForm] = useState(initialForm);

    // Integrate useTable
    const {
        data: processedSupply,
        search, setSearch,
        sort, setSort,
        filters, setFilter
    } = useTable({
        data: Array.isArray(supplies) ? (showDeleted ? supplies : supplies.filter(s => s.tag_status !== 'delete')) : [],
        defaultSort: { key: 'created_at', direction: 'desc' }
    });

    // Auto-calculate Total Amount & Stay Nights
    useEffect(() => {
        let updates = {};

        // Calculate Nights
        if (form.checkin && form.checkout) {
            const start = new Date(form.checkin);
            const end = new Date(form.checkout);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (!isNaN(diffDays) && diffDays >= 0 && diffDays !== form.stay_night) {
                updates.stay_night = diffDays;
            }
        }

        // Calculate Total
        const nights = Number(updates.stay_night || form.stay_night) || 0;

        // Calculate room totals
        const d = Number(form.double || 0) * Number(form.double_rates || 0);
        const t = Number(form.triple || 0) * Number(form.triple_rates || 0);
        const q = Number(form.quad || 0) * Number(form.quad_rates || 0);
        const e = Number(form.extra || 0) * Number(form.extra_rates || 0);

        const total = (d + t + q + e) * (nights > 0 ? nights : 1);

        if (total !== form.total_amount) {
            updates.total_amount = total;
        }

        if (Object.keys(updates).length > 0) {
            setForm(prev => ({ ...prev, ...updates }));
        }

    }, [
        form.checkin, form.checkout,
        form.double, form.triple, form.quad, form.extra,
        form.double_rates, form.triple_rates, form.quad_rates, form.extra_rates,
        form.stay_night
    ]);

    const [hotels, setHotels] = useState([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resSupply, resHotels] = await Promise.all([
                api.get('/supply'),
                api.get('/hotels')
            ]);
            setSupplies(Array.isArray(resSupply.data) ? resSupply.data : []);
            setHotels(Array.isArray(resHotels.data) ? resHotels.data : []);
        } catch (err) {
            toast.error("Failed to load data");
            console.error(err);
            setSupplies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.vendor || !form.no_rsv) {
            toast.error("Vendor and RSV No are required");
            return;
        }

        setUploading(true);
        const formData = new FormData();

        // Append all form fields
        Object.keys(form).forEach(key => {
            if (key === 'file') {
                if (form.file) formData.append('file', form.file);
            } else if (form[key] !== null && form[key] !== undefined) {
                formData.append(key, form[key]);
            }
        });

        try {
            if (editId) {
                await api.put(`/supply/${editId}`, formData);
                toast.success("Supply CL Updated");
            } else {
                await api.post('/supply', formData);
                toast.success("Supply CL Created");
            }
            setShowForm(false);
            setForm(initialForm);
            loadData();
        } catch (err) {
            console.error("Submit error:", err);
            toast.error(err.response?.data?.message || "Failed to save Supply CL");
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (item) => {
        setForm({
            vendor: item.vendor,
            no_rsv: item.no_rsv,
            id_hotel: item.id_hotel || '',
            checkin: item.checkin?.split('T')[0],
            checkout: item.checkout?.split('T')[0],
            stay_night: item.stay_night,
            meal: item.meal,
            double: item.double, triple: item.triple, quad: item.quad, extra: item.extra,
            double_rates: item.double_rates, triple_rates: item.triple_rates, quad_rates: item.quad_rates, extra_rates: item.extra_rates,
            total_amount: item.total_amount,
            file: null
        });
        setEditId(item.id_supply);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this Supply CL?")) {
            try {
                await api.delete(`/supply/${id}`);
                toast.success("Deleted");
                loadData();
            } catch (err) {
                toast.error("Failed to delete");
            }
        }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-slate-400 font-medium hover:bg-white hover:border-slate-300";
    const labelClass = "text-[10px] font-bold text-slate-500 mb-2 block uppercase tracking-wide ml-1";

    return (
        <Layout title="Supply Confirmation Letters">

            <div className="mb-6 flex justify-between items-center">
                <Button
                    onClick={() => { setShowForm(!showForm); setEditId(null); setForm(initialForm); }}
                    className={`shadow-lg shadow-primary/20 transition-all ${showForm ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-primary hover:bg-primaryHover'}`}
                >
                    <span className="flex items-center gap-2 font-bold tracking-wide uppercase">
                        {showForm ? 'CANCEL' : <><Plus size={18} strokeWidth={2.5} /> NEW SUPPLY CL</>}
                    </span>
                </Button>

                <button
                    onClick={() => setShowDeleted(!showDeleted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${showDeleted ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    {showDeleted ? <><Eye size={14} /> Hide Deleted</> : <><EyeOff size={14} /> Show Deleted</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8 animate-fade-in-up">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <FileText size={24} strokeWidth={2.5} />
                        </div>
                        {editId ? 'Edit CL Details' : 'New CL Details'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <label className={labelClass}>Vendor</label>
                            <input className={inputClass} value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="Vendor Name" />
                        </div>
                        <div className="md:col-span-1">
                            <label className={labelClass}>RSV No</label>
                            <input className={inputClass} value={form.no_rsv} onChange={e => setForm({ ...form, no_rsv: e.target.value })} placeholder="Reservation No" />
                        </div>
                        <div className="md:col-span-1">
                            <label className={labelClass}>Hotel Name</label>
                            <div className="relative">
                                <select
                                    className={`${inputClass} appearance-none`}
                                    value={form?.id_hotel || ''}
                                    onChange={e => setForm({ ...form, id_hotel: e.target.value })}
                                >
                                    <option value="">Select Hotel</option>
                                    {Array.isArray(hotels) && hotels.filter(h => h).map(h => (
                                        <option key={h.id_hotel || Math.random()} value={h.id_hotel}>{h.nama_hotel || 'Unknown Hotel'}</option>
                                    ))}
                                </select>
                                <Building className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            {/* Placeholder to align grid */}
                        </div>

                        <div className="md:col-span-1">
                            <label className={labelClass}>Check In</label>
                            <div className="relative">
                                <input type="date" className={inputClass} value={form.checkin} onChange={e => setForm({ ...form, checkin: e.target.value })} />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <label className={labelClass}>Check Out</label>
                            <div className="relative">
                                <input type="date" className={inputClass} value={form.checkout} onChange={e => setForm({ ...form, checkout: e.target.value })} />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className={labelClass}>Meal</label>
                            <input className={inputClass} value={form.meal} onChange={e => setForm({ ...form, meal: e.target.value })} placeholder="e.g. RO, BB" />
                        </div>
                        <div className="md:col-span-1">
                            <label className={labelClass}>Stay Nights</label>
                            <div className="text-xl font-mono font-black text-slate-700 bg-slate-100 py-3 px-4 rounded-xl border border-slate-200">{form.stay_night || '-'}</div>
                        </div>

                        {/* Room Types and Rates */}
                        <div className="md:col-span-4 grid grid-cols-4 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
                            <div>
                                <label className={labelClass}>Dbl Qty</label>
                                <input type="number" className={inputClass} value={form.double} onChange={e => setForm({ ...form, double: e.target.value })} />
                                <label className={labelClass + " mt-3"}>Dbl Rate</label>
                                <input type="number" className={inputClass} value={form.double_rates} onChange={e => setForm({ ...form, double_rates: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Trpl Qty</label>
                                <input type="number" className={inputClass} value={form.triple} onChange={e => setForm({ ...form, triple: e.target.value })} />
                                <label className={labelClass + " mt-3"}>Trpl Rate</label>
                                <input type="number" className={inputClass} value={form.triple_rates} onChange={e => setForm({ ...form, triple_rates: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Quad Qty</label>
                                <input type="number" className={inputClass} value={form.quad} onChange={e => setForm({ ...form, quad: e.target.value })} />
                                <label className={labelClass + " mt-3"}>Quad Rate</label>
                                <input type="number" className={inputClass} value={form.quad_rates} onChange={e => setForm({ ...form, quad_rates: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Extra Qty</label>
                                <input type="number" className={inputClass} value={form.extra} onChange={e => setForm({ ...form, extra: e.target.value })} />
                                <label className={labelClass + " mt-3"}>Extra Rate</label>
                                <input type="number" className={inputClass} value={form.extra_rates} onChange={e => setForm({ ...form, extra_rates: e.target.value })} />
                            </div>
                        </div>


                        <div className="bg-gradient-to-br from-primary/5 to-indigo-500/5 p-5 rounded-xl border border-primary/10 md:col-span-2 flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <label className={labelClass}>Total Amount</label>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auto-calculated</div>
                            </div>
                            <div className="text-3xl font-mono font-black text-primary tracking-tight relative z-10">
                                {form.total_amount ? Number(form.total_amount).toLocaleString() : '0'} <span className="text-sm font-bold text-slate-400">SAR</span>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Upload CL (PDF/Image)</label>
                            <input
                                type="file"
                                onChange={e => setForm({ ...form, file: e.target.files[0] })}
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer bg-slate-50 rounded-xl border border-slate-200 transition-colors file:transition-colors hover:bg-slate-100"
                            />
                        </div>

                        <div className="md:col-span-4 flex justify-end pt-4">
                            <Button onClick={handleSubmit} disabled={uploading} className="bg-primary text-white hover:bg-primaryHover uppercase font-bold tracking-wide rounded-xl shadow-lg shadow-primary/30 px-8 py-3 transition-all active:scale-[0.98]">
                                {uploading ? 'UPLOADING...' : 'SAVE CONFIRMATION LETTER'}
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
                    { key: 'vendor', label: 'Vendor' },
                    { key: 'no_rsv', label: 'RSV No' },
                    { key: 'hotel_name', label: 'Hotel' },
                    { key: 'checkin', label: 'Check In' },
                    { key: 'total_amount', label: 'Amount' }
                ]}
                filterOptions={[
                    {
                        key: 'meal',
                        label: 'Meal',
                        options: [
                            { value: 'RO', label: 'RO' },
                            { value: 'BB', label: 'BB' },
                            { value: 'HB', label: 'HB' },
                            { value: 'FB', label: 'FB' }
                        ]
                    }
                ]}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="sticky top-0 z-20 bg-slate-50/50 shadow-sm border-b border-slate-100 backdrop-blur-sm">
                            <tr>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Vendor</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">RSV No</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Hotel</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Dates</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider text-center">Meal</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Details</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider text-right">Total</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider text-center">Status</th>
                                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="10" className="p-8 text-center text-slate-400 italic">Loading data...</td></tr>
                            ) : processedSupply.map(item => {
                                const isDeleted = item.tag_status === 'delete';
                                return (
                                    <tr key={item.id_supply} className={`group hover:bg-slate-50/80 transition-colors ${isDeleted ? 'opacity-50 grayscale bg-slate-50' : ''}`}>
                                        <td className="p-4 font-bold text-slate-700">{item.vendor}</td>
                                        <td className="p-4">
                                            <span className="font-mono text-[10px] text-primary bg-primary/10 rounded-md font-bold px-2 py-1 w-fit whitespace-nowrap">
                                                {item.no_rsv}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-700 font-medium text-xs">
                                            {hotels.find(h => String(h.id_hotel) === String(item.id_hotel))?.nama_hotel || '-'}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">In <span className="text-slate-700">{formatDate(item.checkin)}</span></div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">Out <span className="text-slate-700">{formatDate(item.checkout)}</span></div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-black">{item.meal}</span>
                                        </td>
                                        <td className="p-4 text-[10px] space-y-1 font-mono text-slate-500">
                                            {item.double > 0 && <div>Dbl: <span className="font-bold text-slate-800">{item.double}</span> x {item.double_rates}</div>}
                                            {item.triple > 0 && <div>Trpl: <span className="font-bold text-slate-800">{item.triple}</span> x {item.triple_rates}</div>}
                                            {item.quad > 0 && <div>Quad: <span className="font-bold text-slate-800">{item.quad}</span> x {item.quad_rates}</div>}
                                            {item.extra > 0 && <div>Extra: <span className="font-bold text-slate-800">{item.extra}</span> x {item.extra_rates}</div>}
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-primary text-sm whitespace-nowrap">
                                            {Number(item.total_amount).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">SAR</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={item.tag_status} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Tooltip text="View File">
                                                    <a
                                                        href={item.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:text-white hover:bg-primary hover:border-primary transition-all shadow-sm'
                                                    >
                                                        VIEW <ExternalLink size={10} />
                                                    </a>
                                                </Tooltip>
                                                {!isDeleted && (
                                                    <>
                                                        <Tooltip text="Edit">
                                                            <button onClick={() => handleEdit(item)} className="p-2 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 rounded-full transition-colors">
                                                                <Edit2 size={16} strokeWidth={2} />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Delete">
                                                            <button onClick={() => handleDelete(item.id_supply)} className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-full transition-colors">
                                                                <Trash2 size={16} strokeWidth={2} />
                                                            </button>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {isDeleted && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider self-center ml-2">Deleted</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

        </Layout>
    );
}
