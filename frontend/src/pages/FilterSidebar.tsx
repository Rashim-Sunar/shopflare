import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters } from "../redux/slices/productSlice";
import axios from "axios";

interface FilterOptions {
  genders: string[];
  subCategories: string[];
  subCategoriesByGender?: Record<string, string[]>;
  types: string[];
  brands: string[];
  sizes: string[];
  priceRange: { min: number; max: number };
}

const FilterSidebar = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.products);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch dynamic filter options on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/filters`);
        if (response.data.status === "success") {
          setFilterOptions(response.data.filters);
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
        // Fallback to empty filters on error
        setFilterOptions({
          genders: [],
          subCategories: [],
          types: [],
          brands: [],
          sizes: [],
          priceRange: { min: 0, max: 10000 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // Keep price filter bounds aligned with backend data so default values never hide all products.
  useEffect(() => {
    if (!filterOptions) {
      return;
    }

    const currentMin = Number(filters.minPrice ?? 0);
    const currentMax = Number(filters.maxPrice ?? 0);
    const nextFilters: Record<string, number> = {};

    if (currentMin < filterOptions.priceRange.min) {
      nextFilters.minPrice = filterOptions.priceRange.min;
    }

    if (currentMax < filterOptions.priceRange.min || currentMax > filterOptions.priceRange.max) {
      nextFilters.maxPrice = filterOptions.priceRange.max;
    }

    if (Object.keys(nextFilters).length > 0) {
      dispatch(setFilters(nextFilters));
    }
  }, [dispatch, filterOptions, filters.maxPrice, filters.minPrice]);

  /* ✅ Redux toggle logic */
  const toggleFilter = (type: string, value: string) => {
    const currentValues = (filters[type] as string[]) || [];

    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];

    dispatch(setFilters({ [type]: updatedValues }));
  };

  if (loading) {
    return <aside className="space-y-5 text-gray-700">Loading filters...</aside>;
  }

  if (!filterOptions) {
    return <aside className="space-y-5 text-gray-700">No filters available</aside>;
  }

  // Get filtered subCategories based on selected gender (for UI logic)
  // (The actual filtering still happens on the backend via API)
  const selectedGenders = (filters.gender as string[]) || [];
  const visibleSubCategories =
    selectedGenders.length > 0 && filterOptions.subCategoriesByGender
      ? Array.from(
          new Set(
            selectedGenders.flatMap((gender) => filterOptions.subCategoriesByGender?.[gender] || [])
          )
        ).sort()
      : filterOptions.subCategories;

  return (
    <aside className="space-y-5 text-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800">Filter</h3>

      {/* GENDER */}
      {filterOptions.genders.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Gender</h3>
          {filterOptions.genders.map((item) => (
            <label key={item} className="block text-sm">
              <input
                type="checkbox"
                checked={(filters.gender as string[]).includes(item)}
                onChange={() => toggleFilter("gender", item)}
                className="mr-2"
              />
              {item}
            </label>
          ))}
        </div>
      )}

      {/* SUB CATEGORY */}
      {visibleSubCategories.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Category</h3>
          {visibleSubCategories.map((item) => (
            <label key={item} className="block text-sm">
              <input
                type="checkbox"
                checked={(filters.subCategory as string[]).includes(item)}
                onChange={() => toggleFilter("subCategory", item)}
                className="mr-2"
              />
              {item}
            </label>
          ))}
        </div>
      )}

      {/* TYPE */}
      {filterOptions.types.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Style</h3>
          {filterOptions.types.map((item) => (
            <label key={item} className="block text-sm">
              <input
                type="checkbox"
                checked={(filters.type as string[]).includes(item)}
                onChange={() => toggleFilter("type", item)}
                className="mr-2"
              />
              {item}
            </label>
          ))}
        </div>
      )}

      {/* SIZE */}
      {filterOptions.sizes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Size</h3>
          {filterOptions.sizes.map((size) => (
            <label key={size} className="block text-sm">
              <input
                type="checkbox"
                checked={(filters.size as string[]).includes(size)}
                onChange={() => toggleFilter("size", size)}
                className="mr-2"
              />
              {size}
            </label>
          ))}
        </div>
      )}

      {/* BRAND */}
      {filterOptions.brands.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Brand</h3>
          {filterOptions.brands.slice(0, 8).map((b) => (
            <label key={b} className="block text-sm">
              <input
                type="checkbox"
                checked={(filters.brand as string[]).includes(b)}
                onChange={() => toggleFilter("brand", b)}
                className="mr-2"
              />
              {b}
            </label>
          ))}
          {filterOptions.brands.length > 8 && (
            <p className="text-xs text-gray-500 mt-2">+{filterOptions.brands.length - 8} more</p>
          )}
        </div>
      )}

      {/* PRICE RANGE */}
      <div>
        <h3 className="font-semibold mb-2">Price Range</h3>
        <input
          type="range"
          min={filterOptions.priceRange.min}
          max={filterOptions.priceRange.max}
          value={(filters.maxPrice as number) || filterOptions.priceRange.max}
          onChange={(e) =>
            dispatch(setFilters({ maxPrice: Number(e.target.value) }))
          }
          className="w-full"
        />
        <p className="text-sm">
          ₹{filterOptions.priceRange.min} - ₹{(filters.maxPrice as number) || filterOptions.priceRange.max}
        </p>
      </div>
    </aside>
  );
};

export default FilterSidebar;
