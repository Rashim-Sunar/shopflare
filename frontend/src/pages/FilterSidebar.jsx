import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../redux/slices/productSlice";

const FilterSidebar = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.products);

  const colors = [
    "Black", "White", "Red", "Blue", "Green",
    "Yellow", "Purple", "Pink", "Brown", "Gray",
  ];

  /* ✅ Redux toggle logic */
  const toggleFilter = (type, value) => {
    const currentValues = filters[type] || [];

    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    dispatch(setFilters({ [type]: updatedValues }));
  };

  return (
    <aside className="space-y-5 text-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800">Filter</h3>

      {/* CATEGORY */}
      <div>
        <h3 className="font-semibold mb-2">Category</h3>
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
        <h3 className="font-semibold mb-2">Gender</h3>
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
        <h3 className="font-semibold mb-2">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <div
              key={color}
              onClick={() => toggleFilter("color", color)}
              className={`w-7 h-7 rounded-full cursor-pointer border-2
                ${filters.color.includes(color)
                  ? "border-black ring-1 ring-black"
                  : "border-gray-300"}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* SIZE */}
      <div>
        <h3 className="font-semibold mb-2">Size</h3>
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
        <h3 className="font-semibold mb-2">Material</h3>
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
        <h3 className="font-semibold mb-2">Brand</h3>
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
        <h3 className="font-semibold mb-2">Price Range</h3>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.maxPrice}
          onChange={(e) =>
            dispatch(setFilters({ maxPrice: Number(e.target.value) }))
          }
          className="w-full"
        />
        <p className="text-sm">Up to ${filters.maxPrice}</p>
      </div>
    </aside>
  );
};

export default FilterSidebar;
