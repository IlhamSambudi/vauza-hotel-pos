import React from 'react';

const StatusBadge = ({ status }) => {
    let colorClass = 'bg-gray-100 text-gray-600';
    let label = status;

    switch (status) {
        case 'active':
        case 'paid':
        case 'confirmed':
        case 'full_payment':
        case 'payment_done':
            colorClass = 'bg-green-100 text-green-700';
            break;
        case 'pending':
        case 'dp':
            colorClass = 'bg-amber-100 text-amber-700';
            break;
        case 'inactive':
        case 'cancelled':
            colorClass = 'bg-red-100 text-red-700';
            break;
        case 'new':
            colorClass = 'bg-blue-100 text-blue-700';
            break;
        case 'edited':
            colorClass = 'bg-indigo-100 text-indigo-700';
            break;
        case 'delete':
            colorClass = 'bg-gray-100 text-gray-500 line-through';
            break;
        default:
            colorClass = 'bg-gray-100 text-gray-600';
    }

    if (!label) return null;

    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${colorClass}`}>
            {label.replace(/_/g, ' ')}
        </span>
    );
};

export default StatusBadge;
