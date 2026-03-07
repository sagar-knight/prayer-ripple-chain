const StorePrivacy = () => (
  <>
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-playfair text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Information We Collect</h2>
        <p>We collect information you provide when placing orders (name, email, shipping address) and automatically collected data (browser type, device info, usage patterns).</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">How We Use Your Information</h2>
        <p>Your information is used to process orders, communicate about your purchases, improve our services, and send marketing communications you've opted into.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Information Sharing</h2>
        <p>We do not sell your personal information. We share data only with service providers necessary to fulfill orders (payment processors, shipping carriers).</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Data Security</h2>
        <p>We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data by contacting us through our Contact page.</p>
        <h2 className="text-foreground font-semibold text-lg mt-6">Contact</h2>
        <p>For privacy-related inquiries, please reach out through our Contact page.</p>
      </div>
    </div>
  </>
);

export default StorePrivacy;
