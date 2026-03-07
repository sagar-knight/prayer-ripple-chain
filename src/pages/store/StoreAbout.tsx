import { Heart, Globe, Users } from "lucide-react";

const StoreAbout = () => (
  <>
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-6">Our Mission</h1>
      <p className="text-muted-foreground text-lg leading-relaxed mb-8">
        PrayerForward exists to build a global prayer community that connects hearts, strengthens faith, and extends hope. Every product in our store is designed to be a daily reminder of God's promises and love.
      </p>
      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        {[
          { icon: Heart, title: "Faith-Driven", desc: "Every design is rooted in Scripture and crafted with intention." },
          { icon: Globe, title: "Global Impact", desc: "Purchases support prayer initiatives and communities worldwide." },
          { icon: Users, title: "Community First", desc: "We're building connections through shared faith and prayer." },
        ].map((item) => (
          <div key={item.title} className="text-center p-6 rounded-lg border border-border">
            <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground leading-relaxed">
        When you shop with PrayerForward, you're not just buying a product—you're joining a movement. A portion of every sale goes directly toward supporting prayer chains, community outreach, and spreading encouragement to those who need it most.
      </p>
    </div>
  </>
);

export default StoreAbout;
