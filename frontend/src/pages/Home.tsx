import React, { useEffect, useState } from 'react'
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
import axios from 'axios'


const Home = () => {
  const dispatch = useDispatch();
  const [ bestSeller, setBestSeller ] =useState();

  const {products, loading, error} = useSelector((state) => state.products);

  useEffect(()=>{
    const filters = {
      category: "Women Top Wear",
      sort: "newest",
      limit: 8,
    }

    dispatch(setFilters(filters));
    dispatch(fetchProductsByFilters(filters));

    const fetchBestSeller = async() => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`);
        setBestSeller(response.data?.bestSeller);
        // console.log("BestSeller id: ",response.data?.bestSeller._id)
      } catch (error) {
        console.log(error);
      }
    }

    fetchBestSeller();
  }, [dispatch]);

  return (
    <div>
        <Hero/>
        <GenderCollectionSection/>
        <NewArrivals/>

        {/* Best Seller */}
        <h2 className='text-4xl text-center font-bold mb-4 mt-16'>Best Seller</h2>
        { bestSeller ? <ProductDetails productId = {bestSeller._id}/> : 
          <h2>Loading best seller product</h2>
        }

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
