import { useNavigate } from 'react-router-dom';
import {
ShoppingCart,
Heart,
Star,
ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value) =>
new Intl.NumberFormat('en-IN', {
style: 'currency',
currency: 'INR',
}).format(value || 0);

export default function ProductCard({ product }) {
const navigate = useNavigate();

const { addToCart } = useCart();
const { toggleWishlist, isInWishlist } = useWishlist();
const { user } = useAuth();

const image =
product.images?.[0] ||
'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

const isLowStock = Number(product.stock) <= 5;
const isOutOfStock = Number(product.stock) <= 0;

const finalPrice = product.discountPrice || product.price;

const handleAddToCart = (e) => {
e.stopPropagation();

```
if (!user) {
  navigate('/login');
  return;
}

if (!isOutOfStock) {
  addToCart(product);
}
```

};

const handleWishlist = (e) => {
e.stopPropagation();

```
if (!user) {
  navigate('/login');
  return;
}

toggleWishlist(product);
```

};

return (
<motion.div
whileHover={{ y: -12 }}
transition={{ duration: 0.35 }}
className="group h-full"
>
<Card
onClick={() => navigate(`/product/${product._id}`)}
className="
relative
h-full
overflow-hidden
cursor-pointer
border
border-primary/10
bg-card/80
backdrop-blur-xl
transition-all
duration-500
hover:border-primary/40
hover:shadow-[0_0_40px_rgba(245,158,11,.15)]
"
>

```
    {/* GOLD GLOW */}

    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
      <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
    </div>

    {/* IMAGE SECTION */}

    <div className="relative overflow-hidden">

      <motion.img
        src={image}
        alt={product.name}
        className="h-72 w-full object-cover"
        whileHover={{ scale: 1.12 }}
        transition={{ duration: 0.6 }}
      />

      {/* OVERLAY */}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />

      {/* TOP BADGES */}

      <div className="absolute left-4 top-4 flex flex-col gap-2 z-20">

        {product.featured && (
          <Badge className="bg-primary text-black font-bold">
            Featured
          </Badge>
        )}

        {product.discountPrice > 0 && (
          <Badge variant="secondary">
            Sale
          </Badge>
        )}

        {isOutOfStock ? (
          <Badge variant="destructive">
            Out of Stock
          </Badge>
        ) : isLowStock ? (
          <Badge className="bg-orange-500 text-white">
            Low Stock
          </Badge>
        ) : null}

      </div>

      {/* WISHLIST */}

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        onClick={handleWishlist}
        className={`
          absolute
          right-4
          top-4
          z-20
          rounded-full
          p-3
          backdrop-blur-xl
          border
          transition-all
          duration-300

          ${
            isInWishlist(product._id)
              ? 'bg-red-500/20 text-red-500 border-red-500/30'
              : 'bg-black/50 text-white border-white/10 hover:text-red-500'
          }
        `}
      >
        <Heart
          className={`h-5 w-5 ${
            isInWishlist(product._id)
              ? 'fill-current'
              : ''
          }`}
        />
      </motion.button>

      {/* QUICK ACTION BAR */}

      <motion.div
        initial={{ y: 100 }}
        whileHover={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="
          absolute
          bottom-0
          left-0
          right-0
          p-4
          bg-gradient-to-t
          from-black
          to-transparent
        "
      >

        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="
            w-full
            rounded-full
            font-semibold
            shadow-[0_0_25px_rgba(245,158,11,.25)]
          "
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add To Cart
        </Button>

      </motion.div>

    </div>

    {/* CONTENT */}

    <CardContent className="p-6">

      {/* CATEGORY */}

      <div className="mb-3">

        <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold">
          {product.category}
        </span>

      </div>

      {/* NAME */}

      <h3 className="text-xl font-bold text-foreground line-clamp-1">
        {product.name}
      </h3>

      {/* RATING */}

      <div className="mt-3 flex items-center gap-2">

        <div className="flex items-center gap-1 text-primary">

          <Star className="h-4 w-4 fill-primary" />
          <span className="text-sm font-semibold">
            {product.rating}
          </span>

        </div>
      </div>

      {/* PRICE */}

      <div className="mt-5">

        <div className="flex items-center gap-3">

          <span className="text-2xl font-black text-white">
            {formatCurrency(finalPrice)}
          </span>

          {product.discountPrice > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          )}

        </div>

        {product.discountPrice > 0 && (
          <p className="mt-1 text-xs text-primary font-semibold">
            Save {formatCurrency(product.price - product.discountPrice)}
          </p>
        )}

      </div>

      {/* FOOTER */}

      <div className="mt-6 pt-5 border-t border-border/50 flex items-center justify-between">

        <span
          className={`
            text-xs
            font-medium

            ${
              isOutOfStock
                ? 'text-red-500'
                : 'text-green-500'
            }
          `}
        >
          {isOutOfStock
            ? 'Unavailable'
            : `${product.stock || 10}+ Available`}
        </span>

        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center gap-2 text-primary font-semibold text-sm"
        >
          View
          <ArrowRight className="h-4 w-4" />
        </motion.div>

      </div>

    </CardContent>

  </Card>
</motion.div>


);
}
          
