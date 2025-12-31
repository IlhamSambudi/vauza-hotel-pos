import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../layouts/DashboardLayout';

export default function Hotels() {
    const [hotels, setHotels] = useState([]);
    const [name, setName] = useState('');
    const [city, setCity] = useState('Makkah');
    const [editId, setEditId] = useState(null);
    const [showDeleted, setShowDeleted] = useState(false);

    const load = async () => {
        const res = await api.get('/hotels');
        setHotels(res.data);
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        if (!name || !city) return;

        if (editId) {
            await api.put(`/hotels/${editId}`, { nama_hotel: name, city });
            setEditId(null);
        } else {
            await api.post('/hotels', { nama_hotel: name, city });
        }

        setName('');
        setCity('Makkah');
        load();
    };

    const startEdit = (h) => {
        setName(h.nama_hotel);
        setCity(h.city);
        setEditId(h.id_hotel);
    };

    const cancelEdit = () => {
        setName('');
        setCity('Makkah');
        setEditId(null);
    };

    const makkahHotels = hotels.filter(h => h.city.toLowerCase() === 'makkah');
    const madinahHotels = hotels.filter(h => h.city.toLowerCase() === 'madinah');

    // Helper for rendering tables
    const renderTable = (title, list) => {
        const filteredList = showDeleted ? list : list.filter(h => h.tag_status !== 'delete');

        return (
            <div className="bg-neu rounded-2xl shadow-neu-flat overflow-hidden flex-1 min-w-[300px] p-6 border-none">
                <h3 className="mb-6 font-black text-xl text-primary tracking-tight">{title}</h3>
                <div className="overflow-x-auto rounded-xl">
                    <table className="w-full min-w-max text-sm text-textMain">
                        <thead className="text-textSub">
                            <tr>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Hotel Name</th>
                                <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider w-[100px] opacity-70">
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
                            {filteredList.length === 0 ? (
                                <tr><td className="p-4 text-textSub italic text-sm" colSpan="3">No hotels found.</td></tr>
                            ) : (
                                filteredList.map(h => {
                                    const isDeleted = h.tag_status === 'delete';
                                    return (
                                        <tr key={h.id_hotel} className={`transition last:border-0 border-b border-transparent ${isDeleted ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
                                            <td className="p-4 text-textMain font-bold relative">
                                                {h.nama_hotel}
                                                {isDeleted && <span className="ml-2 text-[8px] text-red-500 font-bold border border-red-200 px-1 rounded inline-block">DELETED</span>}
                                            </td>
                                            <td className="p-4">
                                                {h.tag_status === 'new' && <span className="shadow-neu-pressed text-green-600 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">NEW</span>}
                                                {h.tag_status === 'edited' && <span className="shadow-neu-pressed text-blue-500 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">EDITED</span>}
                                                {h.tag_status === 'delete' && <span className="shadow-neu-pressed text-red-500 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">DELETED</span>}
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                {!isDeleted && (
                                                    <>
                                                        <button
                                                            onClick={() => startEdit(h)}
                                                            className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg font-bold text-[10px] uppercase tracking-wide hover:bg-blue-500/20 transition-all"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Delete hotel ${h.nama_hotel}?`)) {
                                                                    await api.delete(`/hotels/${h.id_hotel}`);
                                                                    load();
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg font-bold text-[10px] uppercase tracking-wide hover:bg-red-500/20 transition-all"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                                {isDeleted && <span className="text-xs text-textSub italic opacity-50 px-3 py-1.5">Read Only</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <Layout title="Hotels">

            <div className="bg-neu rounded-2xl p-8 shadow-neu-flat mb-8 max-w-4xl border-none">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-textSub mb-2 uppercase tracking-wide ml-1 opacity-70">Hotel Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter hotel name"
                            className="w-full bg-neu rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-neu-pressed transition-all font-medium text-textMain placeholder-textSub/40"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-textSub mb-2 uppercase tracking-wide ml-1 opacity-70">City</label>
                        <select
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            className="w-full bg-neu rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-neu-pressed transition-all font-medium text-textMain"
                        >
                            <option value="Makkah">Makkah</option>
                            <option value="Madinah">Madinah</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSubmit}
                            className={`flex-1 rounded-xl px-4 transition-all font-black uppercase tracking-wide h-[52px] flex items-center justify-center shadow-neu-flat hover:shadow-neu-button active:shadow-neu-pressed hover:-translate-y-0.5 ${editId ? 'text-blue-500' : 'text-primary'}`}
                        >
                            {editId ? 'UPDATE' : 'ADD HOTEL'}
                        </button>
                        {editId && (
                            <button
                                onClick={cancelEdit}
                                className="px-4 rounded-xl border-none hover:text-red-500 transition h-[52px] font-bold text-textSub shadow-neu-flat hover:shadow-neu-button"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 w-full">
                {renderTable("Makkah", makkahHotels)}
                {renderTable("Madinah", madinahHotels)}
            </div>

        </Layout>
    );
}
