import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Layout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import Tooltip from '../components/Tooltip';
import { Plus, Eye, EyeOff, Trash2, ExternalLink, Calendar, CreditCard, DollarSign, FileText, User, Printer } from 'lucide-react';

const StatusBadge = ({ status }) => {
    if (status === 'new') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success uppercase tracking-wide">NEW</span>;
    if (status === 'edited') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary uppercase tracking-wide">EDITED</span>;
    if (status === 'delete') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-danger/10 text-danger uppercase tracking-wide">DELETED</span>;
    return null;
};

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);

    const [form, setForm] = useState({
        id_client: '',
        amount: '',
        exchange_rate: '',
        detail: '',
        date: new Date().toISOString().split('T')[0],
        file: null
    });

    // Calculate SAR Amount for Display
    const sarAmount = (form.amount && form.exchange_rate)
        ? (Number(form.amount) / Number(form.exchange_rate)).toFixed(2)
        : '0.00';

    const load = async () => {
        setLoading(true);
        try {
            const [p, c] = await Promise.all([
                api.get('/payments'),
                api.get('/clients')
            ]);
            setPayments(p.data);
            setClients(c.data);
        } catch (err) {
            console.error("Failed to load data", err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleFileChange = (e) => {
        setForm({ ...form, file: e.target.files[0] });
    };

    const submit = async () => {
        if (!form.id_client || !form.amount || !form.file || !form.exchange_rate) {
            toast.error("Please fill all fields (Client, Amount, Rate, File).");
            return;
        }

        const formData = new FormData();
        formData.append('id_client', form.id_client);
        formData.append('detail', form.detail);
        formData.append('amount', form.amount);
        formData.append('exchange_rate', form.exchange_rate);
        formData.append('date', form.date);
        formData.append('file', form.file);

        setUploading(true);
        try {
            await api.post('/payments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Payment uploaded successfully');
            setShowForm(false);
            setForm({ ...form, amount: '', exchange_rate: '', detail: '', file: null });
            load();
        } catch (err) {
            console.error("Upload Error Details:", err.response?.data || err.message);
            toast.error(`Upload failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const labelClass = "text-[10px] font-bold text-textSub mb-2 block uppercase tracking-wide ml-1";
    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 font-medium";

    const filteredPayments = showDeleted ? payments : payments.filter(p => p.tag_status !== 'delete');

    return (
        <Layout title="Payments & Bukti Transfer">
            <div className="mb-6 flex justify-between items-center">
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="shadow-sm hover:shadow-md"
                >
                    <span className="flex items-center gap-2">
                        {showForm ? 'CANCEL' : <><Plus size={18} /> NEW PAYMENT</>}
                    </span>
                </Button>

                <button
                    onClick={() => setShowDeleted(!showDeleted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${showDeleted ? 'bg-primary/10 text-primary' : 'bg-white text-textSub hover:bg-gray-50 border border-gray-200'}`}
                >
                    {showDeleted ? <><Eye size={14} /> Hide Deleted</> : <><EyeOff size={14} /> Show Deleted</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-card p-8 shadow-card border border-gray-100 mb-10 max-w-[800px] animate-fade-in-up">
                    <h3 className="text-lg font-black text-textMain mb-6 flex items-center gap-2">
                        <CreditCard className="text-primary" size={24} />
                        New Payment Details
                    </h3>

                    <div className="grid gap-6">
                        <div>
                            <label className={labelClass}>Client</label>
                            <div className="relative">
                                <select
                                    className={`${inputClass} appearance-none`}
                                    value={form.id_client}
                                    onChange={e => setForm({ ...form, id_client: e.target.value })}
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(c => (
                                        <option key={c.id_client} value={c.id_client}>
                                            {c.nama_client}
                                        </option>
                                    ))}
                                </select>
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Amount (IDR)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className={inputClass}
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: e.target.value })}
                                        placeholder="e.g. 5000000"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">IDR</span>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Kurs (IDR to SAR)</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={form.exchange_rate}
                                    onChange={e => setForm({ ...form, exchange_rate: e.target.value })}
                                    placeholder="e.g. 4300"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                            <div>
                                <label className={labelClass}>Estimated Amount (SAR)</label>
                                <p className="text-[10px] text-textSub italic opacity-60">Based on manual rate input.</p>
                            </div>
                            <div className="text-primary font-black font-mono text-2xl tracking-tighter">
                                {Number(sarAmount).toLocaleString()} <span className="text-sm font-bold text-textSub">SAR</span>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Keterangan / Detail</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={form.detail}
                                    onChange={e => setForm({ ...form, detail: e.target.value })}
                                    placeholder="e.g. DP 1, Pelunasan, dll"
                                />
                                <FileText className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Bukti Transfer (File)</label>
                            <input
                                type="file"
                                className="block w-full text-xs text-textSub file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer bg-gray-50 rounded-lg border border-gray-100"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={submit}
                                disabled={uploading}
                                className="w-full py-4 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                {uploading ? 'UPLOADING...' : 'SAVE PAYMENT'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-card shadow-card border border-gray-100 w-full overflow-hidden p-6">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-textMain border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Date</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Detail</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Client</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">IDR</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Rate</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">SAR</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Proof</th>
                                <th className="py-3 px-4 text-left font-bold uppercase text-[10px] tracking-wider text-textSub">Status</th>
                                <th className="py-3 px-4 text-right font-bold uppercase text-[10px] tracking-wider text-textSub">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0">
                                        <td colSpan="9" className="p-4">
                                            <Skeleton className="h-12 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredPayments.map(p => {
                                const isDeleted = p.tag_status === 'delete';
                                return (
                                    <tr key={p.id_payment} className={`transition-all border-b border-gray-50 last:border-0 ${isDeleted ? 'opacity-50 grayscale' : 'hover:bg-gray-50'}`}>
                                        <td className="p-4 text-textMain font-bold text-xs">{p.date}</td>
                                        <td className="p-4 relative font-medium text-textMain">
                                            {p.detail}
                                        </td>
                                        <td className="p-4 font-bold text-textMain">{p.nama_client}</td>
                                        <td className="p-4 font-mono text-xs">{Number(p.amount).toLocaleString()}</td>
                                        <td className="p-4 font-mono text-xs text-textSub">{p.exchange_rate}</td>
                                        <td className="p-4 font-mono text-xs text-primary font-bold">{(Number(p.amount_sar) || 0).toLocaleString()} SAR</td>
                                        <td className="p-4">
                                            <a
                                                href={p.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className='inline-block group'
                                            >
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md group-hover:bg-primary group-hover:text-white transition-colors">
                                                    View <ExternalLink size={10} />
                                                </span>
                                            </a>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={p.tag_status} />
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2 items-center">
                                            <Tooltip text="Print Receipt">
                                                <a
                                                    href={`/payment-receipt/${p.id_payment}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors"
                                                >
                                                    <Printer size={16} />
                                                </a>
                                            </Tooltip>
                                            {!isDeleted && (
                                                <Tooltip text="Permanently Delete">
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm(`Delete payment?`)) {
                                                                await api.delete(`/payments/${p.id_payment}`);
                                                                toast.success("Payment deleted");
                                                                load();
                                                            }
                                                        }}
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
        </Layout >
    );
}
