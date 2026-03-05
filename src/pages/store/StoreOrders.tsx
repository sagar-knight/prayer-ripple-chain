import StoreLayout from "@/components/store/StoreLayout";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const StoreOrders = () => (
  <StoreLayout>
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 text-center">
      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-6">
        Your orders are managed through Shopify checkout. Check your email for order confirmations, tracking numbers, and receipts.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/store/order-tracking">
          <Button variant="outline">Track an Order</Button>
        </Link>
        <Link to="/store">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  </StoreLayout>
);

export default StoreOrders;
