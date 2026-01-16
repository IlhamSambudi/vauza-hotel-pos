import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const RecentTable = ({
    title,
    data = [],
    headers = [],
    renderRow,
    hasStatusToggle = false,
    showDeleted = false,
    onToggleDelete,
    emptyMessage = "No Data Available"
}) => {

    const displayData = showDeleted
        ? data
        : data.filter(item => item.tag_status !== 'delete');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-lg tracking-tight">{title}</h3>

                {hasStatusToggle && onToggleDelete && (
                    <button
                        onClick={onToggleDelete}
                        className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors uppercase tracking-wide
                        ${showDeleted
                                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                : 'bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
                    >
                        {showDeleted ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span>{showDeleted ? 'Hide Deleted' : 'Show Deleted'}</span>
                    </button>
                )}
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} className={`px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${index === headers.length - 1 ? 'text-right' : ''}`}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {displayData.length > 0 ? (
                            displayData.map((item, index) => renderRow(item, index))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-8 text-center text-slate-400 italic font-medium text-xs">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {displayData.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 text-center">
                    <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-1 mx-auto">
                        View All {title.replace('Recent ', '')} &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentTable;
