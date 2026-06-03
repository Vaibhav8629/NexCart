import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Heart, Menu, LogOut, Settings, Package, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient">NexCart</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Categories
            </Link>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center px-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-full border border-border bg-muted/50 px-9 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/wishlist" className="hidden sm:flex text-muted-foreground hover:text-primary transition-colors">
            <Heart className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative text-muted-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden sm:block">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              >
                <User className="h-4 w-4" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-popover p-1 shadow-md">
                  <div className="px-2 py-1.5 text-sm font-semibold text-foreground border-b border-border mb-1">
                    {user.name}
                  </div>
                  <Link to="/profile" className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer" onClick={() => setIsDropdownOpen(false)}>
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer" onClick={() => setIsDropdownOpen(false)}>
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer" onClick={() => setIsDropdownOpen(false)}>
                    <Heart className="h-4 w-4" /> Wishlist
                  </Link>
                  <div className="my-1 border-t border-border"></div>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 cursor-pointer">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          <button 
            className="md:hidden text-muted-foreground hover:text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-md border border-border bg-muted/50 px-9 py-2 text-sm outline-none focus:border-primary text-foreground"
            />
          </div>
          <div className="flex flex-col space-y-3">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary">Home</Link>
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-primary">Categories</Link>
            <Link to="/wishlist" className="text-sm font-medium text-muted-foreground hover:text-primary">Wishlist</Link>
            {user ? (
              <>
                <div className="border-t border-border my-2"></div>
                <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary">Profile</Link>
                <Link to="/orders" className="text-sm font-medium text-muted-foreground hover:text-primary">My Orders</Link>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-destructive">Logout</button>
              </>
            ) : (
              <>
                <div className="border-t border-border my-2"></div>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">Login</Link>
                <Link to="/register" className="text-sm font-medium text-muted-foreground hover:text-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
