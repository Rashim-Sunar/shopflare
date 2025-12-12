import React from 'react'
import Hero from '../components/Layout/Hero'
import GenderCollectionSection from '../components/Products/GenderCollectionSection'
import NewArrivals from '../components/Products/NewArrivals'
import ProductDetails from '../components/Products/ProductDetails'
import ProductGrid from '../components/Products/ProductGrid'
import FeatureCollection from '../components/Products/FeatureCollection'
import FeatureSection from '../components/Products/FeatureSection'

    const placeholderProducts = [
      {_id: 1, name: "Product 1",price:100, image: [{ url: "https://picsum.photos/600/750?random=1"}]},
      {_id: 2, name: "Product 2",price:100, image: [{ url: "https://picsum.photos/600/750?random=2"}]},
      {_id: 3, name: "Product 3",price:100, image: [{ url: "https://picsum.photos/600/750?random=3"}]},
      {_id: 4, name: "Product 4",price:100, image: [{ url: "https://picsum.photos/600/750?random=4"}]},
      {_id: 5, name: "Product 5",price:100, image: [{ url: "https://picsum.photos/600/750?random=5"}]},
      {_id: 6, name: "Product 6",price:100, image: [{ url: "https://picsum.photos/600/750?random=6"}]},
      {_id: 7, name: "Product 7",price:100, image: [{ url: "https://picsum.photos/600/750?random=7"}]},
    ];

const Home = () => {
  return (
    <div>
        <Hero/>
        <GenderCollectionSection/>
        <NewArrivals/>

        {/* Best Seller */}
        <h2 className='text-4xl text-center font-bold mb-4 mt-16'>Best Seller</h2>
        <ProductDetails/>

        {/* Top Wear for Women */}
        <div className='w-full mx-auto px-8 mt-8'>
          <h2 className='text-center text-3xl font-bold'>Top Wear for Women</h2>
          <ProductGrid products={placeholderProducts}/>
        </div>

        <FeatureCollection/>
        <FeatureSection/>
    </div>
  )
}

export default Home
