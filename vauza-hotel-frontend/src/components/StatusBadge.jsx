import React from 'react';
/* REPLACED WITH PREMIUM PILL BADGES */
const StatusBadge = ({ status }) => {
    let colorClass = 'bg-slate-50 text-slate-500 border border-slate-200';
    let label = status;

    switch (status) {
        case 'active':
        case 'paid':
        case 'confirmed':
        case 'full_payment':
        case 'payment done':
        case 'payment_done': // Handler for both versions
            colorClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm shadow-emerald-100/50';
            break;
        case 'pending':
        case 'dp':
        case 'dp_30':
        case 'partial':
            colorClass = 'bg-amber-50 text-amber-600 border border-amber-100/50 shadow-sm shadow-amber-100/50';
            break;
        case 'inactive':
        case 'cancelled':
        case 'unpaid':
            colorClass = 'bg-rose-50 text-rose-600 border border-rose-100/50 shadow-sm shadow-rose-100/50';
            break;
        case 'new':
            colorClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm shadow-emerald-100/50';
            break;
        case 'edited':
        case 'amend':
            colorClass = 'bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm shadow-blue-100/50';
            break;
        case 'delete':
            colorClass = 'bg-slate-50 text-slate-400 border border-slate-200 line-through decoration-slate-400/50';
            break;
        case 'upgraded':
            colorClass = 'bg-indigo-50 text-indigo-600 border border-indigo-100/50 shadow-sm shadow-indigo-100/50';
            break;
        default:
            colorClass = 'bg-slate-50 text-slate-500 border border-slate-200';
    }

    if (!label) return null;

    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${colorClass}`}>
            {label.replace(/_/g, ' ')}
        </span>
    );
};

export default StatusBadge;
