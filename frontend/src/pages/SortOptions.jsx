import React from "react";

const SortOptions = ({ filters, setFilters }) => {
  return (
    <select
      value={filters.sort}
      onChange={(e) =>
        setFilters((prev) => ({ ...prev, sort: e.target.value }))
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
