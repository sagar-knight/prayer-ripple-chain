export type BibleTranslation = "NIV" | "KJV" | "NLT";

export interface BibleBook {
  name: string;
  chapters: number;
}

export const bibleBooks: BibleBook[] = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];

// Sample chapter texts for demonstration (John 1, Psalm 23, Romans 8)
// In production, these would come from a Bible API
export const sampleChapterTexts: Record<string, Record<number, Record<BibleTranslation, string>>> = {
  John: {
    1: {
      NIV: `1 In the beginning was the Word, and the Word was with God, and the Word was God. 2 He was with God in the beginning. 3 Through him all things were made; without him nothing was made that has been made. 4 In him was life, and that life was the light of all mankind. 5 The light shines in the darkness, and the darkness has not overcome it.\n\n6 There was a man sent from God whose name was John. 7 He came as a witness to testify concerning that light, so that through him all might believe. 8 He himself was not the light; he came only as a witness to the light.\n\n9 The true light that gives light to everyone was coming into the world. 10 He was in the world, and though the world was made through him, the world did not recognize him. 11 He came to that which was his own, but his own did not receive him. 12 Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God— 13 children born not of natural descent, nor of human decision or a husband's will, but born of God.\n\n14 The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.`,
      KJV: `1 In the beginning was the Word, and the Word was with God, and the Word was God. 2 The same was in the beginning with God. 3 All things were made by him; and without him was not any thing made that was made. 4 In him was life; and the life was the light of men. 5 And the light shineth in darkness; and the darkness comprehended it not.\n\n6 There was a man sent from God, whose name was John. 7 The same came for a witness, to bear witness of the Light, that all men through him might believe. 8 He was not that Light, but was sent to bear witness of that Light.\n\n9 That was the true Light, which lighteth every man that cometh into the world. 10 He was in the world, and the world was made by him, and the world knew him not. 11 He came unto his own, and his own received him not. 12 But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name: 13 Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.\n\n14 And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.`,
      NLT: `1 In the beginning the Word already existed. The Word was with God, and the Word was God. 2 He existed in the beginning with God. 3 God created everything through him, and nothing was created except through him. 4 The Word gave life to everything that was created, and his life brought light to everyone. 5 The light shines in the darkness, and the darkness can never extinguish it.\n\n6 God sent a man, John the Baptist, 7 to tell about the light so that everyone might believe because of his testimony. 8 John himself was not the light; he was simply a witness to tell about the light.\n\n9 The one who is the true light, who gives light to everyone, was coming into the world. 10 He came into the very world he created, but the world didn't recognize him. 11 He came to his own people, and even they rejected him. 12 But to all who believed him and accepted him, he gave the right to become children of God. 13 They are reborn—not with a physical birth resulting from human passion or plan, but a birth that comes from God.\n\n14 So the Word became human and made his home among us. He was full of unfailing love and faithfulness. And we have seen his glory, the glory of the Father's one and only Son.`,
    },
  },
  Psalms: {
    23: {
      NIV: `1 The Lord is my shepherd, I lack nothing.\n2 He makes me lie down in green pastures, he leads me beside quiet waters,\n3 he refreshes my soul. He guides me along the right paths for his name's sake.\n4 Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.\n5 You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.\n6 Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.`,
      KJV: `1 The Lord is my shepherd; I shall not want.\n2 He maketh me to lie down in green pastures: he leadeth me beside the still waters.\n3 He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.\n4 Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.\n5 Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.\n6 Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.`,
      NLT: `1 The Lord is my shepherd; I have all that I need.\n2 He lets me rest in green meadows; he leads me beside peaceful streams.\n3 He renews my strength. He guides me along right paths, bringing honor to his name.\n4 Even when I walk through the darkest valley, I will not be afraid, for you are close beside me. Your rod and your staff protect and comfort me.\n5 You prepare a feast for me in the presence of my enemies. You honor me by anointing my head with oil. My cup overflows with blessings.\n6 Surely your goodness and unfailing love will pursue me all the days of my life, and I will live in the house of the Lord forever.`,
    },
  },
  Romans: {
    8: {
      NIV: `1 Therefore, there is now no condemnation for those who are in Christ Jesus, 2 because through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death. 3 For what the law was powerless to do because it was weakened by the flesh, God did by sending his own Son in the likeness of sinful flesh to be a sin offering.\n\n18 I consider that our present sufferings are not worth comparing with the glory that will be revealed in us.\n\n26 In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans. 27 And he who searches our hearts knows the mind of the Spirit, because the Spirit intercedes for God's people in accordance with the will of God.\n\n28 And we know that in all things God works for the good of those who love him, who have been called according to his purpose.\n\n31 What, then, shall we say in response to these things? If God is for us, who can be against us? 32 He who did not spare his own Son, but gave him up for us all—how will he not also, along with him, graciously give us all things?\n\n37 No, in all these things we are more than conquerors through him who loved us. 38 For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, 39 neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.`,
      KJV: `1 There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit. 2 For the law of the Spirit of life in Christ Jesus hath made me free from the law of sin and death.\n\n18 For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in us.\n\n26 Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be uttered. 27 And he that searcheth the hearts knoweth what is the mind of the Spirit, because he maketh intercession for the saints according to the will of God.\n\n28 And we know that all things work together for good to them that love God, to them who are the called according to his purpose.\n\n31 What shall we then say to these things? If God be for us, who can be against us? 32 He that spared not his own Son, but delivered him up for us all, how shall he not with him also freely give us all things?\n\n37 Nay, in all these things we are more than conquerors through him that loved us. 38 For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, 39 Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.`,
      NLT: `1 So now there is no condemnation for those who belong to Christ Jesus. 2 And because you belong to him, the power of the life-giving Spirit has freed you from the power of sin that leads to death.\n\n18 Yet what we suffer now is nothing compared to the glory he will reveal to us later.\n\n26 And the Holy Spirit helps us in our weakness. For example, we don't know what God wants us to pray for. But the Holy Spirit prays for us with groanings that cannot be expressed in words. 27 And the Father who knows all hearts knows what the Spirit is saying, for the Spirit pleads for us believers in harmony with God's own will.\n\n28 And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.\n\n31 What shall we say about such wonderful things as these? If God is for us, who can ever be against us? 32 Since he did not spare even his own Son but gave him up for us all, won't he also give us everything else?\n\n37 No, despite all these things, overwhelming victory is ours through Christ, who loved us. 38 And I am convinced that nothing can ever separate us from God's love. Neither death nor life, neither angels nor demons, neither our fears for today nor our worries about tomorrow—not even the powers of hell can separate us from God's love. 39 No power in the sky above or in the earth below—indeed, nothing in all creation will ever be able to separate us from the love of God that is revealed in Christ Jesus our Lord.`,
    },
  },
  Genesis: {
    1: {
      NIV: `1 In the beginning God created the heavens and the earth. 2 Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.\n\n3 And God said, "Let there be light," and there was light. 4 God saw that the light was good, and he separated the light from the darkness. 5 God called the light "day," and the darkness he called "night." And there was evening, and there was morning—the first day.\n\n6 And God said, "Let there be a vault between the waters to separate water from water." 7 So God made the vault and separated the water under the vault from the water above it. And it was so. 8 God called the vault "sky." And there was evening, and there was morning—the second day.\n\n26 Then God said, "Let us make mankind in our image, in our likeness, so that they may rule over the fish in the sea and the birds in the sky, over the livestock and all the wild animals, and over all the creatures that move along the ground."\n\n27 So God created mankind in his own image, in the image of God he created them; male and female he created them.\n\n31 God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day.`,
      KJV: `1 In the beginning God created the heaven and the earth. 2 And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.\n\n3 And God said, Let there be light: and there was light. 4 And God saw the light, that it was good: and God divided the light from the darkness. 5 And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.\n\n26 And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.\n\n27 So God created man in his own image, in the image of God created he him; male and female created he them.\n\n31 And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.`,
      NLT: `1 In the beginning God created the heavens and the earth. 2 The earth was formless and empty, and darkness covered the deep waters. And the Spirit of God was hovering over the surface of the waters.\n\n3 Then God said, "Let there be light," and there was light. 4 And God saw that the light was good. Then he separated the light from the darkness. 5 God called the light "day" and the darkness "night." And evening passed and morning came, marking the first day.\n\n26 Then God said, "Let us make human beings in our image, to be like us. They will reign over the fish in the sea, the birds in the sky, the livestock, all the wild animals on the earth, and the small animals that scurry along the ground."\n\n27 So God created human beings in his own image. In the image of God he created them; male and female he created them.\n\n31 Then God looked over all he had made, and he saw that it was very good! And evening passed and morning came, marking the sixth day.`,
    },
  },
};

/**
 * Get chapter text. Returns sample text if available, otherwise a placeholder.
 */
export function getChapterText(
  book: string,
  chapter: number,
  translation: BibleTranslation
): string {
  const bookData = sampleChapterTexts[book];
  if (bookData && bookData[chapter] && bookData[chapter][translation]) {
    return bookData[chapter][translation];
  }
  return `[${book} ${chapter} — ${translation}]\n\nThis chapter text will be available when connected to a Bible API. For now, sample texts are available for John 1, Psalm 23, Romans 8, and Genesis 1.\n\nTry navigating to one of those chapters to see the full reading experience.`;
}
