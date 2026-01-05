import React, { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

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

    // Filter out deleted items if showDeleted is false
    // Assuming 'tag_status' is the field for deletion status based on usage in Dashboard
    const displayData = showDeleted
        ? data
        : data.filter(item => item.tag_status !== 'delete');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-textMain text-lg tracking-tight">{title}</h3>

                {hasStatusToggle && onToggleDelete && (
                    <button
                        onClick={onToggleDelete}
                        className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors
                        ${showDeleted
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-gray-50 text-textSub hover:text-textMain hover:bg-gray-100'}`}
                    >
                        {showDeleted ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{showDeleted ? 'Hide Deleted' : 'Show Deleted'}</span>
                    </button>
                )}
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-textSub uppercase bg-gray-50/50 font-bold tracking-wider">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} className={`px-6 py-4 ${index === headers.length - 1 ? 'text-right' : ''}`}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {displayData.length > 0 ? (
                            displayData.map((item, index) => renderRow(item, index))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-8 text-center text-textSub italic font-medium">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {displayData.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 text-center">
                    <button className="text-xs font-bold text-primary hover:text-primaryHover transition-colors uppercase tracking-wide">
                        View All {title.replace('Recent ', '')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentTable;
