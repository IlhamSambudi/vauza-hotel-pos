import React from 'react';

const StatCard = ({ title, value, icon: Icon, isCurrency = false }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/5 rounded-xl text-primary">
                    <Icon size={24} strokeWidth={2} />
                </div>
                {isCurrency && (
                    <span className="text-xs font-bold bg-green-50 text-green-600 px-2 py-1 rounded-lg">
                        +12%
                    </span>
                )}
            </div>
            <div>
                <p className="text-textSub text-sm mb-1 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-textMain tracking-tight">
                    {isCurrency
                        ? (typeof value === 'number' ? value.toLocaleString() : value)
                        : value}
                </h3>
            </div>
        </div>
    );
};

export default StatCard;
