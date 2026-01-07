import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Layout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import useTable from '../hooks/useTable';
import TableControls from '../components/TableControls';
import Tooltip from '../components/Tooltip';
import { Edit2, Trash2, Eye, EyeOff, MapPin } from 'lucide-react';

const StatusBadge = ({ status }) => {
    if (status === 'new') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">NEW</span>;
    if (status === 'edited') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">EDITED</span>;
    if (status === 'delete') return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">DELETED</span>;
    return null;
};

export default function Hotels() {
    const [hotels, setHotels] = useState([]);
    const [name, setName] = useState('');
    const [city, setCity] = useState('Makkah');
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [showDeleted, setShowDeleted] = useState(false);

    // Integrate useTable
    const {
        data: processedHotels,
        search, setSearch,
        sort, setSort,
        filters, setFilter
    } = useTable({
        data: showDeleted ? hotels : hotels.filter(h => h.tag_status !== 'delete'),
        defaultSort: { key: 'nama_hotel', direction: 'asc' }
    });

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hotels');
            setHotels(res.data);
        } catch (err) {
            toast.error("Failed to load hotels");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        if (!name || !city) return;

        try {
            if (editId) {
                await api.put(`/hotels/${editId}`, { nama_hotel: name, city });
                toast.success("Hotel updated");
                setEditId(null);
            } else {
                await api.post('/hotels', { nama_hotel: name, city });
                toast.success("Hotel added");
            }

            setName('');
            setCity('Makkah');
            load();
        } catch (err) {
            toast.error("Failed to save hotel");
        }
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

    const makkahHotels = processedHotels.filter(h => h.city.toLowerCase() === 'makkah');
    const madinahHotels = processedHotels.filter(h => h.city.toLowerCase() === 'madinah');

    // Helper for rendering tables
    const renderTable = (title, list) => {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 min-w-[300px] p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-textMain tracking-tight">{title}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-textMain border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100">
                                <th className="py-3 px-4 text-left font-semibold uppercase text-[10px] tracking-wider text-textSub">Hotel Name</th>
                                <th className="py-3 px-4 text-left font-semibold uppercase text-[10px] tracking-wider w-[100px] text-textSub">Status</th>
                                <th className="py-3 px-4 text-right font-semibold uppercase text-[10px] tracking-wider text-textSub">Action</th>
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
                            ) : list.length === 0 ? (
                                <tr><td className="p-8 text-textSub italic text-sm text-center" colSpan="3">No hotels found.</td></tr>
                            ) : (
                                list.map(h => {
                                    const isDeleted = h.tag_status === 'delete';
                                    return (
                                        <tr key={h.id_hotel} className={`transition-all border-b border-gray-50 last:border-0 ${isDeleted ? 'opacity-50 grayscale' : 'hover:bg-gray-50'}`}>
                                            <td className="p-4 text-textMain font-bold">
                                                {h.nama_hotel}
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={h.tag_status} />
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2 items-center">
                                                {!isDeleted && (
                                                    <>
                                                        <Tooltip text="Edit Hotel">
                                                            <button
                                                                onClick={() => startEdit(h)}
                                                                className="p-2 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Delete Hotel">
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm(`Delete hotel ${h.nama_hotel}?`)) {
                                                                        try {
                                                                            await api.delete(`/hotels/${h.id_hotel}`);
                                                                            toast.success("Hotel deleted");
                                                                            load();
                                                                        } catch (err) {
                                                                            toast.error("Failed to delete hotel");
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

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 max-w-4xl">
                <h3 className="text-sm font-bold text-textSub mb-6 uppercase tracking-wider">
                    {editId ? 'Edit Hotel' : 'Add New Hotel'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-textSub mb-2 uppercase tracking-wide ml-1">Hotel Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter hotel name"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-textMain placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-textSub mb-2 uppercase tracking-wide ml-1">City</label>
                        <div className="relative">
                            <select
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-textMain"
                            >
                                <option value="Makkah">Makkah</option>
                                <option value="Madinah">Madinah</option>
                            </select>
                            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-textSub pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSubmit}
                            className={`flex-1 rounded-full h-[46px] flex items-center justify-center shadow-lg shadow-primary/20 ${editId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-primary hover:bg-primaryHover text-white'}`}
                        >
                            {editId ? 'UPDATE' : 'ADD'}
                        </Button>
                        {editId && (
                            <Button
                                variant="ghost"
                                onClick={cancelEdit}
                                className="h-[46px] px-4 font-bold text-gray-400 hover:text-textMain"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                    <TableControls
                        search={search} setSearch={setSearch}
                        sort={sort} setSort={setSort}
                        filters={filters} setFilter={setFilter}
                        sortOptions={[
                            { key: 'nama_hotel', label: 'Hotel Name' }
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

            <div className="flex flex-col md:flex-row gap-8 w-full items-start">
                {renderTable("Makkah", makkahHotels)}
                {renderTable("Madinah", madinahHotels)}
            </div>

        </Layout>
    );
}
