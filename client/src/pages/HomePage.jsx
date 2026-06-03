import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Zap, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';

export default function HomePage() {
  const { products, fetchProducts, loading } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const featuredProducts = products?.filter(p => p.featured) || products?.slice(0, 4) || [];
  const trendingProducts = products?.slice(0, 8) || [];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden luxury-gradient">
        <div className="absolute inset-0 bg-background/40 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        
        <div className="container relative z-10 px-4 py-20 mx-auto max-w-screen-2xl flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 max-w-4xl"
          >
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold tracking-widest uppercase">
              Premium Shopping Experience
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight">
              Discover Products <br className="hidden md:block" />
              <span className="text-gradient">You'll Love</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Elevate your lifestyle with our curated collection of premium electronics, fashion, and accessories. Experience commerce reimagined.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-bold shadow-glow hover:scale-105 transition-transform" asChild>
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-bold border-border/50 bg-background/50 backdrop-blur hover:bg-muted hover:text-foreground hover:scale-105 transition-transform" asChild>
                <Link to="/products?category=Fashion">
                  Explore Fashion
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-y border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Free Global Shipping</h3>
              <p className="text-muted-foreground text-sm">On all orders over ₹150.00</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Secure Payments</h3>
              <p className="text-muted-foreground text-sm">100% secure payment processing</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Premium Quality</h3>
              <p className="text-muted-foreground text-sm">Authentic products guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-screen-2xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Curated Categories</h2>
              <p className="text-muted-foreground mt-2">Find exactly what you're looking for</p>
            </div>
            <Link to="/products" className="hidden md:flex text-primary font-semibold hover:text-secondary items-center transition-colors">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800' },
              { name: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800' },
              { name: 'Accessories', img: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=800' },
              { name: 'Home', img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800' }
            ].map((cat, i) => (
              <motion.div 
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/products?category=${cat.name}`} className="group relative h-[300px] rounded-3xl overflow-hidden block">
                  <div className="absolute inset-0 bg-background/20 group-hover:bg-background/10 transition-colors z-10"></div>
                  <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-20"></div>
                  <div className="absolute bottom-6 left-6 right-6 z-30">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-white/80 text-sm font-medium flex items-center">
                      Explore Collection <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-muted/10 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-screen-2xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Featured Selection</h2>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-r-transparent animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link to="/products">View Full Catalog</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}