const TermsOfUse = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
    <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Terms of Use</h1>
    <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
    <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
      <p>By using PrayerForward you agree to these Terms. If you do not agree, please do not use the service.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">1. Eligibility</h2>
      <p>You must be 13 or older to create an account. If you are under 18, please use the service with the involvement of a parent or guardian.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">2. Acceptable Use</h2>
      <p>You agree to follow our <a href="/guidelines" className="text-primary underline">Community Guidelines</a>. Do not post content that is unlawful, harassing, hateful, sexually explicit, deceptive, or that endangers others.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">3. Your Content</h2>
      <p>You retain ownership of prayers and content you submit. You grant PrayerForward a non-exclusive license to display your content within the visibility setting you chose (public, family, or church) for the purpose of operating the service.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">4. Moderation</h2>
      <p>We may hide, remove, or restrict any content that violates these Terms or our Community Guidelines. We may suspend or terminate accounts that repeatedly violate the rules.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">5. Donations & Purchases</h2>
      <p>Donations are voluntary and non-refundable except as required by law. Merchandise purchases are governed by the store policies (shipping, returns, refunds).</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">6. Disclaimer</h2>
      <p>PrayerForward is a peer prayer community. It is <strong>not</strong> a substitute for professional medical, mental-health, legal, financial, emergency, or crisis services. See our <a href="/disclaimer" className="text-primary underline">Disclaimer</a>.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">7. Limitation of Liability</h2>
      <p>The service is provided "as is" without warranties of any kind. To the fullest extent permitted by law, PrayerForward is not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">8. Changes</h2>
      <p>We may update these Terms from time to time. Continued use after changes constitutes acceptance.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">9. Contact</h2>
      <p><a href="mailto:support@prayerforward.com" className="text-primary underline">support@prayerforward.com</a></p>
    </div>
  </div>
);

export default TermsOfUse;