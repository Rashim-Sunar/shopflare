import React, { useEffect } from 'react'
import Hero from '../components/Layout/Hero'
import GenderCollectionSection from '../components/Products/GenderCollectionSection'
import NewArrivals from '../components/Products/NewArrivals'
import ProductDetails from '../components/Products/ProductDetails'
import ProductGrid from '../components/Products/ProductGrid'
import FeatureCollection from '../components/Products/FeatureCollection'
import FeatureSection from '../components/Products/FeatureSection'
import { useDispatch, useSelector } from 'react-redux'
import TopWearWomenSection from '../components/Products/TopWearWomenSection'

import {
  fetchProductsByFilters,
  setFilters
} from "../redux/slices/productSlice";


const Home = () => {
  const dispatch = useDispatch();

  const {products, loading, error} = useSelector((state) => state.products);

  useEffect(()=>{
    const filters = {
      category: "Women Top Wear",
      sort: "newest",
      limit: 8,
    }

    dispatch(setFilters(filters));
    dispatch(fetchProductsByFilters(filters));
  }, [dispatch]);

  return (
    <div>
        <Hero/>
        <GenderCollectionSection/>
        <NewArrivals/>

        {/* Best Seller */}
        <h2 className='text-4xl text-center font-bold mb-4 mt-16'>Best Seller</h2>
        <ProductDetails/>

        {/* Top Wear for Women */}
        <TopWearWomenSection
          products={products}
          loading={loading.list}
          error={error}
        />

        <FeatureCollection/>
        <FeatureSection/>
    </div>
  )
}

export default Home
