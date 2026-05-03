import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className='group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_30px_-8px_rgba(79,70,229,0.2)]'
      role='article'
      aria-label={`Product: ${name}`}
    >
      {/* ─── Product Image / Placeholder ─── */}
      <div className='relative h-32 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100'>
        {image ? (
          <img
            src={image}
            alt={name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full flex-col items-center justify-center text-gray-300'>
            <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
            </svg>
            <span className='mt-1 text-[10px] font-medium text-gray-400'>{category}</span>
          </div>
        )}

        {/* Brand pill on image */}
        {brand && (
          <span className='absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-md'>
            {brand}
          </span>
        )}

        {/* Stock Status Badge */}
        <span
          className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
            isInStock
              ? 'bg-emerald-500/15 text-emerald-700'
              : 'bg-red-500/15 text-red-700'
          }`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${isInStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {isInStock ? 'In Stock' : 'Sold Out'}
        </span>

        {/* Gradient overlay at bottom */}
        <div className='absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/60 to-transparent' />
      </div>

      {/* ─── Product Details ─── */}
      <div className='flex flex-1 flex-col p-3.5'>
        {/* Name */}
        <h3 className='text-[13px] font-semibold leading-tight text-gray-900 line-clamp-2'>
          {name}
        </h3>

        {/* Category */}
        <p className='mt-1 text-[10px] font-medium text-gray-400'>{category}</p>

        {/* Price */}
        <div className='mt-auto pt-2'>
          <p className='bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-lg font-extrabold text-transparent'>
            ₹{price.toLocaleString('en-IN')}
          </p>
        </div>

        {/* View Product Button */}
        <motion.button
          type='button'
          onClick={handleViewProduct}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          aria-label={`View ${name}`}
          className='mt-2.5 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-[12px] font-semibold text-white shadow-md shadow-indigo-500/20 transition-shadow hover:shadow-lg hover:shadow-indigo-500/30'
        >
          View Product
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AiProductCard;
