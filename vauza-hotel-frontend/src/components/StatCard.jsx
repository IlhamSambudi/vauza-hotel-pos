import React from 'react';

const StatCard = ({ title, value, icon: Icon, isCurrency = false }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                    <Icon size={24} strokeWidth={2} />
                </div>
                {/* Optional Trend Indicator could go here */}
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {isCurrency
                        ? (typeof value === 'number' ? value.toLocaleString() : value)
                        : value}
                </h3>
            </div>
        </div>
    );
};

export default StatCard;
