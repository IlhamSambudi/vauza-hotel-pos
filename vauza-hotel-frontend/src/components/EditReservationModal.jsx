import { useState } from 'react';

export default function EditReservationModal({ data, onClose, onSave }) {
    const [form, setForm] = useState({
        status_booking: data.status_booking,
        status_payment: data.status_payment,
        payment: 0
    });

    const paidInput = parseFloat(form.payment || 0);
    const remaining =
        data.total_amount - data.paid_amount - paidInput;

    const labelClass = "block text-xs mb-2 text-textSub font-bold uppercase tracking-wider ml-1";
    const inputClass = "w-full mb-4 bg-neu border-none rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-neu-pressed transition-all font-medium";

    return (
        <div
            className="fixed inset-0 bg-neu/80 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* MODAL BOX */}
            <div
                className="bg-white p-8 text-textMain rounded-2xl shadow-2xl border border-gray-100 w-96 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primaryHover rounded-t-2xl"></div>
                <h3 className="font-black text-2xl mb-8 text-primary tracking-tight">Edit Reservation</h3>

                <div>
                    <label className={labelClass}>Status Booking</label>
                    <select
                        className="w-full mb-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={form.status_booking}
                        onChange={e =>
                            setForm({ ...form, status_booking: e.target.value })
                        }
                    >
                        <option value="Tentative">Tentative</option>
                        <option value="Definite">Definite</option>
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Status Payment</label>
                    <select
                        className="w-full mb-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={form.status_payment}
                        onChange={e =>
                            setForm({ ...form, status_payment: e.target.value })
                        }
                    >
                        <option value="unpaid">Unpaid</option>
                        <option value="dp_30">DP 30%</option>
                        <option value="partial">Partial</option>
                        <option value="full_payment">Full Payment</option>
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Input Payment (SAR)</label>
                    <input
                        type="text"
                        className="w-full mb-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={form.payment}
                        onChange={(e) => {
                            let val = e.target.value;
                            val = val.replace(',', '.');
                            val = val.replace(/[^0-9.]/g, '');
                            const parts = val.split('.');
                            if (parts.length > 2) {
                                val = parts[0] + '.' + parts.slice(1).join('');
                            }
                            setForm({ ...form, payment: val });
                        }}
                        placeholder="Nominal pembayaran (SAR)"
                    />
                </div>

                <div className="text-sm text-textMain mb-8 space-y-3 bg-gray-50 border border-gray-200 p-5 rounded-xl">
                    <div className="flex justify-between">
                        <span className="text-textSub font-bold text-xs uppercase">Total</span>
                        <span className="font-mono font-bold">{Number(data.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-textSub font-bold text-xs uppercase">Sudah dibayar</span>
                        <span className="font-mono font-bold">{Number(data.paid_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 mt-2 pt-2">
                        <span className="text-textSub font-bold text-xs uppercase">Sisa</span>
                        <span className="font-black text-primary text-xl tracking-tight">
                            {remaining < 0 ? 0 : Number(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-textSub rounded-xl hover:text-textMain transition-all font-bold hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onSave({
                                no_rsv: data.no_rsv,
                                ...form
                            })
                        }
                        className="px-8 py-3 bg-primary text-white rounded-xl transition-all font-black shadow-lg hover:shadow-xl active:scale-95 hover:-translate-y-0.5"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
