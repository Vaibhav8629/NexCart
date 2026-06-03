import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, ShieldCheck, ArrowRight, Share2, Info } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, fetchSingleProduct, products, loading } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchSingleProduct(id);
    window.scrollTo(0, 0);
  }, [fetchSingleProduct, id]);

  if (loading || !currentProduct || currentProduct._id !== id) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-r-transparent animate-spin"></div>
      </div>
    );
  }

  const images = currentProduct.images?.length 
    ? currentProduct.images 
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'];
    
  const isOutOfStock = Number(currentProduct.stock) <= 0;
  const relatedProducts = products?.filter(p => p.category === currentProduct.category && p._id !== currentProduct._id).slice(0, 4) || [];

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(currentProduct, quantity);
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(currentProduct, quantity);
    navigate('/cart');
  };

  const handleWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(currentProduct);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-screen-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* Left: Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted/20 border border-border/50">
            <img 
              src={images[activeImage]} 
              alt={currentProduct.name} 
              className="w-full h-full object-cover"
            />
            {currentProduct.discountPrice > 0 && (
              <Badge variant="secondary" className="absolute top-6 left-6 text-sm px-3 py-1">
                Sale
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === idx ? 'border-primary' : 'border-transparent hover:border-primary/50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
              {currentProduct.category}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {currentProduct.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-secondary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-5 w-5 ${star <= Math.round(currentProduct.rating || 4.5) ? 'fill-current' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">
                ({currentProduct.numReviews || 0} reviews)
              </span>
              <span className="text-muted-foreground text-sm">|</span>
              <span className={`text-sm font-medium ${isOutOfStock ? 'text-destructive' : 'text-success'}`}>
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
            </div>
            
            <div className="flex items-end gap-4 mb-6 pb-6 border-b border-border/50">
              <span className="text-4xl font-bold text-foreground">
                {formatCurrency(currentProduct.discountPrice || currentProduct.price)}
              </span>
              {currentProduct.discountPrice > 0 && (
                <span className="text-xl text-muted-foreground line-through mb-1">
                  {formatCurrency(currentProduct.price)}
                </span>
              )}
            </div>
            
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {currentProduct.description}
            </p>
          </div>

          <div className="space-y-6 mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-full bg-background h-14">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-5 text-muted-foreground hover:text-primary transition-colors"
                  disabled={isOutOfStock}
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-foreground">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))}
                  className="px-5 text-muted-foreground hover:text-primary transition-colors"
                  disabled={isOutOfStock || quantity >= currentProduct.stock}
                >
                  +
                </button>
              </div>
              <Button 
                size="lg" 
                className="flex-1 h-14 rounded-full text-base font-bold shadow-lg hover:shadow-primary/25"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
            </div>
            
            <div className="flex gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="flex-1 h-14 rounded-full text-base font-bold text-secondary-foreground"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                Buy Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleWishlist}
                className={`h-14 w-14 rounded-full p-0 backdrop-blur transition-all ${
                  isInWishlist(currentProduct._id) 
                    ? 'border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                    : 'border-border/50 bg-background/50 text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(currentProduct._id) ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-full text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Free Delivery</p>
                <p className="text-xs text-muted-foreground">Enter postal code for Delivery Availability</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-full text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Return Delivery</p>
                <p className="text-xs text-muted-foreground">Free 30 Days Delivery Returns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-20">
        <div className="flex space-x-8 border-b border-border/50 mb-8">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-lg font-semibold capitalize transition-all relative ${
                activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
        
        <div className="min-h-[200px] text-muted-foreground">
          {activeTab === 'description' && (
            <div className="space-y-4 max-w-4xl">
              <p>{currentProduct.description}</p>
              <p>Experience the perfect blend of style and performance with the {currentProduct.name}. Designed for the modern consumer, this premium product delivers exceptional quality that you can feel in every detail. Built with high-grade materials and cutting-edge technology, it represents the pinnacle of luxury commerce.</p>
            </div>
          )}
          {activeTab === 'specifications' && (
            <div className="max-w-2xl">
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-4 font-medium text-foreground">Brand</td>
                    <td className="py-4">{currentProduct.brand || 'NexCart Exclusive'}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 font-medium text-foreground">Category</td>
                    <td className="py-4">{currentProduct.category}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 font-medium text-foreground">Stock Status</td>
                    <td className="py-4">{currentProduct.stock} units available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="flex flex-col items-center justify-center py-10 bg-muted/20 rounded-2xl border border-border/50">
              <Star className="h-12 w-12 text-primary/30 mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No Reviews Yet</p>
              <p className="text-sm">Be the first to review this premium product.</p>
              <Button variant="outline" className="mt-4">Write a Review</Button>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-24">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-foreground">Related Products</h2>
            <Button variant="link" className="text-primary hover:text-secondary p-0">
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}