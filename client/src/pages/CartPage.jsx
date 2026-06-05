import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value || 0);

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 100, damping: 18 },
  },
};

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const shipping = cartTotal > 0 ? 15.0 : 0;
  const tax = cartTotal * 0.08;
  const finalTotal = cartTotal + shipping + tax;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="relative bg-primary/10 p-7 rounded-full">
            <ShoppingBag className="h-16 w-16 text-primary" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-3 text-foreground">
          Your cart is empty
        </h2>

        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Explore premium products and add items to your cart for a seamless checkout experience.
        </p>

        <Button size="lg" asChild className="rounded-full px-8">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Premium Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Your Cart
            </h1>
            <p className="text-sm text-muted-foreground">
              {cartItems.length} item(s) in your selection
            </p>
          </div>

          <Link
            to="/products"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 py-10 max-w-screen-xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  layout
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="overflow-hidden bg-card/40 backdrop-blur-xl border border-border/40 hover:border-primary/30 transition-all shadow-sm hover:shadow-lg">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="sm:w-56 p-5 flex items-center justify-center bg-gradient-to-br from-muted/40 to-background">
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          src={
                            item.images?.[0] ||
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={item.name}
                          className="h-36 w-36 object-cover rounded-2xl shadow-md"
                        />
                      </div>

                      {/* Details */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-primary/80 mb-1">
                              {item.category}
                            </p>

                            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>

                            <p className="text-2xl font-bold text-foreground">
                              {formatCurrency(
                                item.discountPrice || item.price
                              )}
                            </p>
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item._id)}
                            className="h-10 w-10 flex items-center justify-center rounded-full border border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        </div>

                        {/* Bottom row */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                          {/* Quantity Control */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-full border border-border/50 bg-background/60 overflow-hidden">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  updateQuantity(item._id, item.quantity - 1)
                                }
                                className="px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </motion.button>

                              <span className="w-10 text-center font-medium text-foreground">
                                {item.quantity}
                              </span>

                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  updateQuantity(item._id, item.quantity + 1)
                                }
                                className="px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Item total:{' '}
                            <span className="font-semibold text-foreground">
                              {formatCurrency(
                                (item.discountPrice || item.price) *
                                  item.quantity
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* RIGHT: FLOATING SUMMARY */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate="show"
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <Card className="bg-card/60 backdrop-blur-2xl border border-border/40 shadow-xl hover:shadow-primary/10 transition-all">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6 text-foreground">
                    Order Summary
                  </h3>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(shipping)}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(tax)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border/40 my-6" />

                  <div className="flex justify-between items-center mb-8">
                    <span className="text-lg font-semibold text-foreground">
                      Total
                    </span>
                    <motion.span
                      key={finalTotal}
                      initial={{ scale: 0.95, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-primary"
                    >
                      {formatCurrency(finalTotal)}
                    </motion.span>
                  </div>

                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="w-full rounded-xl py-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>

                  <div className="mt-6 text-center">
                    <Link
                      to="/products"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Continue shopping instead
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}