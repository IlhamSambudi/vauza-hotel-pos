import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const TableControls = ({
    search, setSearch,
    sort, setSort,
    filters, setFilter,
    sortOptions = [],
    filterOptions = [] // [{ key: 'status', label: 'Status', options: ['new', 'paid'] }]
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-slate-400 text-slate-700 font-medium"
                />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                {/* Sort Dropdown */}
                {sortOptions.length > 0 && (
                    <div className="relative min-w-[140px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <ArrowUpDown size={16} />
                        </div>
                        <select
                            value={sort.key}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 appearance-none focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <option value="" disabled>Sort By</option>
                            {sortOptions.map(opt => (
                                <option key={opt.key} value={opt.key}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Filters */}
                {filterOptions.map(filter => (
                    <div key={filter.key} className="relative min-w-[140px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Filter size={16} />
                        </div>
                        <select
                            value={filters[filter.key] || ''}
                            onChange={(e) => setFilter(filter.key, e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 appearance-none focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <option value="">All {filter.label}</option>
                            {filter.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableControls;
