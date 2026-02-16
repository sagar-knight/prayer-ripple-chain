export interface Verse {
  id: string;
  category: string;
  reference: string;
  text: string;
  translation: string;
  reflection?: string;
}

export type VerseCategory =
  | "Anxiety / Fear"
  | "Peace"
  | "Healing"
  | "Guidance"
  | "Family"
  | "Work"
  | "Grief"
  | "Forgiveness"
  | "Gratitude"
  | "Wisdom"
  | "Strength"
  | "Faith";

export const verseCategories: VerseCategory[] = [
  "Anxiety / Fear",
  "Peace",
  "Healing",
  "Guidance",
  "Family",
  "Work",
  "Grief",
  "Forgiveness",
  "Gratitude",
  "Wisdom",
  "Strength",
  "Faith",
];

// Map prayer request categories to verse categories
export const prayerCategoryToVerseCategory: Record<string, VerseCategory[]> = {
  health: ["Healing", "Strength", "Peace"],
  family: ["Family", "Peace", "Guidance"],
  work: ["Work", "Guidance", "Wisdom"],
  peace: ["Peace", "Anxiety / Fear", "Faith"],
  faith: ["Faith", "Strength", "Wisdom"],
  strength: ["Strength", "Faith", "Peace"],
  other: ["Peace", "Faith", "Guidance"],
};

