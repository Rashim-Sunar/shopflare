import React from "react";

/**
 * SortOptions
 * Controls product sorting (price, popularity, etc.)
 * Uses Redux-based filters (NOT local state)
 */
const SortOptions = ({ filters, setFilters }) => {
  return (
    <select
      value={filters.sort}
      onChange={(e) =>
        // ✅ Redux expects a plain object, not a function
        setFilters({ sort: e.target.value })
      }
      className="border p-1 rounded-md text-sm"
    >
      <option value="">Sort By</option>
      <option value="low-high">Price: Low to High</option>
      <option value="high-low">Price: High to Low</option>
      <option value="popularity">Popularity</option>
    </select>
  );
};

export default SortOptions;
