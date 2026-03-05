import StoreLayout from "@/components/store/StoreLayout";

const StoreReturns = () => (
  <StoreLayout>
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-playfair text-3xl font-bold text-foreground mb-6">Returns & Exchanges</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>We want every purchase to bring you joy. If something doesn't work out, here's how we can help.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Returns</h2>
        <p>You have 30 days from the date of delivery to return eligible items. Items must be unused, unwashed, and in original condition with all tags attached.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Exchanges</h2>
        <p>Need a different size or color? Contact us through our Contact page and we'll arrange an exchange, subject to availability.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">How to Start a Return</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Contact us with your order number and reason</li>
          <li>Receive your prepaid return label via email</li>
          <li>Pack items securely and ship within 7 days</li>
          <li>Refund processed within 5–10 business days of receipt</li>
        </ol>
        <h2 className="text-foreground font-semibold text-lg mt-6">Return Shipping</h2>
        <p>Return shipping for defective or incorrect items is free. For other returns, a flat rate of $5.99 will be deducted from your refund.</p>
      </div>
    </div>
  </StoreLayout>
);

export default StoreReturns;
