import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';
  const isLowStock = Number(product.stock) <= 5;
  const isOutOfStock = Number(product.stock) <= 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group overflow-hidden cursor-pointer border-border/50 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-300 bg-card" 
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <div className="relative overflow-hidden bg-muted/20">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={image} 
            alt={product.name} 
            className="h-64 w-full object-cover" 
          />
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {product.featured && <Badge variant="default">Featured</Badge>}
            {product.discountPrice > 0 && <Badge variant="secondary">Sale</Badge>}
            {isOutOfStock ? <Badge variant="destructive">Out of stock</Badge> : isLowStock ? <Badge variant="warning">Low stock</Badge> : null}
          </div>
          
          <button 
            onClick={handleWishlist}
            className={`absolute right-4 top-4 rounded-full p-2 backdrop-blur-md transition-all ${
              isInWishlist(product._id) 
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                : 'bg-background/80 text-muted-foreground hover:text-red-500 hover:bg-background'
            }`}
          >
            <Heart className={`h-5 w-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
          </button>
        </div>
        <CardContent className="space-y-3 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-primary font-medium">{product.category}</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground line-clamp-1">{product.name}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-foreground">{formatCurrency(product.discountPrice || product.price)}</span>
            {product.discountPrice > 0 && <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {isOutOfStock ? 'Unavailable' : 'In Stock'}
            </span>
            <Button 
              size="sm" 
              variant="default"
              className="rounded-full shadow-lg hover:shadow-primary/25"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}