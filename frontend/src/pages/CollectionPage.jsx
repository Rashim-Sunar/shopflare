import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";
import SortOptions from "./SortOptions";
import ProductGrid from "../components/Products/ProductGrid";

import {
  fetchProductsByFilters,
  setFilters,
  clearFilters
} from "../redux/slices/productSlice";
import { useDispatch, useSelector } from "react-redux";

const CollectionPage = () => {
  const dispatch = useDispatch();
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  /* ================== REDUX STATE ================== */
  const { products, filters } = useSelector((state) => state.products);
  const location = useLocation();

  /* ================== FETCH PRODUCTS ================== */
  useEffect(() => {
    dispatch(fetchProductsByFilters(filters));
  }, [dispatch, filters]);

  // 🔥 SYNC FILTERS → URL PARAMS
  useEffect(() => {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params[key] = value.join(",");
      } else if (!Array.isArray(value) && value !== "" && value !== null) {
        params[key] = value;
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

    useEffect(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
        duration: 900
      });
    }, [location.pathname]);
  
  return (
    <div className="w-full mx-auto px-8 py-10">
      {/* MOBILE BAR */}
      <div className="flex justify-between items-center mb-6 lg:hidden">
        <button
          onClick={() => setShowFilters(true)}
          className="border px-4 py-2 rounded-md text-sm"
        >
          ☰ Filters
        </button>
        <SortOptions
          filters={filters}
          setFilters={(data) => dispatch(setFilters(data))}
        />

      </div>

      <div className="flex gap-8">
        {/* FIXED SIDEBAR */}
        <div className="hidden lg:block w-[11%] shrink-0">
            <FilterSidebar/>
        </div>
        {/* PRODUCTS */}
        <div className="flex-1">
            <h2 className="text-3xl font-semibold text-slate-900">All Collections</h2>
            <div className="hidden lg:flex justify-end mb-6">
                <SortOptions
                  filters={filters}
                  setFilters={(data) => dispatch(setFilters(data))}
                />
            </div>
            <ProductGrid products={products} />
        </div>
       </div>

      {/* MOBILE FILTER DRAWER */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute left-0 top-0 h-full w-[80%] bg-white p-5 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>✕</button>
            </div>
            <FilterSidebar/>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
