import { Truck, Clock, Globe } from "lucide-react";

const StoreShipping = () => (
  <>
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-playfair text-3xl font-bold text-foreground mb-6">Shipping Policy</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Truck, title: "Free Shipping", desc: "On orders over $75" },
          { icon: Clock, title: "Processing", desc: "2–5 business days" },
          { icon: Globe, title: "International", desc: "Available worldwide" },
        ].map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center p-4 rounded-lg border border-border">
            <item.icon className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold text-sm">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <h2 className="text-foreground font-semibold text-lg">Domestic Shipping (US)</h2>
        <p>Standard shipping: 5–7 business days. Expedited shipping: 2–3 business days. Free standard shipping on orders over $75.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">International Shipping</h2>
        <p>International orders typically arrive within 10–21 business days. Customs duties and taxes are the responsibility of the recipient.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Order Tracking</h2>
        <p>A tracking number will be emailed to you once your order ships. You can also check your order status on our Order Tracking page.</p>
      </div>
    </div>
  </>
);

export default StoreShipping;
