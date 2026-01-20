import { useState, useEffect } from 'react';
import Button from './Button';
import { X, DollarSign, Wallet } from 'lucide-react';

export default function EditReservationModal({ data, onClose, onSave }) {
    const [form, setForm] = useState({
        status_booking: data.status_booking || 'Tentative',
        status_payment: data.status_payment || 'unpaid',
        payment: 0,
        room_double: data.room_double || 0,
        room_double_rate: data.room_double_rate || 0,
        room_triple: data.room_triple || 0,
        room_triple_rate: data.room_triple_rate || 0,
        room_quad: data.room_quad || 0,
        room_quad_rate: data.room_quad_rate || 0,
        room_extra: data.room_extra || 0,
        room_extra_rate: data.room_extra_rate || 0,
        meal: data.meal || '',
        note: data.note || '',
        checkin: data.checkin || '',
        checkout: data.checkout || ''
    });

    // Calculate dynamic totals
    const calculateStayNight = (inDate, outDate) => {
        const d1 = new Date(inDate);
        const d2 = new Date(outDate);
        const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
        return diff > 0 ? diff : 0;
    };

    const staynight = (form.checkin && form.checkout)
        ? calculateStayNight(form.checkin, form.checkout)
        : (data.staynight || 1);

    const totalRoomAmount = (
        (parseInt(form.room_double || 0) * parseInt(form.room_double_rate || 0)) +
        (parseInt(form.room_triple || 0) * parseInt(form.room_triple_rate || 0)) +
        (parseInt(form.room_quad || 0) * parseInt(form.room_quad_rate || 0)) +
        (parseInt(form.room_extra || 0) * parseInt(form.room_extra_rate || 0))
    ) * staynight;

    const paidInput = parseFloat(form.payment || 0);
    const totalAmount = totalRoomAmount;
    const remaining = totalAmount - (data.paid_amount || 0) - paidInput;

    const labelClass = "block text-[10px] mb-2 text-textSub font-bold uppercase tracking-wider ml-1";
    const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-textMain focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"; // Adjusted text size

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            {/* MODAL BOX - Increased width for more fields */}
            <div
                className="bg-white p-0 text-textMain rounded-card shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto relative animate-bounce-small scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-black text-lg text-textMain tracking-tight">Edit Reservation</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-50 text-textSub transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Status Section */}
                    <div className="grid grid-cols-2 gap-4">
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
                                    <option value="Amend">Amend</option>
                                    <option value="Upgraded">Upgraded</option>
                                    <option value="CANCEL">Cancel</option>
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
                    </div>

                    {/* Dates Section - NEW */}
                    <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div>
                            <label className={labelClass}>Checkin</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.checkin}
                                onChange={e => setForm({ ...form, checkin: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Checkout</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.checkout}
                                onChange={e => setForm({ ...form, checkout: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Room Composition Section */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-textSub uppercase mb-4 tracking-wider border-b border-gray-200 pb-2">Room Composition & Rates</h4>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                            {/* Headers */}
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Room Type</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Qty</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Rate (SAR)</div>

                            {/* Double */}
                            <div className="flex items-center text-sm font-bold text-textMain">Double</div>
                            <input
                                type="number"
                                className={`${inputClass} py-2`}
                                value={form.room_double}
                                onChange={e => setForm({ ...form, room_double: e.target.value })}
                            />
                            <input
                                type="number"
                                className={`${inputClass} py-2`}
                                value={form.room_double_rate}
                                onChange={e => setForm({ ...form, room_double_rate: e.target.value })}
                            />

                            {/* Triple */}
                            <div className="flex items-center text-sm font-bold text-textMain">Triple</div>
                            <input
                                type="number"
                                className={`${inputClass} py-2`}
                                value={form.room_triple}
                                onChange={e => setForm({ ...form, room_triple: e.target.value })}
                            />
                            <input
                                type="number"
                                className={`${inputClass} py-2`}
                                value={form.room_triple_rate}
                                onChange={e => setForm({ ...form, room_triple_rate: e.target.value })}
                            />

                            {/* Quad */}
                            <div className="flex items-center text-sm font-bold text-textMain">Quad</div>
                            <input
                                type="number"
                                className={`${inputClass} py-2`}
                                value={form.room_quad}
                                onChange={e => setForm({ ...form, room_quad: e.target.value })}
                            />
                            <input
                                type="number"
                                className={`${inputClass} py-2`}
                                value={form.room_quad_rate}
                                onChange={e => setForm({ ...form, room_quad_rate: e.target.value })}
                            />

                            {/* Extra/Suite */}
                            <div className="flex items-center text-sm font-bold text-textMain">Extra/Suite</div>
                            <input
                                type="number"
                                className={`${inputClass} py-2`}
                                value={form.room_extra}
                                onChange={e => setForm({ ...form, room_extra: e.target.value })}
                            />
                            <input
                                type="number"
                                className={`${inputClass} py-2`}
                                value={form.room_extra_rate}
                                onChange={e => setForm({ ...form, room_extra_rate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Payment Add Section */}
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

                    {/* Note Section - NEW */}
                    <div>
                        <label className={labelClass}>Note</label>
                        <textarea
                            className={`${inputClass} min-h-[80px]`}
                            value={form.note || ''}
                            onChange={e => setForm({ ...form, note: e.target.value })}
                            placeholder="Add note..."
                        />
                    </div>

                    {/* Summary Box */}
                    <div className="text-sm text-textMain space-y-3 bg-gray-50 border border-gray-100 p-5 rounded-xl">
                        <div className="flex justify-between">
                            <span className="text-textSub font-bold text-[10px] uppercase">New Total Amount ({staynight} nights)</span>
                            <span className="font-mono font-bold text-textMain">{Number(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-textSub font-bold text-[10px] uppercase">Paid So Far</span>
                            <span className="font-mono font-bold text-success">{Number(data.paid_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-textSub font-bold text-[10px] uppercase">Payment Adding</span>
                            <span className="font-mono font-bold text-blue-600">+ {Number(paidInput).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                <div className="p-6 pt-0 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-50">
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
