import { useState } from 'react';
import Button from './Button';
import { X, DollarSign, Wallet } from 'lucide-react';

export default function EditReservationModal({ data, onClose, onSave }) {
    const [form, setForm] = useState({
        status_booking: data.status_booking,
        status_payment: data.status_payment,
        payment: 0
    });

    const paidInput = parseFloat(form.payment || 0);
    const remaining = data.total_amount - data.paid_amount - paidInput;

    const labelClass = "block text-[10px] mb-2 text-textSub font-bold uppercase tracking-wider ml-1";
    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium";

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            {/* MODAL BOX */}
            <div
                className="bg-white p-0 text-textMain rounded-card shadow-2xl w-[400px] relative overflow-hidden animate-bounce-small"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-black text-lg text-textMain tracking-tight">Edit Reservation</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-50 text-textSub transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <div>
                        <label className={labelClass}>Status Booking</label>
                        <div className="relative">
                            <select
                                className={`${inputClass} appearance-none`}
                                value={form.status_booking}
                                onChange={e => setForm({ ...form, status_booking: e.target.value })}
                            >
                                <option value="Tentative">Tentative</option>
                                <option value="Definite">Definite</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Status Payment</label>
                        <div className="relative">
                            <select
                                className={`${inputClass} appearance-none`}
                                value={form.status_payment}
                                onChange={e => setForm({ ...form, status_payment: e.target.value })}
                            >
                                <option value="unpaid">Unpaid</option>
                                <option value="dp_30">DP 30%</option>
                                <option value="partial">Partial</option>
                                <option value="full_payment">Full Payment</option>
                            </select>
                            <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Add Payment (SAR)</label>
                        <div className="relative">
                            <input
                                type="text"
                                className={inputClass}
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
                                placeholder="Nominal (SAR)"
                            />
                            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="text-sm text-textMain space-y-3 bg-gray-50 border border-gray-100 p-5 rounded-xl">
                        <div className="flex justify-between">
                            <span className="text-textSub font-bold text-[10px] uppercase">Total Amount</span>
                            <span className="font-mono font-bold text-textMain">{Number(data.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-textSub font-bold text-[10px] uppercase">Paid So Far</span>
                            <span className="font-mono font-bold text-success">{Number(data.paid_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 mt-2 pt-3">
                            <span className="text-textSub font-bold text-[10px] uppercase self-end mb-1">Remaining</span>
                            <span className={`font-black text-xl tracking-tight ${remaining <= 0 ? 'text-success' : 'text-primary'}`}>
                                {remaining < 0 ? 0 : Number(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="font-bold text-gray-400 hover:text-textMain"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSave({ no_rsv: data.no_rsv, ...form })}
                        className="shadow-lg hover:shadow-xl px-6"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
