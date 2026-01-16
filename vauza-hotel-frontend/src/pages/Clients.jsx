import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import api from "../services/api";
import Layout from "../layouts/DashboardLayout";
import Button from "../components/Button";
import Skeleton from "../components/Skeleton";
import useTable from '../hooks/useTable';
import TableControls from '../components/TableControls';
import Tooltip from "../components/Tooltip";
import { Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

const StatusBadge = ({ status }) => {
    if (status === 'new') return <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50 uppercase tracking-wider shadow-sm shadow-emerald-100/50">NEW</span>;
    if (status === 'edited') return <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100/50 uppercase tracking-wider shadow-sm shadow-blue-100/50">EDITED</span>;
    if (status === 'delete') return <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100/50 uppercase tracking-wider shadow-sm shadow-rose-100/50">DELETED</span>;
    return null;
};

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [showDeleted, setShowDeleted] = useState(false);

    // Integrate useTable
    const {
        data: processedClients,
        search, setSearch,
        sort, setSort,
        filters, setFilter
    } = useTable({
        data: showDeleted ? clients : clients.filter(c => c.tag_status !== 'delete'),
        defaultSort: { key: 'nama_client', direction: 'asc' }
    });

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/clients");
            setClients(res.data);
        } catch (err) {
            toast.error("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        if (!name) return;

        try {
            if (editId) {
                // Update
                await api.put(`/clients/${editId}`, { nama_client: name });
                toast.success("Client updated");
                setEditId(null);
            } else {
                // Create
                await api.post("/clients", { nama_client: name });
                toast.success("Client created");
            }

            setName("");
            load();
        } catch (err) {
            toast.error("Failed to save client");
        }
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
            {/* Input Form */}
            <div className="p-8 mb-8 max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                    {editId ? <><Edit2 size={16} /> Edit Client</> : <><Plus className="text-primary" size={16} /> Add New Client</>}
                </h3>
                <div className="flex gap-4">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter client name..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-700 placeholder-slate-400 hover:bg-white"
                    />
                    <Button
                        onClick={handleSubmit}
                        className={`uppercase font-bold tracking-wide px-6 rounded-xl shadow-lg shadow-primary/20 transition-all ${editId ? 'bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/20 text-white' : 'bg-primary hover:bg-primaryHover hover:shadow-primary/30 text-white'}`}
                    >
                        {editId ? 'UPDATE' : 'ADD'}
                    </Button>
                    {editId && (
                        <Button variant="ghost" onClick={cancelEdit} className="text-xs uppercase font-bold text-slate-400 hover:text-slate-600 px-4">
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                    <TableControls
                        search={search} setSearch={setSearch}
                        sort={sort} setSort={setSort}
                        filters={filters} setFilter={setFilter}
                        sortOptions={[
                            { key: 'nama_client', label: 'Client Name' }
                        ]}
                    />
                </div>

                <button
                    onClick={() => setShowDeleted(!showDeleted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${showDeleted ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                >
                    {showDeleted ? <><Eye size={14} /> Hide Deleted</> : <><EyeOff size={14} /> Show Deleted</>}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-420px)] overflow-hidden">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-white shadow-sm ring-1 ring-black/5">
                            <tr>
                                <th className="py-4 px-6 font-semibold text-[10px] uppercase text-slate-500 tracking-wider border-b border-gray-100 bg-slate-50/50">Client Name</th>
                                <th className="py-4 px-6 font-semibold text-[10px] uppercase text-slate-500 tracking-wider text-center border-b border-gray-100 bg-slate-50/50">Status</th>
                                <th className="py-4 px-6 font-semibold text-[10px] uppercase text-slate-500 tracking-wider text-right border-b border-gray-100 bg-slate-50/50">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="3" className="p-6">
                                            <Skeleton className="h-10 w-full rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : processedClients.map(c => {
                                const isDeleted = c.tag_status === 'delete';
                                return (
                                    <tr
                                        key={c.id_client}
                                        className={`group hover:bg-slate-50/80 transition-colors ${isDeleted ? 'opacity-50 grayscale bg-gray-50' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {c.nama_client}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={c.tag_status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                {!isDeleted && (
                                                    <>
                                                        <Tooltip text="Edit">
                                                            <button
                                                                onClick={() => startEdit(c)}
                                                                className="p-2 rounded-full text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                            >
                                                                <Edit2 size={16} strokeWidth={2} />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Delete">
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Delete client ${c.nama_client}?`)) {
                                                                        try {
                                                                            await api.delete(`/clients/${c.id_client}`);
                                                                            toast.success("Client deleted");
                                                                            load();
                                                                        } catch (err) {
                                                                            toast.error("Failed to delete client");
                                                                        }
                                                                    }
                                                                }}
                                                                className="p-2 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                            >
                                                                <Trash2 size={16} strokeWidth={2} />
                                                            </button>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {isDeleted && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Deleted</span>}
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
