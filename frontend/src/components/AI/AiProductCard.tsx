import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Interface: AiProductCardProps
 * -----------------------------------
 * Purpose:
 *   Type definition for the AI Product Card component props.
 *
 * Fields:
 *   - id (string): MongoDB product ID for navigation and cart operations.
 *   - name (string): Product display name.
 *   - price (number): Product price in currency units.
 *   - brand (string | null): Brand name or null if not available.
 *   - category (string): Category classification (e.g., "Top Wear", "Bottom Wear").
 *   - countInStock (number): Available inventory count.
 */
interface AiProductCardProps {
  id: string;
  name: string;
  price: number;
  brand: string | null;
  category: string;
  countInStock: number;
  image?: string;
  onViewProduct?: () => void;
}

/**
 * Component: AiProductCard
 * -----------------------------------
 * Purpose:
 *   Displays a single product card in the AI assistant response.
 *   Allows users to:
 *     1. View product details inline.
 *     2. Click to navigate to the full product page.
 *     3. Add product directly to cart.
 */
const AiProductCard: React.FC<AiProductCardProps> = ({
  id,
  name,
  price,
  brand,
  category,
  countInStock,
  image,
  onViewProduct,
}) => {
  const navigate = useNavigate();
  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${id}`);
    onViewProduct?.();
  };

  // Determine stock status for display
  const isInStock = countInStock > 0;
  const stockText = isInStock ? `${countInStock} in stock` : 'Out of stock';

  return (
    <div className='flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md' role='article' aria-label={`Product: ${name}`}>
      {/* Product Image / Placeholder */}
      <div className='relative h-32 w-full bg-gray-100 flex items-center justify-center overflow-hidden'>
        {image ? (
          <img src={image} alt={name} className='object-cover w-full h-full' />
        ) : (
          <div className='text-gray-400 text-center'>
            <div className='text-3xl mb-2'>📦</div>
            <div className='text-xs'>{category}</div>
          </div>
        )}
        {/* Stock Status Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
            isInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {isInStock ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>

      {/* Product Details */}
      <div className='flex flex-col flex-1 p-4'>
        {/* Brand & Name */}
        <div className='mb-2'>
          {brand && <p className='text-xs text-gray-500 uppercase tracking-wider'>{brand}</p>}
          <h3 className='text-sm font-semibold text-gray-900 line-clamp-2 hover:text-blue-600'>
            {name}
          </h3>
        </div>

        {/* Category & Stock Info */}
        <div className='mb-3 flex-1'>
          <p className='text-xs text-gray-600 mb-1'>Category: {category}</p>
          <p className={`text-xs font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
            {stockText}
          </p>
        </div>

        {/* Price */}
        <div className='mb-3'>
          <p className='text-lg font-bold text-gray-900'>₹{price}</p>
        </div>

        {/* View Product Button */}
        <button
          type='button'
          onClick={handleViewProduct}
          aria-label={`View ${name}`}
          className='w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800'
        >
          View Product
        </button>
      </div>
    </div>
  );
};

export default AiProductCard;
