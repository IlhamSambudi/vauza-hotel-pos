import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../layouts/DashboardLayout';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
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
        try {
            const [p, c] = await Promise.all([
                api.get('/payments'),
                api.get('/clients')
            ]);
            setPayments(p.data);
            setClients(c.data);
        } catch (err) {
            console.error("Failed to load data", err);
        }
    };

    useEffect(() => { load(); }, []);

    const handleFileChange = (e) => {
        setForm({ ...form, file: e.target.files[0] });
    };

    const submit = async () => {
        if (!form.id_client || !form.amount || !form.file || !form.exchange_rate) {
            alert("Please fill all fields (Client, Amount, Rate, File).");
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
            alert('Payment uploaded successfully');
            setShowForm(false);
            setForm({ ...form, amount: '', exchange_rate: '', detail: '', file: null });
            load();
        } catch (err) {
            console.error("Upload Error Details:", err.response?.data || err.message);
            alert(`Upload failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const labelClass = "text-[10px] font-bold text-textSub mb-2 block uppercase tracking-wide ml-1 opacity-70";
    const inputClass = "w-full bg-neu border-none rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-neu-pressed transition-all placeholder-textSub/30 font-medium";

    const filteredPayments = showDeleted ? payments : payments.filter(p => p.tag_status !== 'delete');

    return (
        <Layout title="Payments & Bukti Transfer">
            <div className="mb-8">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-neu text-primary px-6 py-3 rounded-xl hover:text-primaryHover transition-all font-black tracking-wide shadow-neu-flat hover:shadow-neu-button active:shadow-neu-pressed hover:-translate-y-0.5"
                >
                    {showForm ? 'CANCEL' : '+ NEW PAYMENT'}
                </button>
            </div>

            {showForm && (
                <div className="bg-neu rounded-2xl p-8 shadow-neu-flat border-none mb-10 max-w-[800px] grid gap-6 animate-fade-in-up">
                    <div>
                        <label className={labelClass}>Client</label>
                        <select
                            className={inputClass}
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Amount (IDR)</label>
                            <input
                                type="number"
                                className={inputClass}
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                placeholder="e.g. 5000000"
                            />
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

                    <div>
                        <label className={labelClass}>Est. Amount (SAR)</label>
                        <div className="w-full bg-neu shadow-neu-pressed rounded-xl px-4 py-3 text-primary font-black font-mono tracking-wider">
                            {sarAmount} SAR
                        </div>
                        <p className="text-[10px] text-textSub mt-2 italic opacity-60 ml-1">Based on manual rate input.</p>
                    </div>

                    <div>
                        <label className={labelClass}>Keterangan / Detail</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={form.detail}
                            onChange={e => setForm({ ...form, detail: e.target.value })}
                            placeholder="e.g. DP 1, Pelunasan, dll"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Date</label>
                        <input
                            type="date"
                            className={inputClass}
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Bukti Transfer (File)</label>
                        <input
                            type="file"
                            className="block w-full text-xs text-textSub file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neu file:text-primary file:shadow-neu-flat hover:file:shadow-neu-button cursor-pointer"
                            onChange={handleFileChange}
                        />
                    </div>

                    <button
                        onClick={submit}
                        disabled={uploading}
                        className="w-full bg-neu text-primary py-4 rounded-xl hover:text-primaryHover transition-all font-black tracking-wide text-lg shadow-neu-flat active:shadow-neu-pressed hover:-translate-y-0.5 disabled:opacity-50 mt-4"
                    >
                        {uploading ? 'UPLOADING...' : 'SAVE PAYMENT'}
                    </button>
                </div>
            )}

            <div className="bg-neu rounded-2xl shadow-neu-flat border-none w-full overflow-hidden p-6">
                <div className="overflow-x-auto rounded-xl">
                    <table className="w-full min-w-max text-sm text-textMain border-collapse">
                        <thead className="text-textSub">
                            <tr>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Date</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Detail</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Client</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">IDR</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Rate</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">SAR</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Proof</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider w-[100px] opacity-70">
                                    <button
                                        onClick={() => setShowDeleted(!showDeleted)}
                                        className="flex items-center gap-2 hover:text-primary transition-colors focus:outline-none group"
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
                            {filteredPayments.map(p => {
                                const isDeleted = p.tag_status === 'delete';
                                return (
                                    <tr key={p.id_payment} className={`transition-all border-b border-transparent ${isDeleted ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
                                        <td className="p-4 text-textSub font-bold text-xs">{p.date}</td>
                                        <td className="p-4 relative font-medium">
                                            {p.detail}
                                            {isDeleted && <span className="ml-2 text-[8px] text-red-500 font-bold border border-red-200 px-1 rounded inline-block">DELETED</span>}
                                        </td>
                                        <td className="p-4 font-bold">{p.nama_client}</td>
                                        <td className="p-4 font-mono text-xs">{Number(p.amount).toLocaleString()}</td>
                                        <td className="p-4 font-mono text-xs text-textSub">{p.exchange_rate}</td>
                                        <td className="p-4 font-mono text-xs text-primary font-bold">{(Number(p.amount_sar) || 0).toLocaleString()} SAR</td>
                                        <td className="p-4">
                                            <a
                                                href={p.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold text-[10px] uppercase tracking-wide hover:bg-primary/20 transition-all flex items-center justify-center"
                                            >
                                                View Proof
                                            </a>
                                        </td>
                                        <td className="p-4">
                                            {p.tag_status === 'new' && <span className="shadow-neu-pressed text-green-600 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">NEW</span>}
                                            {p.tag_status === 'edited' && <span className="shadow-neu-pressed text-blue-500 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">EDITED</span>}
                                            {p.tag_status === 'delete' && <span className="shadow-neu-pressed text-red-500 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">DELETED</span>}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            {!isDeleted && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`Delete payment?`)) {
                                                            await api.delete(`/payments/${p.id_payment}`);
                                                            load();
                                                        }
                                                    }}
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
        </Layout>
    );
}
