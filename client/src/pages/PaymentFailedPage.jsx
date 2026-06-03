import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { XCircle, RotateCcw, ShoppingCart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

export default function PaymentFailedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reason, orderId, totalAmount } = location.state || {};

  return (
    <div className="container mx-auto px-4 py-16 max-w-screen-sm">
      <div className="flex flex-col items-center text-center">
        {/* Failure Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
          <div className="relative p-6 rounded-full bg-red-500/15 border border-red-500/30">
            <XCircle className="h-20 w-20 text-red-400" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 mb-8"
        >
          <h1 className="text-4xl font-extrabold text-foreground">
            Payment <span className="text-red-400">Failed</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            We couldn't process your payment. Your order has not been placed.
          </p>
        </motion.div>

        {/* Error Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full mb-8"
        >
          <Card className="bg-card/80 backdrop-blur border-red-500/20">
            <CardContent className="p-6 space-y-4">
              {reason && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
                  <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-red-400/70 mb-1">Error Details</p>
                    <p className="text-sm text-red-300">{reason}</p>
                  </div>
                </div>
              )}

              {totalAmount && (
                <div className="flex justify-between items-center py-2 border-t border-border/40">
                  <span className="text-sm text-muted-foreground">Amount attempted</span>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
                </div>
              )}

              <div className="text-left space-y-2">
                <p className="text-sm font-medium text-foreground">Common reasons for payment failure:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Insufficient funds in the account</li>
                  <li>Card declined by the bank</li>
                  <li>Incorrect card details entered</li>
                  <li>Card not enabled for online transactions</li>
                  <li>Transaction limit exceeded</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full flex flex-col sm:flex-row gap-4"
        >
          <Button
            size="lg"
            className="flex-1 rounded-xl font-bold bg-primary hover:bg-[#FFB833] text-black"
            onClick={() => navigate('/checkout')}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 rounded-xl font-bold border-border/50 hover:border-primary/50"
            asChild
          >
            <Link to="/cart">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Back to Cart
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-xs text-muted-foreground"
        >
          No amount has been charged. You can safely retry your payment.
        </motion.p>
      </div>
    </div>
  );
}
