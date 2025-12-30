import React from "react";
import ProductGrid from "./ProductGrid";

const TopWearWomenSection = ({ products, loading, error }) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 mt-16">
      <h2 className="text-center text-3xl font-bold mb-8">
        Top Wear for Women
      </h2>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500">
          Loading products...
        </p>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="text-center text-red-500">
          {error}
        </p>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <p className="text-center text-gray-500">
          No products found.
        </p>
      )}

      {/* Data */}
      {!loading && !error && products.length > 0 && (
        <ProductGrid products={products} />
      )}
    </section>
  );
};

export default TopWearWomenSection;
