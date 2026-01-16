import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { formatDate } from "../utils/formatDate";
import Logo from "../assets/logo umroh 5.png";
import Signature from "../assets/ttd_fina.png";

export default function PaymentReceipt() {
    const { id_payment } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Updated to use /detail endpoint
        api.get(`/payments/detail/${id_payment}`)
            .then(res => setData(res.data))
            .catch(err => {
                console.error("Error loading receipt:", err);
                setError(err.message || "Failed to load data");
            });
    }, [id_payment]);



    if (error) return <div className="p-10 text-red-500 font-bold">Error: {error}</div>;
    if (!data) return <p className="p-10">Loading payment details...</p>;

    return (
        <div className="bg-white text-black min-h-screen p-10 print:p-0 print:bg-white print:min-h-0 print:h-auto print:overflow-visible font-sans">
            <div className="max-w-[800px] mx-auto text-sm leading-relaxed">

                {/* PRINT BUTTON */}
                <div className="mb-6 print:hidden flex justify-end">
                    <button
                        onClick={() => window.print()}
                        className="bg-primary text-white px-4 py-2 hover:bg-primaryHover rounded-sm"
                    >
                        Print / Download PDF
                    </button>
                </div>

                {/* HEADER - Matches Confirmation Letter Style */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-black tracking-widest leading-none text-green-700 flex flex-col">
                        <strong><span>OFFICIAL</span></strong>
                        <strong><span>RECEIPT</span></strong>
                    </h1>
                    <img src={Logo} alt="Logo" className="h-16 object-contain" />
                </div>

                {/* BASIC INFO */}
                <p><strong>Tanggal</strong>: {formatDate(data.date)}</p>
                <p><strong>No Kwitansi</strong>: {data.id_payment}</p>
                <br />
                <p className="mb-4">
                    Telah diterima dari <strong>{data.nama_client}</strong>.
                </p>

                {/* DETAILS TABLE */}
                <table className="w-full border border-black text-xs mb-8 border-collapse">
                    <thead className="bg-gray-200 text-black font-bold">
                        <tr>
                            <th className="border border-black p-3 text-left">Keterangan</th>
                            <th className="border border-black p-3 text-right">Jumlah (IDR)</th>
                            <th className="border border-black p-3 text-right">Jumlah (SAR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-3">
                                <div className="font-bold mb-1">Pembayaran:</div>
                                <div className="italic">{data.detail || "Payment"}</div>
                                {(Number(data.exchange_rate) > 1) && (
                                    <div className="text-[10px] text-gray-500 mt-1">Kurs: {Number(data.exchange_rate).toLocaleString()}</div>
                                )}
                            </td>
                            <td className="border border-black p-3 text-right font-mono">
                                Rp {Number(data.amount).toLocaleString('en-US')}
                            </td>
                            <td className="border border-black p-3 text-right font-mono font-bold">
                                SAR {Number(data.amount_sar).toLocaleString('en-US')}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* TOTALS */}
                <div className="flex justify-end mb-12">
                    <div className="w-1/2 border-t-2 border-black pt-2">
                        <div className="flex justify-between font-black text-lg">
                            <span>TOTAL DITERIMA</span>
                            <span>SAR {Number(data.amount_sar).toLocaleString('en-US')}</span>
                        </div>
                    </div>
                </div>

                <div className="text-sm mt-6 mb-8">
                    <p><strong>NAMA BANK :</strong> BANK MANDIRI</p>
                    <p><strong>NAMA REKENING :</strong> VAUZA TAMMA ABADI</p>
                    <p><strong>NOMOR REKENENING :</strong> 1440055515156</p>
                </div>

                {/* FOOTER */}
                <div className="mt-10 mb-2 flex justify-between items-end">
                    <div className="text-xs text-gray-500 w-1/2">
                        <p className="italic">* Pembayaran dianggap sah hanya jika dana telah masuk ke rekening kami.</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-4">Hormat Kami,</p>
                        <img src={Signature} alt="Signature" className="h-16 my-1 object-contain mx-auto" />
                        <p className="font-bold border-t border-black px-8 pt-1 inline-block">Alfina Hidayati</p>
                        <p>Hotel Manajer</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
