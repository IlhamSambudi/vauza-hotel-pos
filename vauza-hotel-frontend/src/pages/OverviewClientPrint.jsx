import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { formatDate } from '../utils/formatDate';
import { Printer } from 'lucide-react';

export default function OverviewClientPrint() {
    const { id_client } = useParams();
    const [reservations, setReservations] = useState([]);
    const [clientName, setClientName] = useState('Loading...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reservations').then(res => {
            const allRes = res.data;
            // Filter by client ID and exclude DELETE status
            const clientRes = allRes.filter(r => String(r.id_client) === String(id_client) && r.tag_status !== 'delete' && r.tag_status !== 'DELETE');

            // Sort by checkin date descending or ascending? Usually ascending for order history.
            // Sort by checkin date: Earliest to Latest (Ascending)
            clientRes.sort((a, b) => {
                const dateA = new Date(a.checkin);
                const dateB = new Date(b.checkin);
                // Handle invalid dates safely
                if (isNaN(dateA.getTime())) return 1;
                if (isNaN(dateB.getTime())) return -1;
                return dateA - dateB;
            });

            setReservations(clientRes);
            if (clientRes.length > 0) {
                setClientName(clientRes[0].nama_client);
            } else {
                // Fetch client name separately if no reservations found? 
                // For now just "Unknown" or maybe try finding in clients list if needed.
                // But usually we print for clients who HAVE orders.
                setClientName("Unknown Client");
            }
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load reservations", err);
            setLoading(false);
        });
    }, [id_client]);



    if (loading) return <div className="p-10">Loading...</div>;

    if (reservations.length === 0) return <div className="p-10">No orders found for this client.</div>;

    return (
        <div className="min-h-screen bg-white p-10 print:p-0 font-sans text-black">
            {/* Control Bar - Hidden on Print */}
            <div className="max-w-[1000px] mx-auto mb-6 flex justify-end print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryHover transition-all shadow-lg hover:shadow-xl font-bold text-sm"
                >
                    <Printer size={16} /> PRINT PDF
                </button>
            </div>

            <div className="max-w-[1000px] mx-auto">
                <div className="bg-white print:p-0">

                    {/* Header */}
                    <div className="border-b-2 border-black mb-6 pb-4 flex justify-between items-end">
                        <div>
                            <h2 className="text-xl font-black text-black tracking-wide uppercase">HOTEL ORDER</h2>
                            <h3 className="text-3xl font-black text-black tracking-tighter mt-1">{clientName}</h3>
                        </div>
                        <div className="text-right text-xs text-black">
                            <p>Total Orders: {reservations.length}</p>
                            <p>Printed: {formatDate(new Date())}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left text-[10px] border-collapse font-medium">
                        <thead className="bg-accentSubtle text-primaryHover uppercase font-bold tracking-wider print:bg-white print:text-black">
                            <tr>
                                <th className="p-2 border border-black w-20">No RSV</th>
                                <th className="p-2 border border-black">Hotel</th>
                                <th className="p-2 border border-black w-14">Check In</th>
                                <th className="p-2 border border-black w-14">Check Out</th>
                                <th className="p-2 border border-black w-6 text-center">Nts</th>
                                <th className="p-2 border border-black">Room Details</th>
                                <th className="p-2 border border-black w-12">Meal</th>
                                <th className="p-2 border border-black w-16 text-center">Status</th>
                                <th className="p-2 border border-black w-16 text-center">Deadline</th>
                                <th className="p-2 border border-black text-right w-20">Total</th>
                                <th className="p-2 border border-black text-right w-20">Paid</th>
                                <th className="p-2 border border-black w-20 text-center">Pay Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-black">
                            {reservations.map(r => {
                                // Build Room Details List
                                const details = [];
                                if (Number(r.room_double) > 0) details.push({ type: 'Dbl', qty: r.room_double, rate: r.room_double_rate });
                                if (Number(r.room_triple) > 0) details.push({ type: 'Trp', qty: r.room_triple, rate: r.room_triple_rate });
                                if (Number(r.room_quad) > 0) details.push({ type: 'Quad', qty: r.room_quad, rate: r.room_quad_rate });
                                if (Number(r.room_extra) > 0) details.push({ type: 'Ext', qty: r.room_extra, rate: r.room_extra_rate });

                                const payMap = {
                                    'unpaid': 'UNPAID',
                                    'dp_30': 'DP 30%',
                                    'partial': 'PARTIAL',
                                    'full_payment': 'FULL PAYMENT'
                                };
                                const payLabel = payMap[r.status_payment] || r.status_payment;
                                const isUnpaid = r.status_payment === 'unpaid';
                                const isFullPayment = r.status_payment === 'full_payment';

                                return (
                                    <tr key={r.no_rsv}>
                                        <td className="p-2 border border-black font-bold align-top">{r.no_rsv}</td>
                                        <td className="p-2 border border-black align-top">{r.nama_hotel}</td>
                                        <td className="p-2 border border-black align-top">{formatDate(r.checkin)}</td>
                                        <td className="p-2 border border-black align-top">{formatDate(r.checkout)}</td>
                                        <td className="p-2 border border-black text-center align-top">{r.staynight}</td>
                                        <td className="p-2 border border-black align-top">
                                            {details.map((d, i) => (
                                                <div key={i} className="flex justify-between text-[9px] border-b border-gray-300 last:border-0 pb-0.5 mb-0.5 last:mb-0 last:pb-0">
                                                    <span>{d.qty} {d.type}</span>
                                                    <span className="font-mono">@{Number(d.rate).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {details.length === 0 && '-'}
                                        </td>
                                        <td className="p-2 border border-black align-top">{r.meal}</td>
                                        <td className={`p-2 border border-black text-center align-top font-bold text-[9px] uppercase ${(r.status_booking === 'CANCEL' || r.status_booking === 'Cancel') ? 'text-red-600' : ''}`}>{r.status_booking}</td>
                                        <td className="p-2 border border-black text-center align-top text-red-600 font-medium">{formatDate(r.deadline_payment)}</td>
                                        <td className="p-2 border border-black text-right font-mono font-bold align-top">{Number(r.total_amount).toLocaleString()}</td>
                                        <td className="p-2 border border-black text-right font-mono align-top">{Number(r.paid_amount).toLocaleString()}</td>
                                        <td className={`p-2 border border-black text-center align-top font-bold text-[9px] uppercase ${isUnpaid ? 'text-red-600' : isFullPayment ? 'text-green-600' : ''}`}>
                                            {payLabel}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <style type="text/css" media="print">
                {`
               @page { size: auto; margin: 10mm; }
               body { -webkit-print-color-adjust: exact; }
               `}
            </style>
        </div>
    );
}
