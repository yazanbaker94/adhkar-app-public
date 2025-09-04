// Quran Verse Database for Challenges - Arabic Verses
const quranVerses = [
    {
        verse: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        verseTransliteration: "Bismillahi ar-Rahmani ar-Raheem",
        verseTranslation: "In the name of Allah, the Most Gracious, the Most Merciful",
        missingWord: "اللَّهِ",
        missingWordTransliteration: "Allah",
        options: ["اللَّهِ", "الكريم", "الرَّحْمَٰنِ", "الرَّحِيمِ"],
        optionsTransliteration: ["Allah", "Al-Kareem", "Ar-Rahman", "Ar-Raheem"],
        surah: "Al-Fatiha",
        ayah: 1
    },
    {
        verse: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        verseTransliteration: "Alhamdu lillahi rabbi al-'alameen",
        verseTranslation: "All praise belongs to Allah, Lord of all the worlds",
        missingWord: "الْحَمْدُ",
        missingWordTransliteration: "Alhamdu",
        options: ["الْحَمْدُ", "الشُّكْرُ", "الثَّنَاءُ", "الْمَجْدُ"],
        optionsTransliteration: ["Alhamdu", "Ash-Shukru", "Ath-Thana'u", "Al-Majdu"],
        surah: "Al-Fatiha",
        ayah: 2
    },
    {
        verse: "الرَّحْمَٰنِ الرَّحِيمِ",
        verseTransliteration: "Ar-Rahmani ar-Raheem",
        verseTranslation: "The Most Gracious, the Most Merciful",
        missingWord: "الرَّحِيمِ",
        missingWordTransliteration: "Ar-Raheem",
        options: ["الرَّحِيمِ", "اللَّطِيفُ", "الْوَدُودُ", "الرَّءُوفُ"],
        optionsTransliteration: ["Ar-Raheem", "Al-Lateef", "Al-Wadood", "Ar-Ra'oof"],
        surah: "Al-Fatiha",
        ayah: 3
    },
    {
        verse: "مَالِكِ يَوْمِ الدِّينِ",
        verseTransliteration: "Maliki yawmi ad-deen",
        verseTranslation: "Master of the Day of Judgment",
        missingWord: "الدِّينِ",
        missingWordTransliteration: "Ad-deen",
        options: ["الدِّينِ", "الْحِسَابِ", "الْقِيَامَةِ", "الْحِسَابِ"],
        optionsTransliteration: ["Ad-deen", "Al-hisab", "Al-qiyamah", "Al-hisab"],
        surah: "Al-Fatiha",
        ayah: 4
    },
    {
        verse: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        verseTransliteration: "Iyyaka na'budu wa iyyaka nasta'een",
        verseTranslation: "You alone we worship, and You alone we ask for help",
        missingWord: "نَعْبُدُ",
        missingWordTransliteration: "Na'budu",
        options: ["نَعْبُدُ", "نَخْدُمُ", "نُصَلِّي", "نُكْرِمُ"],
        optionsTransliteration: ["Na'budu", "Nakhdumu", "Nusalli", "Nukrimu"],
        surah: "Al-Fatiha",
        ayah: 5
    },
    {
        verse: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        verseTransliteration: "Ihdina as-sirata al-mustaqeem",
        verseTranslation: "Guide us to the straight path",
        missingWord: "الْمُسْتَقِيمَ",
        missingWordTransliteration: "Al-mustaqeem",
        options: ["الْمُسْتَقِيمَ", "الْقَوِيمَ", "الصَّحِيحَ", "الْمُنَاسِبَ"],
        optionsTransliteration: ["Al-mustaqeem", "Al-qawim", "As-saheeh", "Al-munasib"],
        surah: "Al-Fatiha",
        ayah: 6
    },
    {
        verse: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
        verseTransliteration: "Sirata alladheena an'amta 'alayhim",
        verseTranslation: "The path of those upon whom You have bestowed favor",
        missingWord: "أَنْعَمْتَ",
        missingWordTransliteration: "An'amta",
        options: ["أَنْعَمْتَ", "أَعْطَيْتَ", "مَنَحْتَ", "وَهَبْتَ"],
        optionsTransliteration: ["An'amta", "A'tayta", "Manahata", "Wahabta"],
        surah: "Al-Fatiha",
        ayah: 7
    },
    {
        verse: "غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ",
        verseTransliteration: "Ghayri al-maghdoobi 'alayhim",
        verseTranslation: "Not of those who have evoked Your anger",
        missingWord: "الْمَغْضُوبِ",
        missingWordTransliteration: "Al-maghdoobi",
        options: ["الْمَغْضُوبِ", "الْمَكْرُوهِ", "الْمَذْمُومِ", "الْمَخْزِي"],
        optionsTransliteration: ["Al-maghdoobi", "Al-makroohi", "Al-madmoomi", "Al-makhzi"],
        surah: "Al-Fatiha",
        ayah: 7
    },
    {
        verse: "وَلَا الضَّالِّينَ",
        verseTransliteration: "Wa la ad-daalleen",
        verseTranslation: "Nor of those who are astray",
        missingWord: "الضَّالِّينَ",
        missingWordTransliteration: "Ad-daalleen",
        options: ["الضَّالِّينَ", "الْهَالِكِينَ", "الْمُضِلِّينَ", "الْحَائِرِينَ"],
        optionsTransliteration: ["Ad-daalleen", "Al-halikeen", "Al-mudilleen", "Al-ha'ireen"],
        surah: "Al-Fatiha",
        ayah: 7
    },
    {
        verse: "الم ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ",
        verseTransliteration: "Alif-Lam-Meem. Dhalika al-kitabu la rayba feeh",
        verseTranslation: "Alif, Lam, Meem. This is the Book about which there is no doubt",
        missingWord: "الْكِتَابُ",
        missingWordTransliteration: "Al-kitabu",
        options: ["الْكِتَابُ", "الْوَحْيُ", "الْقُرْآنُ", "الرِّسَالَةُ"],
        optionsTransliteration: ["Al-kitabu", "Al-wahy", "Al-qur'an", "Ar-risalah"],
        surah: "Al-Baqarah",
        ayah: 1
    },
    {
        verse: "هُدًى لِّلْمُتَّقِينَ",
        verseTransliteration: "Hudan lil-muttaqeen",
        verseTranslation: "A guidance for those who are conscious of Allah",
        missingWord: "لِّلْمُتَّقِينَ",
        missingWordTransliteration: "Lil-muttaqeen",
        options: ["لِّلْمُتَّقِينَ", "لِلْمُؤْمِنِينَ", "لِلصَّالِحِينَ", "لِلْمُطِيعِينَ"],
        optionsTransliteration: ["Lil-muttaqeen", "Lil-mu'mineen", "Liss-saliheen", "Lil-muti'een"],
        surah: "Al-Baqarah",
        ayah: 2
    },
    {
        verse: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ",
        verseTransliteration: "Alladheena yu'minoona bil-ghaybi wa yuqeemoona as-salah",
        verseTranslation: "Who believe in the unseen and establish prayer",
        missingWord: "الصَّلَاةَ",
        missingWordTransliteration: "As-salah",
        options: ["الصَّلَاةَ", "الْعِبَادَةَ", "الذِّكْرَ", "الدُّعَاءَ"],
        optionsTransliteration: ["As-salah", "Al-'ibadah", "Adh-dhikr", "Ad-du'a"],
        surah: "Al-Baqarah",
        ayah: 3
    },
    {
        verse: "وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
        verseTransliteration: "Wa mimma razaqnahum yunfiqoon",
        verseTranslation: "And spend from what We have provided for them",
        missingWord: "رَزَقْنَاهُمْ",
        missingWordTransliteration: "Razaqnahum",
        options: ["رَزَقْنَاهُمْ", "أَعْطَيْنَاهُمْ", "مَنَحْنَاهُمْ", "وَهَبْنَاهُمْ"],
        optionsTransliteration: ["Razaqnahum", "A'taynahum", "Manahnahum", "Wahabnahum"],
        surah: "Al-Baqarah",
        ayah: 3
    },
    {
        verse: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ",
        verseTransliteration: "Walladheena yu'minoona bima unzila ilayk",
        verseTranslation: "And who believe in what has been revealed to you",
        missingWord: "أُنزِلَ",
        missingWordTransliteration: "Unzila",
        options: ["أُنزِلَ", "أُرْسِلَ", "أُعْطِيَ", "أُظْهِرَ"],
        optionsTransliteration: ["Unzila", "Ursila", "U'tiya", "Uthira"],
        surah: "Al-Baqarah",
        ayah: 4
    },
    {
        verse: "وَمَا أُنزِلَ مِن قَبْلِكَ",
        verseTransliteration: "Wa ma unzila min qablik",
        verseTranslation: "And what was revealed before you",
        missingWord: "مِن قَبْلِكَ",
        missingWordTransliteration: "Min qablik",
        options: ["مِن قَبْلِكَ", "قَبْلَكَ", "أَوَّلًا", "سَابِقًا"],
        optionsTransliteration: ["Min qablik", "Qablak", "Awwalan", "Sabiqan"],
        surah: "Al-Baqarah",
        ayah: 4
    },
    {
        verse: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        verseTransliteration: "Qul huwa Allahu ahad",
        verseTranslation: "Say: He is Allah, the One",
        missingWord: "اللَّهُ",
        missingWordTransliteration: "Allahu",
        options: ["اللَّهُ", "الرَّحْمَٰنُ", "الرَّحِيمُ", "الْعَزِيزُ"],
        optionsTransliteration: ["Allahu", "Ar-Rahman", "Ar-Raheem", "Al-Aziz"],
        surah: "Al-Ikhlas",
        ayah: 1
    },
    {
        verse: "اللَّهُ الصَّمَدُ",
        verseTransliteration: "Allahu as-samad",
        verseTranslation: "Allah, the Eternal Refuge",
        missingWord: "الصَّمَدُ",
        missingWordTransliteration: "As-samad",
        options: ["الصَّمَدُ", "الْقَدِيرُ", "الْعَلِيمُ", "الْحَكِيمُ"],
        optionsTransliteration: ["As-samad", "Al-qadir", "Al-alim", "Al-hakim"],
        surah: "Al-Ikhlas",
        ayah: 2
    },
    {
        verse: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        verseTransliteration: "Lam yalid wa lam yoolad",
        verseTranslation: "He neither begets nor is born",
        missingWord: "يَلِدْ",
        missingWordTransliteration: "Yalid",
        options: ["يَلِدْ", "يَخْلُقْ", "يُوجِدْ", "يُبْدِعْ"],
        optionsTransliteration: ["Yalid", "Yakhluq", "Yujid", "Yubdi'"],
        surah: "Al-Ikhlas",
        ayah: 3
    }
];

// Function to get a random verse for challenge
function getRandomVerse() {
    const randomIndex = Math.floor(Math.random() * quranVerses.length);
    return quranVerses[randomIndex];
}

// Function to create a verse with missing word
function createChallengeVerse(verseData) {
    const words = verseData.verse.split(' ');
    const missingWordIndex = words.findIndex(word => 
        word === verseData.missingWord
    );
    
    if (missingWordIndex === -1) {
        // Fallback: replace the missing word with blank
        return verseData.verse.replace(verseData.missingWord, '_____');
    }
    
    words[missingWordIndex] = '_____';
    return words.join(' ');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { quranVerses, getRandomVerse, createChallengeVerse };
}