export const verseBank: Verse[] = [
  // Anxiety / Fear
  {
    id: "v1",
    category: "Anxiety / Fear",
    reference: "Psalm 34:4",
    text: "I sought the Lord, and he answered me; he delivered me from all my fears.",
    translation: "NIV",
    reflection: "David knew what it meant to live in fear — hunted, alone, uncertain. Yet he found that when he turned to God, his fears lost their grip. This verse reminds us that seeking God is not passive; it is an act of courage.",
  },
  {
    id: "v2",
    category: "Anxiety / Fear",
    reference: "Isaiah 41:10",
    text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
    translation: "NIV",
    reflection: "God's presence is the antidote to fear. Like a parent holding a child's hand in a storm, He promises not just to be near, but to actively strengthen and uphold us.",
  },
  {
    id: "v3",
    category: "Anxiety / Fear",
    reference: "Philippians 4:6-7",
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    translation: "NIV",
    reflection: "Paul wrote these words from prison — not from comfort. His instruction to pray with thanksgiving isn't dismissive of pain; it's an invitation to trust the One who holds all things together.",
  },
  {
    id: "v4",
    category: "Anxiety / Fear",
    reference: "2 Timothy 1:7",
    text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.",
    translation: "NIV",
  },
  // Peace
  {
    id: "v5",
    category: "Peace",
    reference: "John 14:27",
    text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    translation: "NIV",
    reflection: "Jesus distinguishes His peace from the world's peace. The world offers temporary comfort; Jesus offers a peace rooted in eternal security — a peace that holds even when circumstances do not.",
  },
  {
    id: "v6",
    category: "Peace",
    reference: "Psalm 46:10",
    text: "He says, 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.'",
    translation: "NIV",
    reflection: "In a world that never stops moving, God invites us to stop. Stillness before God is not idleness — it is trust in action.",
  },
  {
    id: "v7",
    category: "Peace",
    reference: "Isaiah 26:3",
    text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.",
    translation: "NIV",
  },
  {
    id: "v8",
    category: "Peace",
    reference: "Romans 15:13",
    text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.",
    translation: "NIV",
  },
  // Healing
  {
    id: "v9",
    category: "Healing",
    reference: "Psalm 147:3",
    text: "He heals the brokenhearted and binds up their wounds.",
    translation: "NIV",
    reflection: "God is gentle with the broken. Like a physician who tends carefully to wounds, God draws near to those who hurt — not to lecture, but to heal.",
  },
  {
    id: "v10",
    category: "Healing",
    reference: "Jeremiah 17:14",
    text: "Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise.",
    translation: "NIV",
  },
  {
    id: "v11",
    category: "Healing",
    reference: "James 5:16",
    text: "Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.",
    translation: "NIV",
    reflection: "Healing often comes through community. James reminds us that prayer is not a solitary act — it is powerful when shared among believers who care for one another.",
  },
  {
    id: "v12",
    category: "Healing",
    reference: "Psalm 30:2",
    text: "Lord my God, I called to you for help, and you healed me.",
    translation: "NIV",
  },
  // Guidance
  {
    id: "v13",
    category: "Guidance",
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    translation: "NIV",
    reflection: "Solomon's wisdom here is counterintuitive: stop relying solely on your own analysis. God promises that trust — not perfect understanding — leads to clear direction.",
  },
  {
    id: "v14",
    category: "Guidance",
    reference: "Psalm 32:8",
    text: "I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you.",
    translation: "NIV",
  },
  {
    id: "v15",
    category: "Guidance",
    reference: "James 1:5",
    text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.",
    translation: "NIV",
    reflection: "God does not shame us for not knowing. He gives wisdom generously — without reproach — to anyone who asks in faith.",
  },
  {
    id: "v16",
    category: "Guidance",
    reference: "Psalm 119:105",
    text: "Your word is a lamp for my feet, a light on my path.",
    translation: "NIV",
  },
  // Family
  {
    id: "v17",
    category: "Family",
    reference: "Joshua 24:15",
    text: "But as for me and my household, we will serve the Lord.",
    translation: "NIV",
    reflection: "Joshua's declaration is both personal and communal. It reminds us that faith is lived out at home — in the daily rhythms of family life.",
  },
  {
    id: "v18",
    category: "Family",
    reference: "Psalm 127:3",
    text: "Children are a heritage from the Lord, offspring a reward from him.",
    translation: "NIV",
  },
  {
    id: "v19",
    category: "Family",
    reference: "Colossians 3:13-14",
    text: "Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you. And over all these virtues put on love, which binds them all together in perfect unity.",
    translation: "NIV",
    reflection: "Family life requires patience and forgiveness. Paul points us to love as the binding force that holds relationships together through difficulty.",
  },
  // Work
  {
    id: "v20",
    category: "Work",
    reference: "Colossians 3:23",
    text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
    translation: "NIV",
    reflection: "Our work takes on new meaning when we see it as service to God. Whether in an office or at home, every task done faithfully honors Him.",
  },
  {
    id: "v21",
    category: "Work",
    reference: "Proverbs 16:3",
    text: "Commit to the Lord whatever you do, and he will establish your plans.",
    translation: "NIV",
  },
  {
    id: "v22",
    category: "Work",
    reference: "Ecclesiastes 9:10",
    text: "Whatever your hand finds to do, do it with all your might.",
    translation: "NIV",
  },
  // Grief
  {
    id: "v23",
    category: "Grief",
    reference: "Psalm 34:18",
    text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    translation: "NIV",
    reflection: "In moments of deepest grief, God does not stand far off. He draws near. David's words assure us that our pain does not push God away — it draws Him closer.",
  },
  {
    id: "v24",
    category: "Grief",
    reference: "Revelation 21:4",
    text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.",
    translation: "NIV",
  },
  {
    id: "v25",
    category: "Grief",
    reference: "Matthew 5:4",
    text: "Blessed are those who mourn, for they will be comforted.",
    translation: "NIV",
    reflection: "Jesus dignifies grief. Mourning is not weakness — it is the natural response of a loving heart. And Jesus promises that comfort will come.",
  },
  // Forgiveness
  {
    id: "v26",
    category: "Forgiveness",
    reference: "1 John 1:9",
    text: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.",
    translation: "NIV",
    reflection: "God's forgiveness is not reluctant. He is faithful to forgive — it is part of His character. Confession opens the door to the freedom He already wants to give.",
  },
  {
    id: "v27",
    category: "Forgiveness",
    reference: "Ephesians 4:32",
    text: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.",
    translation: "NIV",
  },
  {
    id: "v28",
    category: "Forgiveness",
    reference: "Psalm 103:12",
    text: "As far as the east is from the west, so far has he removed our transgressions from us.",
    translation: "NIV",
  },
  // Gratitude
  {
    id: "v29",
    category: "Gratitude",
    reference: "1 Thessalonians 5:18",
    text: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
    translation: "NIV",
    reflection: "Gratitude is not about denying hardship. It is about recognizing God's presence even in the storm. Paul invites us to a posture of thankfulness that transforms our perspective.",
  },
  {
    id: "v30",
    category: "Gratitude",
    reference: "Psalm 107:1",
    text: "Give thanks to the Lord, for he is good; his love endures forever.",
    translation: "NIV",
  },
  {
    id: "v31",
    category: "Gratitude",
    reference: "James 1:17",
    text: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights, who does not change like shifting shadows.",
    translation: "NIV",
  },
  // Wisdom
  {
    id: "v32",
    category: "Wisdom",
    reference: "Proverbs 9:10",
    text: "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.",
    translation: "NIV",
    reflection: "True wisdom begins with reverence for God. It is not merely intellectual — it is relational. Knowing God is the foundation of all understanding.",
  },
  {
    id: "v33",
    category: "Wisdom",
    reference: "Proverbs 2:6",
    text: "For the Lord gives wisdom; from his mouth come knowledge and understanding.",
    translation: "NIV",
  },
  {
    id: "v34",
    category: "Wisdom",
    reference: "Colossians 3:16",
    text: "Let the message of Christ dwell among you richly as you teach and admonish one another with all wisdom through psalms, hymns, and songs from the Spirit, singing to God with gratitude in your hearts.",
    translation: "NIV",
  },
  // Strength
  {
    id: "v35",
    category: "Strength",
    reference: "Isaiah 40:31",
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    translation: "NIV",
    reflection: "Isaiah's promise is not about human willpower. It is about divine renewal. When we place our hope in God, He replenishes what the world drains.",
  },
  {
    id: "v36",
    category: "Strength",
    reference: "Philippians 4:13",
    text: "I can do all this through him who gives me strength.",
    translation: "NIV",
    reflection: "Paul's declaration is not about achieving worldly success. In context, he speaks of contentment in all circumstances — strength to endure, not just to conquer.",
  },
  {
    id: "v37",
    category: "Strength",
    reference: "Psalm 73:26",
    text: "My flesh and my heart may fail, but God is the strength of my heart and my portion forever.",
    translation: "NIV",
  },
  // Faith
  {
    id: "v38",
    category: "Faith",
    reference: "Hebrews 11:1",
    text: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    translation: "NIV",
    reflection: "Faith is not blind. It is confident trust based on God's character and promises. The heroes of Hebrews 11 — Abraham, Moses, Rahab — all acted on what they could not yet see.",
  },
  {
    id: "v39",
    category: "Faith",
    reference: "Romans 10:17",
    text: "Consequently, faith comes from hearing the message, and the message is heard through the word about Christ.",
    translation: "NIV",
  },
  {
    id: "v40",
    category: "Faith",
    reference: "Mark 11:24",
    text: "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.",
    translation: "NIV",
  },
  {
    id: "v41",
    category: "Faith",
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    translation: "NIV",
    reflection: "Paul does not promise that all things are good. He promises that God works through all things — even the painful ones — for the good of those who love Him.",
  },
];

/** Get verses for a given prayer category */
export function getVersesForPrayerCategory(prayerCategory: string): Verse[] {
  const mapped = prayerCategoryToVerseCategory[prayerCategory.toLowerCase()] || ["Peace", "Faith", "Guidance"];
  return verseBank.filter((v) => mapped.includes(v.category as VerseCategory));
}

/** Get a "daily verse" based on the day of year */
export function getDailyVerse(): Verse {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return verseBank[dayOfYear % verseBank.length];
}

/** Get verses by category */
export function getVersesByCategory(category: string): Verse[] {
  return verseBank.filter((v) => v.category === category);
}
