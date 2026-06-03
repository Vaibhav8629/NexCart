import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, ChevronRight } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

export default function OrdersPage() {
  const { orders } = useOrder();

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Processing': return <Clock className="h-4 w-4 mr-1" />;
      case 'Shipped': return <Truck className="h-4 w-4 mr-1" />;
      case 'Delivered': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      default: return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return 'warning';
      case 'Shipped': return 'info';
      case 'Delivered': return 'success';
      default: return 'default';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <Package className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-foreground">No orders yet</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          When you place an order, it will appear here. Start browsing our premium collection.
        </p>
        <Button size="lg" asChild className="rounded-full">
          <Link to="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-screen-lg">
      <h1 className="text-4xl font-bold mb-10 text-foreground">Order History</h1>
      
      <div className="space-y-6">
        {orders.map((order, index) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur">
              <div className="bg-muted/30 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center border-b border-border/50 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order Placed</p>
                  <p className="font-medium text-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="font-medium text-foreground">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                  <p className="font-mono text-sm font-medium text-foreground">{order._id}</p>
                </div>
                <div className="sm:text-right">
                  <Badge variant={getStatusColor(order.status)} className="px-3 py-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-6">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-6 items-center">
                      <img 
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'} 
                        alt={item.name} 
                        className="w-24 h-24 object-cover rounded-xl bg-muted/20"
                      />
                      <div className="flex-1">
                        <Link to={`/product/${item._id}`} className="text-lg font-semibold hover:text-primary transition-colors text-foreground line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">Category: {item.category}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="font-medium text-foreground">{formatCurrency(item.discountPrice || item.price)}</span>
                          <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/product/${item._id}`}>
                            View <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
