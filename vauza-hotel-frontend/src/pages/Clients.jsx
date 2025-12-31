import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../layouts/DashboardLayout";
import Card from "../components/Card";

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [name, setName] = useState("");
    const [editId, setEditId] = useState(null); // ID being edited

    const load = async () => {
        const res = await api.get("/clients");
        setClients(res.data);
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        if (!name) return;

        if (editId) {
            // Update
            await api.put(`/clients/${editId}`, { nama_client: name });
            setEditId(null);
        } else {
            // Create
            await api.post("/clients", { nama_client: name });
        }

        setName("");
        load();
    };

    const startEdit = (c) => {
        setName(c.nama_client);
        setEditId(c.id_client);
    };

    const cancelEdit = () => {
        setName("");
        setEditId(null);
    };

    return (
        <Layout title="Clients">
            <div className="p-8 mb-10 max-w-xl bg-neu rounded-2xl shadow-neu-flat border-none">
                <div className="flex gap-4">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Client name"
                        className="flex-1 bg-neu rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-neu-pressed transition-all font-medium text-textMain placeholder-textSub/40"
                    />
                    <button
                        onClick={handleSubmit}
                        className={`px-8 rounded-xl text-primary font-black shadow-neu-flat hover:shadow-neu-button active:shadow-neu-pressed transition-all hover:-translate-y-0.5 ${editId ? 'text-blue-500' : ''}`}
                    >
                        {editId ? 'UPDATE' : 'ADD'}
                    </button>
                    {editId && (
                        <button onClick={cancelEdit} className="px-4 text-textSub hover:text-red-500 font-bold text-xs uppercase tracking-wide transition-colors">
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-hidden max-w-xl bg-neu rounded-2xl shadow-neu-flat border-none p-6">
                <table className="w-full text-sm">
                    <thead className="text-textSub">
                        <tr>
                            <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Client Name</th>
                            <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70">Status</th>
                            <th className="p-4 text-left font-bold uppercase text-[10px] tracking-wider opacity-70 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="space-y-2">
                        {clients.map(c => {
                            const isDeleted = c.tag_status === 'delete';
                            return (
                                <tr
                                    key={c.id_client}
                                    className={`transition last:border-0 border-b border-transparent ${isDeleted ? 'opacity-50' : 'hover:scale-[1.01]'}`}
                                >
                                    <td className="p-4 font-bold relative text-textMain">
                                        {c.nama_client}
                                        {isDeleted && <span className="ml-2 text-[8px] text-red-500 font-bold border border-red-200 px-1 rounded inline-block">DELETED</span>}
                                    </td>
                                    <td className="p-4">
                                        {c.tag_status === 'new' && (
                                            <span className="shadow-neu-pressed text-green-600 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">
                                                NEW
                                            </span>
                                        )}
                                        {c.tag_status === 'edited' && (
                                            <span className="shadow-neu-pressed text-blue-500 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">
                                                EDITED
                                            </span>
                                        )}
                                        {c.tag_status === 'delete' && (
                                            <span className="shadow-neu-pressed text-red-500 text-[10px] px-2 py-1 rounded-full font-extrabold uppercase">
                                                DELETED
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {!isDeleted && (
                                            <>
                                                <button
                                                    onClick={() => startEdit(c)}
                                                    className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg font-bold text-[10px] uppercase tracking-wide hover:bg-blue-500/20 transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`Delete client ${c.nama_client}?`)) {
                                                            await api.delete(`/clients/${c.id_client}`);
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
                        })}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
