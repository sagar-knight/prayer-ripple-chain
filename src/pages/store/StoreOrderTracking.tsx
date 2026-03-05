import { useState } from "react";
import StoreLayout from "@/components/store/StoreLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search } from "lucide-react";
import { toast } from "sonner";

const StoreOrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Since orders are managed by Shopify, direct users there
    toast.info("Order tracking is available through your Shopify confirmation email.", {
      description: "Check your email for tracking details from your order confirmation.",
      duration: 5000,
    });
  };

  return (
    <StoreLayout>
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-16 text-center">
        <Package className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
        <p className="text-muted-foreground mb-8">Enter your order details below to check the status of your shipment.</p>

        <form onSubmit={handleTrack} className="space-y-4 text-left">
          <div>
            <label className="text-sm font-medium mb-1 block">Order Number</label>
            <Input
              placeholder="e.g. #PF-1234"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email Address</label>
            <Input
              type="email"
              placeholder="Email used at checkout"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2">
            <Search className="h-4 w-4" /> Track Order
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-6">
          You can also find tracking information in the confirmation email sent after your order was shipped.
        </p>
      </div>
    </StoreLayout>
  );
};

export default StoreOrderTracking;
