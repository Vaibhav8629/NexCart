import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Package, Heart, LogOut, Settings, Shield, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { motion } from 'framer-motion';
import {Badge} from '../components/ui/badge';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { orders } = useOrder();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    { title: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Items in Cart', value: cartItems.length, icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Wishlist Items', value: 0, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-screen-xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="md:w-1/3 lg:w-1/4">
          <Card className="border-border/50 bg-card/80 backdrop-blur sticky top-24">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-border/50">
                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground flex items-center justify-center mt-1">
                  <Mail className="h-4 w-4 mr-1" /> {user.email}
                </p>
                <div className="mt-4 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-semibold flex items-center">
                  <Shield className="h-3 w-3 mr-1" /> {user.role === 'admin' ? 'Administrator' : 'Premium Member'}
                </div>
              </div>
              
              <div className="py-4 flex flex-col gap-2">
                <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-3" /> Personal Information
                </Button>
                <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate('/orders')}>
                  <Package className="h-4 w-4 mr-3" /> Order History
                </Button>
                <Button variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
                  <Settings className="h-4 w-4 mr-3" /> Account Settings
                </Button>
                <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-4" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-3" /> Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:w-2/3 lg:w-3/4 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-border/50 bg-card/80 backdrop-blur">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <h4 className="text-2xl font-bold text-foreground">{stat.value}</h4>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="p-3 bg-muted/50 rounded-md border border-border text-foreground">
                    {user.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <div className="p-3 bg-muted/50 rounded-md border border-border text-foreground flex items-center justify-between">
                    {user.email}
                    <Badge variant="success" className="text-[10px]">Verified</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <div className="p-3 bg-muted/50 rounded-md border border-border text-muted-foreground italic">
                    Not provided yet
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Default Shipping Address</label>
                  <div className="p-3 bg-muted/50 rounded-md border border-border text-muted-foreground italic">
                    Not provided yet
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
