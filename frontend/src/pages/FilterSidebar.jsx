import React from "react";

const FilterSidebar = ({ filters, setFilters }) => {
  const colors = [
    "black", "white", "red", "blue", "green",
    "yellow", "purple", "pink", "brown", "gray"
  ];

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  return (
    <aside className="space-y-5 text-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800">Filter</h3>

      {/* CATEGORY */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">Category</h3>
        {["Top Wear", "Bottom Wear"].map((item) => (
          <label key={item} className="block text-sm">
            <input
              type="checkbox"
              checked={filters.category.includes(item)}
              onChange={() => toggleFilter("category", item)}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </div>

      {/* GENDER */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">Gender</h3>
        {["Men", "Women"].map((item) => (
          <label key={item} className="block text-sm">
            <input
              type="checkbox"
              checked={filters.gender.includes(item)}
              onChange={() => toggleFilter("gender", item)}
              className="mr-2"
            />
            {item}
          </label>
        ))}
      </div>

      {/* COLORS */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <div
              key={color}
              onClick={() => toggleFilter("color", color)}
              className={`w-7 h-7 rounded-full cursor-pointer border-2
                ${filters.color.includes(color)
                  ? "border-black ring-1/2 ring-black"
                  : "border-gray-300"}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* SIZE (CHECKBOXES) */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">Size</h3>
        {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
          <label key={size} className="block text-sm">
            <input
              type="checkbox"
              checked={filters.size.includes(size)}
              onChange={() => toggleFilter("size", size)}
              className="mr-2"
            />
            {size}
          </label>
        ))}
      </div>

      {/* MATERIAL */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">Material</h3>
        {["Cotton", "Wool", "Denim", "Polyester", "Silk", "Linen", "Viscose", "Fleece"].map((m) => (
          <label key={m} className="block text-sm">
            <input
              type="checkbox"
              checked={filters.material.includes(m)}
              onChange={() => toggleFilter("material", m)}
              className="mr-2"
            />
            {m}
          </label>
        ))}
      </div>

      {/* BRAND */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">Brand</h3>
        {["Urban Threads", "Modern Fit", "Street Style", "Beach Breeze", "Fashioninsta", "Chicstyle"].map((b) => (
          <label key={b} className="block text-sm">
            <input
              type="checkbox"
              checked={filters.brand.includes(b)}
              onChange={() => toggleFilter("brand", b)}
              className="mr-2"
            />
            {b}
          </label>
        ))}
      </div>

      {/* PRICE RANGE */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">Price Range</h3>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
          }
          className="w-full"
        />
        <p className="text-sm">Up to ${filters.maxPrice}</p>
      </div>
    </aside>
  );
};

export default FilterSidebar;
