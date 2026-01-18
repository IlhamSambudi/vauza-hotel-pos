import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { formatDate } from "../utils/formatDate";
import Logo from "../assets/logo umroh 5.png";
import Signature from "../assets/ttd_fina.png";

export default function VoucherPrint() {
    const { no_rsv } = useParams();
    const [data, setData] = useState(null);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        api.get(`/reservations/${no_rsv}`).then(res => setData(res.data));
        api.get(`/reservations/${no_rsv}/rooms`).then(res => setRooms(res.data));
    }, [no_rsv]);

    if (!data) return <p>Loading...</p>;

    const isFullPayment = data.status_payment === 'full_payment';

    return (
        <div className="bg-white text-black min-h-screen p-10 print:p-0 print:bg-white relative font-sans">

            {/* WATERMARK IF NOT PAID */}
            {!isFullPayment && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 print:flex">
                    <p className="text-[10rem] font-black text-red-500/20 rotate-45 border-4 border-red-500/20 p-10 rounded-3xl uppercase">
                        NOT PAID
                    </p>
                </div>
            )}

            <div className="max-w-[800px] mx-auto text-sm leading-relaxed">

                {/* BUTTON MATCHING CONFIMRATION LETTER */}
                <div className="mb-6 print:hidden flex justify-end">
                    <button
                        onClick={() => window.print()}
                        disabled={!isFullPayment}
                        className={`px-4 py-2 hover:bg-primaryHover text-white transition-all
                            ${isFullPayment ? "bg-primary" : "bg-gray-300 cursor-not-allowed"}`}
                    >
                        {isFullPayment ? "Print / Download PDF" : "Payment Incomplete"}
                    </button>
                </div>

                {/* HEADER MATCHING CONFIRMATION LETTER */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-black tracking-widest leading-none text-green-700 flex flex-col uppercase">
                        <strong><span>VAUZA TAMMA</span></strong>
                        <strong><span>ENTERPRISE</span></strong>
                    </h1>
                    <img src={Logo} alt="Logo" className="h-16 object-contain" />
                </div>

                {/* INFO MATCHING CONFIMRATION LETTER STYLE */}
                <p><strong>Tanggal</strong> {formatDate(new Date())}</p>
                <p><strong>Kepada</strong> {data.nama_client}</p>
                <br></br>
                <p className="mb-4">
                    Terima kasih atas minat dan kepercayaan Anda kepada <strong>Vauza Tamma Abadi</strong>.
                </p>

                {/* MAIN TABLE MATCHING IMAGE */}
                <div className="border border-gray-400 text-sm mb-8">
                    {/* NO RESERVASI */}
                    <div className="flex border-b border-gray-400">
                        <div className="w-40 p-2 font-bold border-r border-gray-400">No Reservasi</div>
                        <div className="p-2 flex-1 font-bold">{data.no_rsv}</div>
                    </div>

                    {/* HOTEL NAME */}
                    <div className="flex border-b border-gray-400">
                        <div className="w-40 p-2 font-bold border-r border-gray-400">Hotel Name</div>
                        <div className="p-2 flex-1 font-bold uppercase">{data.nama_hotel}</div>
                    </div>

                    {/* CHECK IN */}
                    <div className="flex border-b border-gray-400">
                        <div className="w-40 p-2 font-bold border-r border-gray-400">Check In</div>
                        <div className="p-2 flex-1">{formatDate(data.checkin)}</div>
                    </div>

                    {/* CHECK OUT */}
                    <div className="flex border-b border-gray-400">
                        <div className="w-40 p-2 font-bold border-r border-gray-400">Check Out</div>
                        <div className="p-2 flex-1">{formatDate(data.checkout)}</div>
                    </div>

                    {/* TYPE OF ROOMS */}
                    <div className="flex border-b border-gray-400">
                        <div className="w-40 p-2 font-bold border-r border-gray-400 flex items-center">Type Of Rooms</div>
                        <div className="p-2 flex-1">
                            {rooms.length > 0 ? (
                                rooms.map((r, i) => (
                                    <div key={i} className="mb-1 last:mb-0 flex gap-4">
                                        <span className="font-bold w-4">{r.qty}</span>
                                        <span className="uppercase">{r.room_type}</span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-gray-400">-</span>
                            )}
                        </div>
                    </div>

                    {/* MEAL TYPE */}
                    <div className="flex border-b border-gray-400">
                        <div className="w-40 p-2 font-bold border-r border-gray-400">Meal Type</div>
                        <div className="p-2 flex-1 font-bold uppercase">{data.meal || "-"}</div>
                    </div>

                    {/* CLIENT REMARKS */}
                    <div className="flex min-h-[100px]">
                        <div className="w-40 p-2 font-bold border-r border-gray-400">Client Remarks</div>
                        <div className="p-2 flex-1 italic text-gray-600 align-top">
                            {data.note}
                        </div>
                    </div>
                </div>

                {/* FOOTER SIGNATURE */}
                <div className="flex justify-end mt-12">
                    <div className="w-64 text-center">
                        <p className="font-bold text-lg mb-1 uppercase">Alfina Hidayati</p>
                        <img src={Signature} alt="Signature" className="h-20 mx-auto object-contain my-1" />
                        <p className="text-sm font-bold">Hotel Manager</p>
                        <p className="text-xs mt-1">Stamp and Signature</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
