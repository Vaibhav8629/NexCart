import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gradient">NexCart</h3>
            <p className="text-sm text-muted-foreground">
              Your premium destination for luxury commerce. Discover products you'll love with an unparalleled shopping experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=Accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Order History</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns & Refunds</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NexCart. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
