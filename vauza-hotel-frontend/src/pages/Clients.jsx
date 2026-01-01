import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import api from "../services/api";
import Layout from "../layouts/DashboardLayout";
import Button from "../components/Button";
import Skeleton from "../components/Skeleton";
import Tooltip from "../components/Tooltip";
import { Edit2, Trash2 } from 'lucide-react';

const StatusBadge = ({ status }) => {
    if (status === 'new') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success uppercase tracking-wide">NEW</span>;
    if (status === 'edited') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary uppercase tracking-wide">EDITED</span>;
    if (status === 'delete') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-danger/10 text-danger uppercase tracking-wide">DELETED</span>;
    return null;
};

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);

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
            <div className="p-6 mb-8 max-w-xl bg-white rounded-card shadow-card border border-gray-100">
                <h3 className="text-sm font-bold text-textSub mb-4 uppercase tracking-wider">
                    {editId ? 'Edit Client' : 'Add New Client'}
                </h3>
                <div className="flex gap-4">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Client name"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-textMain placeholder-gray-400"
                    />
                    <Button
                        onClick={handleSubmit}
                        className={`${editId ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primaryHover'}`}
                    >
                        {editId ? 'UPDATE' : 'ADD'}
                    </Button>
                    {editId && (
                        <Button variant="ghost" onClick={cancelEdit} className="text-xs uppercase font-bold text-gray-400 hover:text-textMain">
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-card shadow-card border border-gray-100 p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-4 font-bold text-xs uppercase text-textSub tracking-wider">Client Name</th>
                                <th className="py-3 px-4 font-bold text-xs uppercase text-textSub tracking-wider">Status</th>
                                <th className="py-3 px-4 font-bold text-xs uppercase text-textSub tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0">
                                        <td colSpan="3" className="p-4">
                                            <Skeleton className="h-10 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : clients.map(c => {
                                const isDeleted = c.tag_status === 'delete';
                                return (
                                    <tr
                                        key={c.id_client}
                                        className={`transition-all border-b border-gray-50 last:border-0 ${isDeleted ? 'opacity-50 grayscale' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="p-4 font-bold text-textMain px-4 py-4">
                                            {c.nama_client}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={c.tag_status} />
                                        </td>
                                        <td className="px-4 py-4 text-right flex justify-end gap-2 items-center">
                                            {!isDeleted && (
                                                <>
                                                    <Tooltip text="Edit Client">
                                                        <button
                                                            onClick={() => startEdit(c)}
                                                            className="p-2 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Delete Client">
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
                                                            className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </Tooltip>
                                                </>
                                            )}
                                            {isDeleted && <span className="text-xs text-textSub italic font-medium">Read Only</span>}
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
