/**
 * @fileoverview Clothing structure defines male, female, and ethnic subcategories.
 *
 * This centralized configuration ensures consistent categorization across:
 * - Scraper mapping
 * - Data validation
 * - Frontend filter population
 * - AI model understanding
 *
 * Structure:
 * - gender → subCategories
 * - subCategories → array of valid product types
 * - types → styles applicable across both genders
 */

export const CLOTHING_TYPES = ['Casual', 'Formal', 'Ethnic', 'Partywear', 'Sportswear'] as const;

export const SUBCATEGORIES_BY_GENDER = {
  Men: [
    'Shirts',
    'T-Shirts',
    'Jeans',
    'Trousers',
    'Jackets',
    'Hoodies',
    'Kurtas', // Ethnic wear
    'Sherwanis', // Ethnic formal wear
    'Sportswear',
  ],
  Women: [
    'Dresses',
    'Tops',
    'Jeans',
    'Skirts',
    'Jackets',
    'Sarees', // Ethnic wear
    'Kurtis', // Ethnic wear (Indian/South Asian)
    'Leggings',
    'Ethnic Sets',
    'Activewear',
  ],
} as const;

export type Gender = keyof typeof SUBCATEGORIES_BY_GENDER;
export type ClothingType = (typeof CLOTHING_TYPES)[number];

/**
 * Function: getValidSubCategories
 * -----------------------------------
 * Purpose:
 *   Returns valid subcategories for a given gender to validate scraper input.
 *
 * Inputs:
 *   - gender: 'Men' or 'Women'
 *
 * Outputs:
 *   - Array of valid subcategories
 *
 * Example:
 *   getValidSubCategories('Women') → ['Dresses', 'Tops', 'Sarees', ...]
 */
export function getValidSubCategories(gender: Gender): string[] {
  return (SUBCATEGORIES_BY_GENDER[gender] || []) as unknown as string[];
}

/**
 * Function: getValidTypes
 * -----------------------------------
 * Purpose:
 *   Returns all valid type values for consistency.
 *
 * Outputs:
 *   - Array of valid types
 *
 * Example:
 *   getValidTypes() → ['Casual', 'Formal', 'Ethnic', ...]
 */
export function getValidTypes(): string[] {
  return CLOTHING_TYPES as unknown as string[];
}

/**
 * Function: isValidSubCategory
 * -----------------------------------
 * Purpose:
 *   Validates if a subCategory string is allowed for a given gender.
 *
 * Inputs:
 *   - gender: 'Men' or 'Women'
 *   - subCategory: string to validate
 *
 * Outputs:
 *   - boolean indicating validity
 */
export function isValidSubCategory(gender: Gender, subCategory: string): boolean {
  return getValidSubCategories(gender).includes(subCategory);
}

/**
 * Function: isValidType
 * -----------------------------------
 * Purpose:
 *   Validates if type is from the allowed set.
 *
 * Inputs:
 *   - type: string to validate
 *
 * Outputs:
 *   - boolean indicating validity
 */
export function isValidType(type: string): boolean {
  return getValidTypes().includes(type);
}

/**
 * Data structure for URL mapping during scraping.
 * Maps Amazon/e-commerce URLs to expected category metadata.
 *
 * Usage in scraper:
 *   const config = SCRAPER_URL_PATTERNS['mens-shirts'];
 *   // Attach config.gender, config.subCategory, config.type to all scraped products
 */
export const SCRAPER_URL_PATTERNS = {
  // Men's Western Wear
  'mens-shirts': {
    gender: 'Men' as const,
    subCategory: 'Shirts',
    type: 'Casual' as const,
    keywords: ['shirt', 'formal shirt', 'casual shirt'],
  },
  'mens-tshirts': {
    gender: 'Men' as const,
    subCategory: 'T-Shirts',
    type: 'Casual' as const,
    keywords: ['t-shirt', 'tee'],
  },
  'mens-jeans': {
    gender: 'Men' as const,
    subCategory: 'Jeans',
    type: 'Casual' as const,
    keywords: ['jeans', 'denim'],
  },
  'mens-trousers': {
    gender: 'Men' as const,
    subCategory: 'Trousers',
    type: 'Formal' as const,
    keywords: ['trousers', 'pants', 'suit'],
  },
  'mens-jackets': {
    gender: 'Men' as const,
    subCategory: 'Jackets',
    type: 'Casual' as const,
    keywords: ['jacket', 'blazer', 'hoodie'],
  },
  // Men's Ethnic Wear
  'mens-kurtas': {
    gender: 'Men' as const,
    subCategory: 'Kurtas',
    type: 'Ethnic' as const,
    keywords: ['kurta', 'indian', 'ethnic'],
  },
  'mens-sherwanis': {
    gender: 'Men' as const,
    subCategory: 'Sherwanis',
    type: 'Ethnic' as const,
    keywords: ['sherwani', 'wedding', 'formal ethnic'],
  },

  // Women's Western Wear
  'womens-dresses': {
    gender: 'Women' as const,
    subCategory: 'Dresses',
    type: 'Casual' as const,
    keywords: ['dress', 'casual dress'],
  },
  'womens-tops': {
    gender: 'Women' as const,
    subCategory: 'Tops',
    type: 'Casual' as const,
    keywords: ['top', 'blouse', 'shirt'],
  },
  'womens-jeans': {
    gender: 'Women' as const,
    subCategory: 'Jeans',
    type: 'Casual' as const,
    keywords: ['jeans', 'denim', 'pants'],
  },
  'womens-skirts': {
    gender: 'Women' as const,
    subCategory: 'Skirts',
    type: 'Casual' as const,
    keywords: ['skirt', 'mini skirt'],
  },
  // Women's Ethnic Wear (IMPORTANT)
  'womens-sarees': {
    gender: 'Women' as const,
    subCategory: 'Sarees',
    type: 'Ethnic' as const,
    keywords: ['saree', 'sari', 'silk saree'],
  },
  'womens-kurtis': {
    gender: 'Women' as const,
    subCategory: 'Kurtis',
    type: 'Ethnic' as const,
    keywords: ['kurti', 'kurta', 'ethnic top'],
  },
  'womens-ethnic-sets': {
    gender: 'Women' as const,
    subCategory: 'Ethnic Sets',
    type: 'Ethnic' as const,
    keywords: ['ethnic set', 'lehenga', 'suit set'],
  },
} as const;
