const PrivacyPolicy = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
    <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
    <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
    <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
      <p>PrayerForward ("we", "our") is a faith-based prayer community. We are committed to protecting your privacy and supporting anonymous participation.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">What We Collect</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Account info</strong> (optional): email, display name, password hash. You may submit prayers anonymously without an account.</li>
        <li><strong>Prayer content</strong> you choose to share (public, family-only, or church-only based on your selection).</li>
        <li><strong>Country-level location</strong> only. We do <strong>not</strong> store IP addresses, city, GPS coordinates, or precise location data.</li>
        <li><strong>Usage analytics</strong>: anonymized event counts (prayers offered, page views) used to improve the service.</li>
      </ul>

      <h2 className="text-foreground font-semibold text-lg mt-6">What We Never Collect</h2>
      <p>We never collect or store: IP addresses, precise location, device fingerprints, contact lists, photos, microphone or camera data.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">How We Use Your Data</h2>
      <p>To deliver prayer requests to the community you select, send notifications you opt in to, prevent abuse, and produce aggregate, country-level reach reporting.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">Sharing</h2>
      <p>We do not sell personal data. We share only with service providers strictly required to operate the platform (hosting, email delivery, payment processing for donations and merchandise).</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">Visibility of Prayers</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Public prayers</strong> show only the prayer text, optional first name or "Anonymous", and country.</li>
        <li><strong>Family prayers</strong> are visible only to invited family members.</li>
        <li><strong>Church prayers</strong> are visible only to approved members of that church.</li>
      </ul>

      <h2 className="text-foreground font-semibold text-lg mt-6">Your Rights</h2>
      <p>You may delete your account, hide or remove your prayers, or request export of your data at any time by contacting <a href="mailto:support@prayerforward.com" className="text-primary underline">support@prayerforward.com</a>.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">Children</h2>
      <p>PrayerForward is not directed to children under 13. We do not knowingly collect data from children under 13.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">Contact</h2>
      <p>Questions: <a href="mailto:support@prayerforward.com" className="text-primary underline">support@prayerforward.com</a></p>
    </div>
  </div>
);

export default PrivacyPolicy;