import { useState, useMemo } from 'react';

export default function useTable({ data, defaultSort = { key: 'created_at', direction: 'desc' } }) {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState(defaultSort);
    const [filters, setFilters] = useState({});

    // Filtered & Sorted Data
    const filteredData = useMemo(() => {
        let result = Array.isArray(data) ? [...data] : [];

        // 1. Filter by key-value pairs (Exact match or custom logic could be added)
        Object.keys(filters).forEach(key => {
            if (filters[key] && filters[key] !== 'all') {
                result = result.filter(item => String(item[key]) === String(filters[key]));
            }
        });

        // 2. Search (Global text search across all values)
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(lowerSearch)
                )
            );
        }

        // 3. Sort
        if (sort.key) {
            result.sort((a, b) => {
                const aVal = a[sort.key];
                const bVal = b[sort.key];

                if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, search, sort, filters]);

    // Handlers
    const handleSort = (key) => {
        setSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return {
        data: filteredData,
        search, setSearch,
        sort, setSort: handleSort,
        filters, setFilter: handleFilter
    };
}
