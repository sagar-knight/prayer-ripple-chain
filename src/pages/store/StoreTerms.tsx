const StoreTerms = () => (
  <>
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-playfair text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">1. Agreement to Terms</h2>
        <p>By accessing or using the PrayerForward store, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">2. Products & Orders</h2>
        <p>All products are subject to availability. We reserve the right to limit quantities and refuse orders. Prices are subject to change without notice.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">3. Payment</h2>
        <p>Payment is processed securely through our payment partners. You agree to provide accurate payment information and authorize charges for your orders.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">4. Shipping</h2>
        <p>Shipping times vary by destination. We are not responsible for delays caused by carriers or customs. Risk of loss passes to you upon delivery to the carrier.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">5. Intellectual Property</h2>
        <p>All content, designs, and branding on this site are the property of PrayerForward and may not be reproduced without permission.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">6. Limitation of Liability</h2>
        <p>PrayerForward shall not be liable for any indirect, incidental, or consequential damages arising from your use of our products or services.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">7. Contact</h2>
        <p>For questions about these terms, please contact us through our Contact page.</p>
      </div>
    </div>
  </StoreLayout>
);

export default StoreTerms;
