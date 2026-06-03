import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { motion } from 'framer-motion';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const shipping = cartTotal > 0 ? 15.00 : 0;
  const tax = cartTotal * 0.08;
  const finalTotal = cartTotal + shipping + tax;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <ShoppingBag className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-foreground">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our premium collection.
        </p>
        <Button size="lg" asChild className="rounded-full">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-screen-xl">
      <h1 className="text-4xl font-bold mb-10 text-foreground">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item, index) => (
            <motion.div 
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="sm:w-48 bg-muted/30 p-4 flex items-center justify-center">
                    <img 
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'} 
                      alt={item.name} 
                      className="h-32 w-32 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-primary mb-1">{item.category}</p>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{item.name}</h3>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(item.discountPrice || item.price)}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6">
                      <div className="flex items-center border border-border rounded-full bg-background">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Total: <span className="font-semibold text-foreground">{formatCurrency((item.discountPrice || item.price) * item.quantity)}</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div>
          <Card className="sticky top-24 bg-card/80 backdrop-blur-xl border-border/50 shadow-glow">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="text-foreground font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground font-medium">{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax</span>
                  <span className="text-foreground font-medium">{formatCurrency(tax)}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full text-base font-bold rounded-xl py-6 bg-primary hover:bg-secondary text-primary-foreground shadow-lg hover:shadow-primary/25"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <div className="mt-6 text-center">
                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  or Continue Shopping
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
