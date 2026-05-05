const CommunityGuidelines = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
    <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Community Guidelines</h1>
    <p className="text-sm text-muted-foreground mb-8">PrayerForward is a grace-filled, Christ-centered space. These guidelines protect everyone who shares here.</p>
    <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
      <h2 className="text-foreground font-semibold text-lg mt-6">Our Spirit</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Pray with humility, honesty, and compassion.</li>
        <li>Honor anonymity. Never try to identify or contact someone outside the platform.</li>
        <li>Respond with encouragement, not judgment or debate.</li>
      </ul>

      <h2 className="text-foreground font-semibold text-lg mt-6">Not Permitted</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Hate speech, harassment, threats, or personal attacks.</li>
        <li>Sexually explicit, violent, or graphic content.</li>
        <li>Spam, advertising, fundraising outside the platform, or chain messages.</li>
        <li>Sharing personal information of others (names, addresses, phone numbers).</li>
        <li>Impersonation, deception, or coordinated manipulation.</li>
        <li>Promoting self-harm, illegal activity, or medical/legal advice.</li>
        <li>Theological debate, doctrinal arguments, or denominational disputes.</li>
      </ul>

      <h2 className="text-foreground font-semibold text-lg mt-6">Reporting</h2>
      <p>Every prayer card has a <strong>Report</strong> action. Reports are reviewed by our moderation team. You can also email <a href="mailto:support@prayerforward.com" className="text-primary underline">support@prayerforward.com</a>.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">Consequences</h2>
      <p>Content that violates these guidelines may be hidden or removed. Repeat or severe violations may result in suspension or removal of the account.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">Crisis & Safety</h2>
      <p>If you or someone you know is in immediate danger, please call your local emergency services. See our <a href="/disclaimer" className="text-primary underline">Disclaimer</a> for crisis resources.</p>
    </div>
  </div>
);

export default CommunityGuidelines;