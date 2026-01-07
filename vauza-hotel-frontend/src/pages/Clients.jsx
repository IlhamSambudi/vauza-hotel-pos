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
    if (status === 'new') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">NEW</span>;
    if (status === 'edited') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">EDITED</span>;
    if (status === 'delete') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">DELETED</span>;
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
                <h3 className="text-sm font-bold text-textSub mb-4 uppercase tracking-wider flex items-center gap-2">
                    {editId ? <><Edit2 size={16} /> Edit Client</> : <><Plus className="text-primary" size={16} /> Add New Client</>}
                </h3>
                <div className="flex gap-4">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter client name..."
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-textMain placeholder-gray-400"
                    />
                    <Button
                        onClick={handleSubmit}
                        className={`uppercase font-bold tracking-wide px-6 rounded-xl shadow-lg shadow-primary/20 ${editId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-primary hover:bg-primaryHover text-white'}`}
                    >
                        {editId ? 'UPDATE' : 'ADD'}
                    </Button>
                    {editId && (
                        <Button variant="ghost" onClick={cancelEdit} className="text-xs uppercase font-bold text-gray-400 hover:text-textMain px-4">
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${showDeleted ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-textSub hover:bg-gray-50 border border-gray-200'}`}
                >
                    {showDeleted ? <><Eye size={14} /> Hide Deleted</> : <><EyeOff size={14} /> Show Deleted</>}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-420px)] overflow-hidden">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-white shadow-sm">
                            <tr>
                                <th className="py-4 px-6 font-semibold text-[10px] uppercase text-textSub tracking-wider border-b border-gray-100">Client Name</th>
                                <th className="py-4 px-6 font-semibold text-[10px] uppercase text-textSub tracking-wider text-center border-b border-gray-100">Status</th>
                                <th className="py-4 px-6 font-semibold text-[10px] uppercase text-textSub tracking-wider text-right border-b border-gray-100">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="3" className="p-6">
                                            <Skeleton className="h-10 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : processedClients.map(c => {
                                const isDeleted = c.tag_status === 'delete';
                                return (
                                    <tr
                                        key={c.id_client}
                                        className={`group hover:bg-gray-50 transition-colors ${isDeleted ? 'opacity-50 grayscale bg-gray-50' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-bold text-textMain">
                                            {c.nama_client}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={c.tag_status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isDeleted && (
                                                    <>
                                                        <Tooltip text="Edit">
                                                            <button
                                                                onClick={() => startEdit(c)}
                                                                className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
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
        </Layout>
    );
}
