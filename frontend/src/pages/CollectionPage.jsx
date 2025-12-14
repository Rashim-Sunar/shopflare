import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";
import SortOptions from "./SortOptions";
import ProductGrid from "../components/Products/ProductGrid";

const CollectionPage = () => {
  const [products, setProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    category: [],
    gender: [],
    color: [],
    size: [],
    material: [],
    brand: [],
    sort: "",
    minPrice: 0,
    maxPrice: 100,
  });

  // Mock fetch
  useEffect(() => {
    setTimeout(() => {
      setProducts([
        {_id: 1, name: "Product 1", price: 100, image: [{ url: "https://picsum.photos/600/750?random=1" }]},
        {_id: 2, name: "Product 2", price: 120, image: [{ url: "https://picsum.photos/600/750?random=2" }]},
        {_id: 3, name: "Product 3", price: 80, image: [{ url: "https://picsum.photos/600/750?random=3" }]},
        {_id: 4, name: "Product 4", price: 150, image: [{ url: "https://picsum.photos/600/750?random=4" }]},
        {_id: 5, name: "Product 5", price: 90, image: [{ url: "https://picsum.photos/600/750?random=5" }]},
        {_id: 6, name: "Product 6", price: 100, image: [{ url: "https://picsum.photos/600/750?random=6" }]},
        {_id: 7, name: "Product 7", price: 120, image: [{ url: "https://picsum.photos/600/750?random=7" }]},
        {_id: 8, name: "Product 8", price: 80, image: [{ url: "https://picsum.photos/600/750?random=8" }]},
        {_id: 9, name: "Product 9", price: 150, image: [{ url: "https://picsum.photos/600/750?random=9" }]},
        {_id: 10, name: "Product 10", price: 90, image: [{ url: "https://picsum.photos/600/750?random=10" }]},
      ]);
    }, 800);
  }, []);

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
        <SortOptions filters={filters} setFilters={setFilters} />
      </div>

      <div className="flex gap-8">
        {/* FIXED SIDEBAR */}
        <div className="hidden lg:block w-[11%] shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
        </div>
        {/* PRODUCTS */}
        <div className="flex-1">
            <h2 className="text-3xl font-semibold text-slate-900">All Collections</h2>
            <div className="hidden lg:flex justify-end mb-6">
                <SortOptions filters={filters} setFilters={setFilters} />
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
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
