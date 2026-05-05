const Disclaimer = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
    <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Important Disclaimer</h1>
    <p className="text-sm text-muted-foreground mb-8">Please read carefully before using PrayerForward.</p>

    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 mb-8">
      <p className="text-foreground font-semibold mb-2">PrayerForward is not a crisis or emergency service.</p>
      <p className="text-sm text-muted-foreground">If you or someone you know is in immediate danger, experiencing thoughts of self-harm, or in a medical emergency, please contact your local emergency services <strong>now</strong>.</p>
    </div>

    <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
      <h2 className="text-foreground font-semibold text-lg">What PrayerForward Is</h2>
      <p>PrayerForward is a peer-to-peer faith community where people share prayer requests and pray for one another. Content is submitted by community members, not by clinical, legal, or pastoral professionals.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">What PrayerForward Is Not</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Not medical advice.</strong> We do not provide diagnosis, treatment, or mental-health care.</li>
        <li><strong>Not legal or financial advice.</strong> Information shared is opinion only.</li>
        <li><strong>Not emergency or crisis support.</strong> We cannot respond to time-sensitive emergencies.</li>
        <li><strong>Not a substitute for professional care</strong>, pastoral counseling, or therapy.</li>
      </ul>

      <h2 className="text-foreground font-semibold text-lg mt-6">If You Need Help Now</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Emergency:</strong> Call your local emergency number (911 in the US, 999 in the UK, 112 in the EU).</li>
        <li><strong>US Suicide & Crisis Lifeline:</strong> Call or text <strong>988</strong>.</li>
        <li><strong>International crisis lines:</strong> <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">findahelpline.com</a></li>
      </ul>

      <h2 className="text-foreground font-semibold text-lg mt-6">No Guarantee of Outcome</h2>
      <p>We trust God for every outcome, but we make no promise that prayers shared on this platform will be answered in any particular way or timeframe.</p>

      <h2 className="text-foreground font-semibold text-lg mt-6">Use at Your Own Discretion</h2>
      <p>You are responsible for what you share publicly. Do not post information that could put you or others at risk.</p>
    </div>
  </div>
);

export default Disclaimer;