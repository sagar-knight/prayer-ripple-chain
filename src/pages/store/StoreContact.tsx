import { useState } from "react";
import StoreLayout from "@/components/store/StoreLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, MessageSquare } from "lucide-react";

const StoreContact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Store locally for now
    const msgs = JSON.parse(localStorage.getItem("pf-contact-messages") || "[]");
    msgs.push({ ...form, created_at: new Date().toISOString() });
    localStorage.setItem("pf-contact-messages", JSON.stringify(msgs));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">We'd love to hear from you. Fill out the form below and we'll respond within 1–2 business days.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
            <Mail className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">support@prayerforward.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
            <MessageSquare className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Response Time</p>
              <p className="text-xs text-muted-foreground">1–2 business days</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Your name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} required />
          <Textarea placeholder="Your message..." value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} required rows={5} />
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </StoreLayout>
  );
};

export default StoreContact;
