import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const { wishlistItems, clearWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <Heart className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-foreground">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Save items you love here and view them anytime. Start browsing to add items.
        </p>
        <Button size="lg" asChild className="rounded-full">
          <Link to="/products">Explore Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-screen-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary fill-primary/20" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground mt-2">
            You have {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist.
          </p>
        </div>
        <Button variant="outline" onClick={clearWishlist} className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
          Clear Wishlist
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product, index) => (
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
    </div>
  );
}
