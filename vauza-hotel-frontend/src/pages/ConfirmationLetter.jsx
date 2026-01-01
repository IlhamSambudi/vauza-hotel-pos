import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import Logo from "../assets/logo.png";
import Signature from "../assets/ttd_fina.png";

export default function ConfirmationLetter() {
    const { no_rsv } = useParams();
    const [data, setData] = useState(null);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        api.get(`/reservations/${no_rsv}`).then(res => setData(res.data));
        api.get(`/reservations/${no_rsv}/rooms`).then(res => setRooms(res.data));
    }, [no_rsv]);

    const formatDate = (dateString, isToday = false) => {
        const date = isToday ? new Date() : new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    if (!data) return <p>Loading...</p>;

    return (
        <div className="bg-white text-black min-h-screen p-10 print:p-0 print:bg-white print:min-h-0 print:h-auto print:overflow-visible">
            <div className="max-w-[800px] mx-auto text-sm leading-relaxed">

                {/* PRINT BUTTON */}
                <div className="mb-6 print:hidden flex justify-end">
                    <button
                        onClick={() => window.print()}
                        className="bg-primary text-white px-4 py-2 hover:bg-primaryHover"
                    >
                        Print / Download PDF
                    </button>
                </div>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-black tracking-widest leading-none text-green-700 flex flex-col">
                        <strong><span>CONFIRMATION</span></strong>
                        <strong><span>LETTER</span></strong>
                    </h1>
                    <img src={Logo} alt="Logo" className="h-16 object-contain" />
                </div>

                <p><strong>Tanggal</strong> {formatDate(null, true)}</p>
                <p><strong>Kepada</strong> {data.nama_client}</p>
                <br></br>
                <p className="mb-4">
                    Terima kasih atas minat dan kepercayaan Anda kepada <strong>Vauza Tamma Abadi</strong>.
                </p>

                <table className="w-full mb-5">
                    <tbody>
                        <tr><td><strong>Res. No</strong></td><td>{data.no_rsv}</td></tr>
                        <tr><td><strong>Nama Tamu</strong></td><td>{data.nama_client}</td></tr>
                        <tr><td><strong>Hotel</strong></td><td>{data.nama_hotel}</td></tr>
                        <tr><td><strong>Checkin</strong></td><td>{formatDate(data.checkin)}</td></tr>
                        <tr><td><strong>Checkout</strong></td><td>{formatDate(data.checkout)}</td></tr>
                        <tr><td><strong>Bermalam</strong></td><td>{data.staynight} Malam</td></tr>
                    </tbody>
                </table>

                <table className="w-full border border-black text-xs mb-5 border-collapse">
                    <thead className="bg-gray-200 text-black font-bold">
                        <tr>
                            <th className="border border-black p-2">Tipe Kamar</th>
                            <th className="border border-black p-2">Kuantitas</th>
                            <th className="border border-black p-2">Paket Makanan</th>
                            <th className="border border-black p-2">Rate Kamar</th>
                            <th className="border border-black p-2">Total Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length > 0 ? (
                            rooms.map((r) => (
                                <tr key={r.id}>
                                    <td className="border border-black p-2">{r.room_type}</td>
                                    <td className="border border-black p-2">{r.qty}</td>
                                    <td className="border border-black p-2">{r.meal || "-"}</td>
                                    <td className="border border-black p-2">SAR {Number(r.rate).toLocaleString()}</td>
                                    <td className="border border-black p-2">SAR {Number(r.total).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="border border-black p-2 text-center text-gray-500 italic">
                                    No room details found. (Reservation might be from before update)
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="flex justify-end mb-5">
                    <div className="w-1/2">
                        <div className="flex justify-between mb-1">
                            <strong>Total Biaya Akomodasi</strong>
                            <span>SAR {data.total_amount}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <strong>Terbayar</strong>
                            <span>SAR {data.paid_amount}</span>
                        </div>
                        <div className="flex justify-between border-t border-black pt-1">
                            <strong>Sisa Pembayaran</strong>
                            {/* Assuming data.total_amount is string "X,XXX" from backend formatting. Safe to parse back or use raw if available. 
                        Actually I formatted it in backend. I should parse it to subtract. 
                        Or better, use the raw total stored in state, but wait, backend returns formatted string.
                        I'll fix backend to return raw numbers and format in frontend OR handle parsing here.
                        Backend returns: total_amount (string with comma), paid_amount (string with comma).
                        Parsing "1,234.00" -> parseFloat("1234.00")
                     */}
                            <span>SAR {
                                (Number(data.total_amount.replace(/,/g, '')) - Number(data.paid_amount.replace(/,/g, ''))).toLocaleString('en-US')
                            }</span>
                        </div>
                    </div>
                </div>

                <table className="mb-8 hidden"> {/* Hidden because logic duplicates above or user wants summary separately? User snippet had summary table. I will keep user's snippet logic predominantly but refine. */}
                    <tbody>
                        <tr><td><strong>Total :</strong></td><td className="pl-4">SAR {data.subtotal}</td></tr>
                        <tr><td><strong>VAT :</strong></td><td className="pl-4">SAR {data.vat}</td></tr>
                        <tr><td><strong>Total Amount :</strong></td><td className="pl-4">SAR {data.total_amount}</td></tr>
                    </tbody>
                </table>

                {/* Re-implementing User's Bottom Section */}
                <div className="mb-8">
                    <div className="flex justify-between">
                        <span><strong>Total :</strong> SAR {data.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                        <span><strong>VAT :</strong> SAR {data.vat}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span><strong>Total Amount :</strong> SAR {data.total_amount}</span>
                    </div>
                </div>

                <h3 className="font-bold mb-2">KETENTUAN & KONDISI</h3>

                <div className="text-xs leading-relaxed space-y-3 mb-8">
                    <div>
                        <strong>1. Harga & Ketentuan Umum</strong>
                        <ul className="list-disc ml-6">
                            <li>Seluruh harga bersifat net, final, dan tidak dapat dikomisi.</li>
                            <li>Harga sudah termasuk biaya kota (Municipality Fees) dan PPN/VAT sesuai dengan ketentuan hotel dan peraturan setempat.</li>
                            <li>Waktu check-in standar adalah setelah pukul 16.00, dan waktu check-out adalah pukul 12.00</li>
                            <li>Fasilitas parkir tergantung ketersediaan. Pada hotel tertentu, biaya parkir dapat dikenakan.</li>
                        </ul>
                    </div>

                    <div>
                        <strong>2. Status Pemesanan</strong>
                        <ul className="list-disc ml-6">
                            <li>Seluruh reservasi berstatus Tentative (sementara) sampai pembayaran diterima sesuai dengan ketentuan yang berlaku (maksimal 3 hari setelah Surat Konfirmasi diterbitkan).</li>
                            <li>Setelah pemesanan dikonfirmasi dan/atau ditetapkan sebagai Definite, maka seluruh syarat dan ketentuan menjadi mengikat sepenuhnya.</li>
                            <li>Apabila pemesanan tidak dibayarkan sesuai dengan ketentuan uang muka (DP) dalam waktu 3 hari, maka pemesanan akan dibatalkan atau dilepas secara otomatis.</li>
                        </ul>
                    </div>

                    <div>
                        <strong>3. Kebijakan Pembayaran</strong>
                        <ul className="list-disc ml-6">
                            <li>DP sebesar 30% diperlukan untuk mengamankan pemesanan.</li>
                            <li>40% dari total nilai pemesanan wajib dibayarkan 30 hari sebelum tanggal kedatangan.</li>
                            <li>Pelunasan 100% wajib diterima maksimal 15 hari sebelum check-in.</li>
                            <li>Keterlambatan atau kegagalan pembayaran akan menyebabkan pemesanan dilepas secara otomatis, dengan tetap mengikuti ketentuan pembatalan yang berlaku.</li>
                            <li>Apabila pembayaran tidak diterima hingga batas waktu (option date), maka pemesanan akan dilepas secara otomatis tanpa pemberitahuan sebelumnya.</li>
                        </ul>
                    </div>

                    <div>
                        <strong>4. Kebijakan Amandemen</strong>
                        <ul className="list-disc ml-6">
                            <li>Seluruh perubahan pemesanan bergantung pada ketersediaan dan kebijakan hotel.</li>
                            <li>Permohonan amandemen wajib diajukan paling lambat 15 hari sebelum tanggal check-in.</li>
                            <li>Ketentuan pengurangan jumlah kamar berdasarkan tanggal kedatangan:
                                <ul className="list-circle ml-6">
                                    <li>&ge; 30 hari sebelum kedatangan: pengurangan hingga 80% diperbolehkan</li>
                                    <li>21 hari sebelum kedatangan: pengurangan hingga 50%</li>
                                    <li>14 hari sebelum kedatangan: pengurangan hingga 20%</li>
                                    <li>7 hari sebelum kedatangan: pengurangan hingga 5%</li>
                                    <li>&le; 6 hari → tidak diperkenankan perubahan 6 hari atau kurang sebelum kedatangan: tidak diperkenankan perubahan</li>
                                </ul>
                            </li>
                            <li>Untuk pemesanan Tentative, amandemen dapat dikenakan biaya sebesar 15% dari total nilai pemesanan, tergantung ketersediaan.</li>
                        </ul>
                    </div>

                    <div>
                        <strong>5. Kebijakan Pembatalan</strong>
                        <ul className="list-disc ml-6">
                            <li>&gt; Lebih dari 30 hari sebelum kedatangan: dikenakan biaya 20%</li>
                            <li>&gt; Lebih dari 21 hari sebelum kedatangan: dikenakan biaya 50%</li>
                            <li>&gt; Lebih dari 14 hari sebelum kedatangan: dikenakan biaya 80%</li>
                            <li>&gt; Lebih dari 7 hari sebelum kedatangan: dikenakan biaya 100%</li>
                            <li>Setelah pemesanan dikonfirmasi sebagai Definite, maka biaya pembatalan akan diberlakukan sepenuhnya sesuai ketentuan di atas.</li>
                        </ul>
                    </div>

                    <div>
                        <strong>6. Klausul Pelepasan Otomatis</strong>
                        <p className="ml-6">
                            Kegagalan dalam memenuhi jadwal pembayaran atau tanggal batas opsi (option date) akan mengakibatkan pembatalan otomatis, dan ketersediaan kamar tidak lagi dijamin.
                        </p>
                    </div>

                    <div>
                        <strong>7. Ketentuan Penutup</strong>
                        <p className="ml-6">
                            Dengan melanjutkan pemesanan dan/atau melakukan pembayaran, klien dianggap telah membaca, memahami, menyetujui, dan menerima seluruh syarat dan ketentuan ini tanpa pengecualian.
                        </p>
                    </div>
                </div>


                <div className="text-sm mt-6">
                    <p><strong>NAMA BANK :</strong> BANK MANDIRI</p>
                    <p><strong>NAMA AKUN :</strong> VAUZA TAMMA ABADI</p>
                    <p><strong>NOMOR AKUN :</strong> 1440055515156</p>
                </div>

                <div className="mt-10 mb-2">
                    <p className="font-bold mb-4">Hormat Kami,</p>
                    <p className="font-bold">Alfina Hidayati</p>
                    <img src={Signature} alt="Signature" className="h-16 my-1 object-contain" />
                    <p>Hotel Manager</p>
                </div>

            </div>
        </div>
    );
}
