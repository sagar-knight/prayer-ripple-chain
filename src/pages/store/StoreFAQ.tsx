import StoreLayout from "@/components/store/StoreLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How long does shipping take?", a: "Standard US shipping takes 5–7 business days. International orders typically arrive in 10–21 business days." },
  { q: "Do you offer free shipping?", a: "Yes! Free standard shipping on all US orders over $75." },
  { q: "Can I return or exchange an item?", a: "Absolutely. You have 30 days from delivery to return or exchange eligible items. See our Returns page for details." },
  { q: "How do I track my order?", a: "Once your order ships, you'll receive a tracking number via email. You can also use our Order Tracking page." },
  { q: "Are your products ethically made?", a: "We partner with suppliers who share our values of quality, sustainability, and ethical production." },
  { q: "Where does the money go?", a: "A portion of every purchase supports PrayerForward's mission to build prayer communities and spread encouragement worldwide." },
  { q: "Do you ship internationally?", a: "Yes, we ship to most countries. International shipping rates and customs duties may apply." },
  { q: "How do I contact customer support?", a: "Visit our Contact page or email us. We respond within 1–2 business days." },
];

const StoreFAQ = () => (
  <StoreLayout>
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
      <p className="text-muted-foreground mb-8">Got questions? We've got answers.</p>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-foreground">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </StoreLayout>
);

export default StoreFAQ;
