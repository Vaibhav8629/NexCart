import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, ChevronDown, Check } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

export default function ProductListingPage() {
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category');
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery || 'All');

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Accessories'];

  useEffect(() => {
    if (products) {
      let result = [...products];
      
      if (selectedCategory !== 'All') {
        result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
      
      switch(sortBy) {
        case 'price-low':
          result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
          break;
        case 'price-high':
          result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default: // popular (just relying on default order or you could add a rating sort)
          break;
      }
      
      setFilteredProducts(result);
    }
  }, [products, selectedCategory, sortBy]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-r-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-primary" />
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-primary/20 text-primary font-medium' 
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Price Range</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border bg-transparent text-primary focus:ring-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm">Under $50</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border bg-transparent text-primary focus:ring-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm">$50 to $100</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border bg-transparent text-primary focus:ring-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm">$100 to $500</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border bg-transparent text-primary focus:ring-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm">Over $500</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h1>
              <p className="text-muted-foreground mt-1">Showing {filteredProducts.length} results</p>
            </div>
            
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="bg-card text-foreground border-border/50 shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Sort By: {sortBy === 'popular' ? 'Popular' : sortBy === 'newest' ? 'Newest' : sortBy === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              
              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border/50 rounded-lg shadow-xl z-10 overflow-hidden">
                  <div className="py-1">
                    {[
                      { id: 'popular', label: 'Popular' },
                      { id: 'newest', label: 'Newest Arrivals' },
                      { id: 'price-low', label: 'Price: Low to High' },
                      { id: 'price-high', label: 'Price: High to Low' }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => { setSortBy(option.id); setIsSortOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex justify-between items-center"
                      >
                        {option.label}
                        {sortBy === option.id && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-card/30 rounded-2xl border border-border/30 border-dashed">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or category selection.</p>
              <Button variant="outline" className="mt-6" onClick={() => handleCategorySelect('All')}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
