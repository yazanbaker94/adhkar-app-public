const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { createCanvas, registerFont } = require('canvas');
const https = require('https');



// Register fonts with their correct internal names
try {
  const fontFiles = [
    // Register with the actual internal font names you discovered
    { path: './fonts/UthmanicHafs1Ver18.ttf', family: 'KFGQPC HAFS Uthmanic Script' },
    { path: './fonts/AlMushafQuran.ttf', family: 'Al Majeed Quranic Font' },
    { path: './fonts/UtmanTahaNaskh.ttf', family: 'KFGQPC Uthman Taha Naskh' },
    { path: './fonts/UthmanicHafs1Ver09.ttf', family: 'KFGQPC Uthmanic Script HAFS' },

  ];
  
  fontFiles.forEach(font => {
    if (fs.existsSync(font.path)) {
      registerFont(font.path, { family: font.family });
      console.log(`✓ Registered font: ${font.family} from ${font.path}`);
    } else {
      console.log(`✗ Font file not found: ${font.path}`);
    }
  });
  
  console.log('Custom fonts registered. Testing availability...');
  
  // Test the registered fonts
  const canvas = createCanvas(100, 50);
  const ctx = canvas.getContext('2d');
  const testText = 'العربية';
  
  fontFiles.forEach(font => {
    try {
      ctx.font = `24px "${font.family}"`;
      const width = ctx.measureText(testText).width;
      console.log(`✓ ${font.family}: ${width}px`);
    } catch (error) {
      console.log(`✗ ${font.family}: Error`);
    }
  });
  
} catch (error) {
  console.error('Error registering custom fonts:', error);
  console.log('Falling back to system fonts...');
}

const app = express();
const PORT = process.env.PORT || 3000;



// const httpsOptions = {
//   key: fs.readFileSync('/etc/letsencrypt/live/api.sakinahtime.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/api.sakinahtime.com/fullchain.pem')
// };

// // Your middleware, routes, etc.
// // app.use(...)

// https.createServer(httpsOptions, app).listen(443, () => {
//   console.log('HTTPS Server running on port 443');
// });



app.use(cors({
  origin: [
    'https://sakinahtime.com',
    'https://www.sakinahtime.com',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));
app.use('/previews', express.static(path.join(__dirname, 'previews')));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.get('origin') || 'unknown'}`);
  next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Ensure directories exist
const dirs = ['uploads', 'generated', 'temp'];
dirs.forEach(dir => {
  fs.ensureDirSync(path.join(__dirname, dir));
});

// Helper function to get translation filename by ID
function getTranslationFilename(translationId) {
  const translationMap = {
    'en_sahih': 'en.sahih.json',
    'ur_jalandhry': 'ur.jalandhry.json',
    'tr_diyanet': 'tr.diyanet.json',
    'fr_hameidullah': 'fr.hameidullah.json',
    'es_cortes': 'es.cortes.json',
    'de_bubenheim': 'de.bubenheim.json',
    'id_indonesian': 'id.indonesian.json',
    'fa_ansarian': 'fa.ansarian.json',
    'bn_bengali': 'bn.bengali.json',
    'zh_jian': 'zh.jian.json',
    'ru_kuliev': 'ru.kuliev.json',
    'ms_basmeih': 'ms.basmeih.json',
    'it_piccardo': 'it.piccardo.json',
    'pt_elhayek': 'pt.elhayek.json',
    'nl_keyzer': 'nl.keyzer.json',
    'hi_hindi': 'hi.hindi.json',
    'ta_tamil': 'ta.tamil.json',
    'th_thai': 'th.thai.json',
    'ja_japanese': 'ja.japanese.json',
    'ko_korean': 'ko.korean.json',
    'ha_gumi': 'ha.gumi.json',
    'sw_barwani': 'sw.barwani.json'
  };
  
  return translationMap[translationId] || 'en.sahih.json'; // Default fallback
}

function calculateOptimalTextSize(text, fontFamily, baseSize, maxWidth, maxHeight) {
  console.log('📏 calculateOptimalTextSize called with:');
  console.log(`Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
  console.log(`Font: ${fontFamily}, Size: ${baseSize}, MaxWidth: ${maxWidth}, MaxHeight: ${maxHeight}`);
  console.log(`Text length: ${text.length} characters`);

  const tempCanvas = createCanvas(maxWidth * 2, maxHeight * 2);
  const tempCtx = tempCanvas.getContext('2d');

  let optimalSize = baseSize;
  let lines = [text]; // Default to a single line

  // Iterate from the base font size downwards to find the best fit
  // Allow smaller fonts for very long text (like verse 282)
  const minFontSize = text.length > 1000 ? 10 : 16;
  for (let size = baseSize; size >= minFontSize; size -= 2) {
      tempCtx.font = `${size}px "${fontFamily}"`;
      const lineHeight = size * 1.3;

      // --- MODIFIED & MORE ROBUST WORD WRAPPING LOGIC ---

      // Check for languages that don't use spaces (Japanese, Chinese, Bengali, etc.)
      // Exclude languages that use Latin script with spaces (Indonesian, Malay, etc.)
      const isCharBasedLanguage = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9faf\u0980-\u09FF\u0E00-\u0E7F\u0900-\u097F]/.test(text) && 
                                 !/^[a-zA-Z\s\u00C0-\u017F\u1E00-\u1EFF]+/.test(text.trim());
      const segments = isCharBasedLanguage ? text.split('') : text.split(' ');
      
      console.log(`📝 Text analysis: isCharBasedLanguage=${isCharBasedLanguage}, segments=${segments.length}`);

      if (segments.length === 0) {
          lines = [];
          optimalSize = size;
          break;
      }
      


      const wrappedLines = [];
      let currentLine = segments[0]; // Start with the first word/char

      for (let i = 1; i < segments.length; i++) {
          const segment = segments[i];
          const separator = isCharBasedLanguage ? '' : ' ';
          const testLine = currentLine + separator + segment;

          const testWidth = tempCtx.measureText(testLine).width;
          if (testWidth > maxWidth) {
              // The new word doesn't fit, so push the current line...
              wrappedLines.push(currentLine);
              // ...and start a new line with the current word.
              currentLine = segment;
          } else {
              // The new word fits, so add it to the current line.
              currentLine = testLine;
          }
      }
      wrappedLines.push(currentLine); // Add the last line

      // --- END OF MODIFIED LOGIC ---

      const totalHeight = wrappedLines.length * lineHeight;

      // Check if the wrapped text fits within the allowed height
      if (totalHeight <= maxHeight) {
          // Check if any single line is still too wide (can happen with very long words)
          const isAnyLineTooWide = wrappedLines.some(line => tempCtx.measureText(line).width > maxWidth);

          if (!isAnyLineTooWide) {
              optimalSize = size;
              lines = wrappedLines;
              break; // Found the optimal size, exit the loop
          }
      }
  }

  console.log(`✅ Calculated optimal size for "${text.substring(0, 30)}...": ${optimalSize}px, lines: ${lines.length}`);
  if (lines.length > 1) {
    console.log('📄 Wrapped lines:', lines.map((line, i) => `${i+1}: "${line.substring(0, 30)}..."`));
  }
  return { fontSize: optimalSize, lines: lines };
}
// Set FFmpeg path (you may need to adjust this based on your system)
// For Windows, you might need to install FFmpeg and set the path
// ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');

// API Routes

// Get available reciters
app.get('/api/reciters', (req, res) => {
  const reciters = [
    { id: 'abdul_basit', name: 'Abdul Basit Abdul Samad', nameAr: 'عبد الباسط عبد الصمد', language: 'Arabic' },
    { id: 'alafasy', name: 'Mishary Rashid Alafasy', nameAr: 'مشاري راشد العفاسي', language: 'Arabic' },
    { id: 'sudais', name: 'Abdur-Rahman As-Sudais', nameAr: 'عبد الرحمن السديس', language: 'Arabic' },
    { id: 'abdullah_basfar', name: 'Abdullah Basfar', nameAr: 'عبد الله بصفر', language: 'Arabic' },
    { id: 'abu_bakr_shatri', name: 'Abu Bakr Ash-Shaatree', nameAr: 'أبو بكر الشاطري', language: 'Arabic' },
    { id: 'ahmed_neana', name: 'Ahmed Neana', nameAr: 'أحمد نعنا', language: 'Arabic' },
    { id: 'ahmed_ajamy', name: 'Ahmed ibn Ali al-Ajamy', nameAr: 'أحمد بن علي العجمي', language: 'Arabic' },
    { id: 'akram_alaqimy', name: 'Akram AlAlaqimy', nameAr: 'أكرم العلاقمي', language: 'Arabic' },
    { id: 'ali_hajjaj', name: 'Ali Hajjaj AlSuesy', nameAr: 'علي حجاج السويسي', language: 'Arabic' },
    { id: 'hani_rifai', name: 'Hani Rifai', nameAr: 'هاني رفاعي', language: 'Arabic' },
    { id: 'hudhaify', name: 'Ali Al-Hudhaify', nameAr: 'علي الحذيفي', language: 'Arabic' },
    { id: 'khalid_qahtani', name: 'Khaalid Abdullaah al-Qahtaanee', nameAr: 'خالد عبد الله القحطاني', language: 'Arabic' },
    { id: 'minshawy', name: 'Muhammad Siddiq Al-Minshawi', nameAr: 'محمد صديق المنشاوي', language: 'Arabic' },
    { id: 'tablaway', name: 'Mohammad al-Tablaway', nameAr: 'محمد الطبلاوي', language: 'Arabic' },
    { id: 'muhsin_qasim', name: 'Muhsin Al Qasim', nameAr: 'محسن القاسم', language: 'Arabic' },
    { id: 'abdullaah_juhaynee', name: 'Abdullaah 3awwaad Al-Juhaynee', nameAr: 'عبد الله عواد الجهني', language: 'Arabic' },
    { id: 'husary', name: 'Mahmoud Khalil Al-Husary', nameAr: 'محمود خليل الحصري', language: 'Arabic' },
    { id: 'ghamadi', name: 'Saad Al-Ghamdi', nameAr: 'سعد الغامدي', language: 'Arabic' },
    { id: 'shuraim', name: 'Saud Al-Shuraim', nameAr: 'سعود الشريم', language: 'Arabic' }
  ];
  res.json(reciters);
});

// Get available fonts
app.get('/api/fonts', (req, res) => {
  try {
    const fonts = [
      { id: 'al_mushaf', name: 'Al Mushaf', family: 'Al Mushaf' },
      { id: 'uthmanic_hafs', name: 'Uthmanic Hafs (Old)', family: 'Uthmanic Hafs' }
    ];
    res.json(fonts);
  } catch (error) {
    console.error('Error getting fonts:', error);
    res.status(500).json({ error: 'Failed to get fonts' });
  }
});

// Get available translations
app.get('/api/translations', (req, res) => {
  try {
    const translations = [
      { 
        id: 'en_sahih', 
        name: 'English - Sahih International', 
        nameAr: 'الإنجليزية - صحيح دولي',
        language: 'English',
        languageCode: 'en',
        filename: 'en.sahih.json'
      },
      { 
        id: 'ur_jalandhry', 
        name: 'Urdu - Jalandhry', 
        nameAr: 'الأردية - جالندھری',
        language: 'Urdu',
        languageCode: 'ur',
        filename: 'ur.jalandhry.json'
      },
      { 
        id: 'tr_diyanet', 
        name: 'Turkish - Diyanet', 
        nameAr: 'التركية - ديانت',
        language: 'Turkish',
        languageCode: 'tr',
        filename: 'tr.diyanet.json'
      },
      { 
        id: 'fr_hameidullah', 
        name: 'French - Hamidullah', 
        nameAr: 'الفرنسية - حميد الله',
        language: 'French',
        languageCode: 'fr',
        filename: 'fr.hameidullah.json'
      },
      { 
        id: 'es_cortes', 
        name: 'Spanish - Cortes', 
        nameAr: 'الإسبانية - كورتيس',
        language: 'Spanish',
        languageCode: 'es',
        filename: 'es.cortes.json'
      },
      { 
        id: 'de_bubenheim', 
        name: 'German - Bubenheim', 
        nameAr: 'الألمانية - بوبنهايم',
        language: 'German',
        languageCode: 'de',
        filename: 'de.bubenheim.json'
      },
      { 
        id: 'id_indonesian', 
        name: 'Indonesian - Indonesian', 
        nameAr: 'الإندونيسية - الإندونيسية',
        language: 'Indonesian',
        languageCode: 'id',
        filename: 'id.indonesian.json'
      },
      { 
        id: 'fa_ansarian', 
        name: 'Persian - Ansarian', 
        nameAr: 'الفارسية - أنصاريان',
        language: 'Persian',
        languageCode: 'fa',
        filename: 'fa.ansarian.json'
      },
      { 
        id: 'bn_bengali', 
        name: 'Bengali - Muhiyuddin Khan', 
        nameAr: 'البنغالية - محيي الدين خان',
        language: 'Bengali',
        languageCode: 'bn',
        filename: 'bn.bengali.json'
      },
      { 
        id: 'zh_jian', 
        name: 'Chinese - Ma Jian', 
        nameAr: 'الصينية - ما جيان',
        language: 'Chinese',
        languageCode: 'zh',
        filename: 'zh.jian.json'
      },
      { 
        id: 'ru_kuliev', 
        name: 'Russian - Kuliev', 
        nameAr: 'الروسية - كولييف',
        language: 'Russian',
        languageCode: 'ru',
        filename: 'ru.kuliev.json'
      },
      { 
        id: 'ms_basmeih', 
        name: 'Malay - Basmeih', 
        nameAr: 'الماليزية - بسميح',
        language: 'Malay',
        languageCode: 'ms',
        filename: 'ms.basmeih.json'
      },
      { 
        id: 'it_piccardo', 
        name: 'Italian - Piccardo', 
        nameAr: 'الإيطالية - بيكاردو',
        language: 'Italian',
        languageCode: 'it',
        filename: 'it.piccardo.json'
      },
      { 
        id: 'pt_elhayek', 
        name: 'Portuguese - El Hayek', 
        nameAr: 'البرتغالية - الحايك',
        language: 'Portuguese',
        languageCode: 'pt',
        filename: 'pt.elhayek.json'
      },
      { 
        id: 'nl_keyzer', 
        name: 'Dutch - Keyzer', 
        nameAr: 'الهولندية - كيزر',
        language: 'Dutch',
        languageCode: 'nl',
        filename: 'nl.keyzer.json'
      },
      { 
        id: 'hi_hindi', 
        name: 'Hindi - Farooq Khan', 
        nameAr: 'الهندية - فاروق خان',
        language: 'Hindi',
        languageCode: 'hi',
        filename: 'hi.hindi.json'
      },
      { 
        id: 'ta_tamil', 
        name: 'Tamil - Jan Trust', 
        nameAr: 'التاميلية - جان تراست',
        language: 'Tamil',
        languageCode: 'ta',
        filename: 'ta.tamil.json'
      },
      { 
        id: 'th_thai', 
        name: 'Thai - Royal Office', 
        nameAr: 'التايلاندية - المكتب الملكي',
        language: 'Thai',
        languageCode: 'th',
        filename: 'th.thai.json'
      },
      { 
        id: 'ja_japanese', 
        name: 'Japanese - Mori', 
        nameAr: 'اليابانية - موري',
        language: 'Japanese',
        languageCode: 'ja',
        filename: 'ja.japanese.json'
      },
      { 
        id: 'ko_korean', 
        name: 'Korean - Choi', 
        nameAr: 'الكورية - تشوي',
        language: 'Korean',
        languageCode: 'ko',
        filename: 'ko.korean.json'
      },
      { 
        id: 'ha_gumi', 
        name: 'Hausa - Gumi', 
        nameAr: 'الهوسا - غومي',
        language: 'Hausa',
        languageCode: 'ha',
        filename: 'ha.gumi.json'
      },
      { 
        id: 'sw_barwani', 
        name: 'Swahili - Barwani', 
        nameAr: 'السواحيلية - بارواني',
        language: 'Swahili',
        languageCode: 'sw',
        filename: 'sw.barwani.json'
      }
    ];
    res.json(translations);
  } catch (error) {
    console.error('Error getting translations:', error);
    res.status(500).json({ error: 'Failed to get translations' });
  }
});

// Generate live preview video (short version for real-time preview)
// FINAL PREVIEW CODE - Replace your entire /api/preview-video route with this

// FINAL PREVIEW CODE - Replace your entire /api/preview-video route with this

app.post('/api/preview-video', async (req, res) => {
  try {
      console.log('Generating live preview...');

      const {
          surah, ayah, ayahTo, textColor, fontSize, fontFamily, orientation, backgroundFilename, translation
      } = req.body;

      // --- 1. Validation and Setup ---
      if (!surah || !ayah || !backgroundFilename) {
          return res.status(400).json({ error: 'Missing required parameters' });
      }
      const surahNum = parseInt(surah);
      const ayahNum = parseInt(ayah);
      if (isNaN(surahNum) || isNaN(ayahNum)) {
          return res.status(400).json({ error: 'Invalid surah or ayah numbers' });
      }

      const previewId = uuidv4();
      const previewDuration = 3;
      const videoWidth = orientation === 'portrait' ? 1080 : orientation === 'square' ? 1080 : 1920;
      const videoHeight = orientation === 'portrait' ? 1920 : orientation === 'square' ? 1080 : 1080;
      const maxTextWidth = Math.floor(videoWidth * 0.85);
      const textColorValue = textColor || '#ffffff';
      const baseFontSize = fontSize || Math.floor(videoHeight * 0.045);

      fs.ensureDirSync(path.join(__dirname, 'temp'));

      const fontMapping = {
          'Al Mushaf': 'Al Majeed Quranic Font',
          'Uthmanic Hafs': 'KFGQPC HAFS Uthmanic Script'
      };
      const selectedFont = fontMapping[fontFamily] || fontFamily;
// Language-specific font mapping for translations
const languageFontMapping = {
  'en_sahih': 'Arial',
  'ur_jalandhry': 'Arial',
  'tr_diyanet': 'Arial',
  'fr_hameidullah': 'Arial',
  'es_cortes': 'Arial',
  'de_bubenheim': 'Arial',
  'id_indonesian': 'Arial',
  'fa_ansarian': 'Arial',
'bn_bengali': 'Noto Sans Bengali, Lohit Bengali, Mukta, Arial, sans-serif',
  'zh_jian': 'Microsoft YaHei, SimSun, Arial',
  'ru_kuliev': 'Arial',
  'ja_japanese': 'Meiryo, Yu Gothic, Arial',
  'ms_basmeih': 'Arial',
  'it_piccardo': 'Arial',
  'pt_elhayek': 'Arial',
  'nl_keyzer': 'Arial',
  'hi_hindi': 'Nirmala UI, Segoe UI, Arial',
  'ta_tamil': 'Nirmala UI, Segoe UI, Arial',
  'th_thai': 'Leelawadee UI, Microsoft Sans Serif, Arial',
  'ja_japanese': 'Meiryo, Yu Gothic, Arial',
'ko_korean': 'Noto Sans CJK KR, sans-serif', // i installed this font on my system on linux
  'ha_gumi': 'Arial',
  'sw_barwani': 'Arial'
};
      // --- 2. Fetch and Prepare Text ---
      const quranData = JSON.parse(fs.readFileSync('./quran-uthmani.json', 'utf8'));
      
      // Load translation based on selected translation or default to Sahih International
      const translationId = translation || 'en_sahih';
      const translationFilename = getTranslationFilename(translationId);
      const translationData = JSON.parse(fs.readFileSync(`./${translationFilename}`, 'utf8'));

      const startVerse = parseInt(ayahNum);
      const endVerse = ayahTo ? parseInt(ayahTo) : startVerse;
      let arabicText = '';
      let translationText = '';

      for (let i = startVerse; i <= endVerse; i++) {
          const verse = quranData.data.surahs[surahNum - 1].ayahs[i - 1];
          const translation = translationData.data.surahs[surahNum - 1].ayahs[i - 1];
          if (arabicText) arabicText += ' ';
          if (translationText) translationText += ' ';
          arabicText += verse.text;
          translationText += translation.text;
      }
      arabicText = arabicText.normalize('NFC').replace(/ٱ/g, 'ا');
      
      // --- 3. Calculate Optimal Text Size using the helper function ---
      const arabicTextHeight = Math.floor(videoHeight * 0.2);
      
      // Dynamic height allocation based on text length - increase for very long verses
      let translationHeightPercent = 0.15; // Default 15%
      if (translationText.length > 1000) {
        translationHeightPercent = 0.25; // 25% for very long verses
        console.log(`📏 Very long verse detected (${translationText.length} chars) - using 25% height allocation`);
      } else if (translationText.length > 500) {
        translationHeightPercent = 0.2; // 20% for long verses
        console.log(`📏 Long verse detected (${translationText.length} chars) - using 20% height allocation`);
      }
      const translationTextHeight = Math.floor(videoHeight * translationHeightPercent);

      // Call the new shared function to get the correct font size and wrapped lines
      const arabicTextData = calculateOptimalTextSize(arabicText, selectedFont, baseFontSize, maxTextWidth, arabicTextHeight);
      
      // Get appropriate font for the selected translation
      const translationFont = languageFontMapping[translationId] || 'Arial';
      const translationTextData = calculateOptimalTextSize(translationText, translationFont, Math.floor(baseFontSize * 0.7), maxTextWidth, translationTextHeight);
      
      const arabicBlockHeight = arabicTextData.fontSize * 1.3 * arabicTextData.lines.length;
      const translationBlockHeight = translationTextData.fontSize * 1.3 * translationTextData.lines.length;

      // --- 4. Create Dynamically-Sized Text Canvases ---
      const tempArabicTextPath = path.join(__dirname, 'temp', `${previewId}_arabic.png`);
      const arabicCanvas = createCanvas(videoWidth, arabicBlockHeight);
      const arabicCtx = arabicCanvas.getContext('2d');
      arabicCtx.font = `${arabicTextData.fontSize}px "${selectedFont}"`; // Use calculated font size
      arabicCtx.fillStyle = textColorValue;
      arabicCtx.textAlign = 'center';
      arabicCtx.textBaseline = 'middle';
      arabicTextData.lines.forEach((line, index) => { // Use calculated lines
          const y = (index * arabicTextData.fontSize * 1.3) + (arabicTextData.fontSize * 1.3 / 2);
          arabicCtx.fillText(line, videoWidth / 2, y);
      });
      fs.writeFileSync(tempArabicTextPath, arabicCanvas.toBuffer('image/png'));

      const tempTranslationTextPath = path.join(__dirname, 'temp', `${previewId}_translation.png`);
      const translationCanvas = createCanvas(videoWidth, translationBlockHeight);
      const translationCtx = translationCanvas.getContext('2d');
      
      translationCtx.font = `${translationTextData.fontSize}px "${translationFont}"`; // Use calculated font size
      translationCtx.fillStyle = textColorValue;
      translationCtx.textAlign = 'center';
      translationCtx.textBaseline = 'middle';
      console.log(`🎨 Rendering ${translationTextData.lines.length} translation lines:`);
      translationTextData.lines.forEach((line, index) => { // Use calculated lines
          const y = (index * translationTextData.fontSize * 1.3) + (translationTextData.fontSize * 1.3 / 2);
          console.log(`  Line ${index + 1}: "${line.substring(0, 50)}..." at y=${y}`);
          translationCtx.fillText(line, videoWidth / 2, y);
      });
      fs.writeFileSync(tempTranslationTextPath, translationCanvas.toBuffer('image/png'));
      
      // --- 5. Calculate Final Positions & Create Overlays ---
      const textGap = Math.floor(videoHeight * 0.03);
      const totalContentHeight = arabicBlockHeight + textGap + translationBlockHeight;
      const arabicTopPosition = (videoHeight - totalContentHeight) / 2;
      const translationTopPosition = arabicTopPosition + arabicBlockHeight + textGap;

      // ... The rest of the preview route remains the same, as it correctly uses these calculated positions ...
      // ... (unified overlay, watermark, ffmpeg command, etc.) ...

      const overlayPadding = Math.floor(videoHeight * 0.05);
      const overlayX = (videoWidth * 0.05);
      const overlayY = arabicTopPosition - overlayPadding;
      const overlayWidth = videoWidth * 0.9;
      const overlayHeight = totalContentHeight + (overlayPadding * 2);
      
      const unifiedOverlayCanvas = createCanvas(videoWidth, videoHeight);
      const unifiedOverlayCtx = unifiedOverlayCanvas.getContext('2d');
      unifiedOverlayCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      unifiedOverlayCtx.beginPath();
      unifiedOverlayCtx.roundRect(overlayX, overlayY, overlayWidth, overlayHeight, 25);
      unifiedOverlayCtx.fill();
      const tempUnifiedOverlayPath = path.join(__dirname, 'temp', `${previewId}_overlay.png`);
      fs.writeFileSync(tempUnifiedOverlayPath, unifiedOverlayCanvas.toBuffer('image/png'));
      
      const watermarkCanvas = createCanvas(videoWidth, videoHeight);
      const watermarkCtx = watermarkCanvas.getContext('2d');
      const tempWatermarkPath = path.join(__dirname, 'temp', `${previewId}_watermark.png`);

      const brandText = 'Made on SakinahTime.com';
      const watermarkPadding = Math.floor(videoWidth * 0.03);
      const brandFontSize = Math.max(18, Math.floor(videoWidth * 0.015));
      const infoFontSize = Math.max(22, Math.floor(videoWidth * 0.02));

      const surahName = quranData.data.surahs[surahNum - 1].englishName;
      const surahWithVerse = endVerse > startVerse ?
          `${surahName}, Verses ${startVerse}-${endVerse}` :
          `${surahName}, Verse ${startVerse}`;

      watermarkCtx.font = `600 ${brandFontSize}px "Inter", "Lato", sans-serif`;
      watermarkCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      watermarkCtx.textAlign = 'right';
      watermarkCtx.textBaseline = 'bottom';
      watermarkCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      watermarkCtx.shadowBlur = 8;
      watermarkCtx.shadowOffsetY = 2;
      watermarkCtx.shadowOffsetX = 0;
      watermarkCtx.fillText(brandText, videoWidth - watermarkPadding, videoHeight - watermarkPadding);

      watermarkCtx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      watermarkCtx.shadowBlur = 6;
      watermarkCtx.font = `400 ${infoFontSize}px "Inter", "Lato", sans-serif`;
      watermarkCtx.textAlign = 'left';
      watermarkCtx.textBaseline = 'top';
      watermarkCtx.fillText(surahWithVerse, watermarkPadding, watermarkPadding);

      fs.writeFileSync(tempWatermarkPath, watermarkCanvas.toBuffer('image/png'));

      const backgroundPath = path.join(__dirname, 'videos', backgroundFilename);
      
      if (!fs.existsSync(backgroundPath)) {
          throw new Error(`Background video not found: ${backgroundPath}`);
      }

      const command = ffmpeg()
          .input(backgroundPath)
          .inputOptions(['-stream_loop', '-1', '-t', previewDuration.toString()])
          .input(tempUnifiedOverlayPath)
          .input(tempArabicTextPath)
          .input(tempTranslationTextPath)
          .input(tempWatermarkPath)
          .complexFilter([
              `[0:v]scale=${videoWidth}:${videoHeight}[bg]`,
              `[bg][1:v]overlay=0:0[bg_overlay]`,
              `[bg_overlay][2:v]overlay=(W-w)/2:${arabicTopPosition}[with_arabic]`,
              `[with_arabic][3:v]overlay=(W-w)/2:${translationTopPosition}[with_translation]`,
              `[with_translation][4:v]overlay=0:0[final]`
          ])
          .outputOptions(['-map', '[final]', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-an'])
          .output(path.join(__dirname, 'previews', `${previewId}.mp4`));

      fs.ensureDirSync(path.join(__dirname, 'previews'));

      await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
              reject(new Error('FFmpeg timeout after 30 seconds'));
          }, 30000);

          command
              .on('end', () => {
                  clearTimeout(timeout);
                  resolve();
              })
              .on('error', (err) => {
                  clearTimeout(timeout);
                  reject(err);
              })
              .run();
      });

      fs.unlinkSync(tempArabicTextPath);
      fs.unlinkSync(tempTranslationTextPath);
      fs.unlinkSync(tempUnifiedOverlayPath);
      fs.unlinkSync(tempWatermarkPath);

      res.json({
          success: true,
          previewUrl: `${req.protocol}://${req.get('host')}/api/previews/${previewId}.mp4`
      });

  } catch (error) {
      console.error('Preview generation error:', error);
      res.status(500).json({ error: 'Failed to generate preview' });
  }
});
// Get available video backgrounds only
app.get('/api/backgrounds', (req, res) => {
  const videoDir = path.join(__dirname, 'videos');
  let backgrounds = [];

  // Only videos
  if (fs.existsSync(videoDir)) {
    const videoFiles = fs.readdirSync(videoDir).filter(f => f.match(/\.(mp4|webm|mov|avi)$/i));
    backgrounds = videoFiles.map(f => ({
      type: 'video',
      filename: f,
      displayName: f.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
      thumbnailUrl: `${req.protocol}://${req.get('host')}/api/thumbnail/${f}`
    }));
  }

  res.json(backgrounds);
});

// Generate and serve video thumbnails
app.get('/api/thumbnail/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, 'videos', filename);
  const thumbnailsDir = path.join(__dirname, 'thumbnails');
  const thumbnailPath = path.join(thumbnailsDir, `${filename}.jpg`);
  console.log("thumbnailPath", thumbnailPath)
  console.log("videoPath", videoPath)
  // Ensure thumbnails directory exists
  fs.ensureDirSync(thumbnailsDir);
  // Check if thumbnail already exists
  if (fs.existsSync(thumbnailPath)) {
    res.sendFile(thumbnailPath);
    return;
  }

  // Check if video exists
  if (!fs.existsSync(videoPath)) {
    res.status(404).send('Video not found');
    return;
  }

  // Generate thumbnail using FFmpeg
  ffmpeg(videoPath)
    .screenshots({
      timestamps: ['2'], // Take screenshot at 2 seconds
      filename: `${filename}.jpg`,
      folder: thumbnailsDir,
      size: '320x180' // 16:9 aspect ratio thumbnail
    })
    .on('end', () => {
      console.log('Thumbnail generated:', thumbnailPath);
      res.sendFile(thumbnailPath);
    })
    .on('error', (err) => {
      console.error('Error generating thumbnail:', err);
      res.status(500).send('Error generating thumbnail');
    });
});

// Serve preview videos
app.get('/api/previews/:filename', (req, res) => {
  const filename = req.params.filename;
  const previewPath = path.join(__dirname, 'previews', filename);
  
  console.log(`📹 Preview video requested: ${filename}`);
  console.log(`📁 Looking for file at: ${previewPath}`);
  console.log(`📋 File exists: ${fs.existsSync(previewPath)}`);
  
  if (fs.existsSync(previewPath)) {
    // Set proper headers for video serving
    res.set({
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });
    res.sendFile(previewPath);
  } else {
    console.log(`❌ Preview not found: ${previewPath}`);
    res.status(404).send('Preview not found');
  }
});

// Get verse audio range
app.get('/api/verse-audio-range/:surah/:ayahFrom/:ayahTo/:reciter', async (req, res) => {
  try {
    const { surah, ayahFrom, ayahTo, reciter } = req.params;
    
    const reciterMap = {
      'alafasy': 'Alafasy',
      'abdulbasit': 'AbdulBasit_AbdulSamad',
      'saad': 'Saad_Al_Ghamidi',
      'maher': 'Maher_Al_Muaiqly',
      'hudhaify': 'Hudhaify',
      'minshawi': 'Minshawi',
      'sudais': 'Sudais'
    };

    const reciterName = reciterMap[reciter] || 'Alafasy';
    const audioFiles = [];
    
    // Collect audio files for the range
    for (let ayah = parseInt(ayahFrom); ayah <= parseInt(ayahTo); ayah++) {
      const paddedSurah = surah.toString().padStart(3, '0');
      const paddedAyah = ayah.toString().padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/${reciterName}/${paddedSurah}${paddedAyah}.mp3`;
      audioFiles.push(audioUrl);
    }
    
    res.json({ 
      audioUrls: audioFiles,
      reciter: reciterName,
      verses: `${ayahFrom}-${ayahTo}`
    });
  } catch (error) {
    console.error('Error getting verse audio range:', error);
    res.status(500).json({ error: 'Failed to get verse audio range' });
  }
});

// Get verse audio
app.get('/api/verse-audio/:surah/:ayah/:reciter', async (req, res) => {
  try {
    const { surah, ayah, reciter } = req.params;
    
    // Map short reciter IDs to full directory names (same as video generation)
    let reciterDirectory;
    switch (reciter) {
      case 'abdul_basit':
        reciterDirectory = 'Abdul_Basit_Murattal_192kbps';
        break;
      case 'alafasy':
        reciterDirectory = 'Alafasy_128kbps';
        break;
      case 'sudais':
        reciterDirectory = 'Abdurrahmaan_As-Sudais_192kbps';
        break;
      case 'abdullah_basfar':
        reciterDirectory = 'Abdullah_Basfar_192kbps';
        break;
      case 'abu_bakr_shatri':
        reciterDirectory = 'Abu_Bakr_Ash-Shaatree_128kbps';
        break;
      case 'ahmed_neana':
        reciterDirectory = 'Ahmed_Neana_128kbps';
        break;
      case 'ahmed_ajamy':
        reciterDirectory = 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net';
        break;
      case 'akram_alaqimy':
        reciterDirectory = 'Akram_AlAlaqimy_128kbps';
        break;
      case 'ali_hajjaj':
        reciterDirectory = 'Ali_Hajjaj_AlSuesy_128kbps';
        break;
      case 'hani_rifai':
        reciterDirectory = 'Hani_Rifai_192kbps';
        break;
      case 'hudhaify':
        reciterDirectory = 'Hudhaify_128kbps';
        break;
      case 'khalid_qahtani':
        reciterDirectory = 'Khaalid_Abdullaah_al-Qahtaanee_192kbps';
        break;
      case 'minshawy':
        reciterDirectory = 'Minshawy_Murattal_128kbps';
        break;
      case 'tablaway':
        reciterDirectory = 'Mohammad_al_Tablaway_128kbps';
        break;
      case 'muhsin_qasim':
        reciterDirectory = 'Muhsin_Al_Qasim_192kbps';
        break;
      case 'abdullaah_juhaynee':
        reciterDirectory = 'Abdullaah_3awwaad_Al-Juhaynee_128kbps';
        break;
      case 'husary':
        reciterDirectory = 'Husary_128kbps';
        break;
      case 'ghamadi':
        reciterDirectory = 'Ghamadi_40kbps';
        break;
      case 'shuraim':
        reciterDirectory = 'Saood_ash-Shuraym_128kbps';
        break;
      // Legacy support for full directory names (in case they're passed directly)
      case 'Abdul_Basit_Murattal_192kbps':
      case 'Abdullaah_3awwaad_Al-Juhaynee_128kbps':
      case 'Abdullah_Basfar_192kbps':
      case 'Abdurrahmaan_As-Sudais_192kbps':
      case 'Abu_Bakr_Ash-Shaatree_128kbps':
      case 'Ahmed_Neana_128kbps':
      case 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net':
      case 'Akram_AlAlaqimy_128kbps':
      case 'Ali_Hajjaj_AlSuesy_128kbps':
      case 'Hani_Rifai_192kbps':
      case 'Hudhaify_128kbps':
      case 'Khaalid_Abdullaah_al-Qahtaanee_192kbps':
      case 'Minshawy_Murattal_128kbps':
      case 'Mohammad_al_Tablaway_128kbps':
      case 'Muhsin_Al_Qasim_192kbps':
        reciterDirectory = reciter; // Use as-is if it's already a full directory name
        break;
      default:
        reciterDirectory = 'Abdul_Basit_Murattal_192kbps';
    }
    
    // Construct audio URL
    const surahStr = surah.toString().padStart(3, '0');
    const ayahStr = ayah.toString().padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/${reciterDirectory}/${surahStr}${ayahStr}.mp3`;
    
    res.json({ audioUrl });
  } catch (error) {
    console.error('Error getting verse audio:', error);
    res.status(500).json({ error: 'Failed to get verse audio' });
  }
});

// Generate video
app.post('/api/generate-video', upload.single('background'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const {
      surah,
      ayah,
      ayahTo,
      reciter,
      backgroundType,
      backgroundFilename,
      backgroundId, // fallback for old clients
      customBackground,
      textColor,
      fontSize,
      fontFamily,
      orientation,
      duration,
      quality,
      translation
    } = req.body;
    
    console.log('Extracted values:');
    console.log('reciter:', reciter);
    console.log('backgroundType:', backgroundType);
    console.log('backgroundFilename:', backgroundFilename);
    console.log('backgroundId:', backgroundId);
    console.log('orientation:', orientation);
    console.log('fontFamily:', fontFamily);
    console.log('fontSize:', fontSize);
    console.log('textColor:', textColor);

    const videoId = uuidv4();
    const outputPath = path.join(__dirname, 'generated', `${videoId}.mp4`);
    // Audio path will be set after processing verse range
    const tempImagePath = path.join(__dirname, 'temp', `${videoId}_background.jpg`);

    // Get verse text and translation - handle verse ranges
    const quranData = JSON.parse(fs.readFileSync('quran-uthmani.json', 'utf8'));
    
    const startVerse = parseInt(ayah);
    const endVerse = ayahTo ? parseInt(ayahTo) : startVerse;
    
    // Store individual verses for sequential display
    const verses = [];
    
    for (let i = startVerse; i <= endVerse; i++) {
      const verse = quranData.data.surahs[surah - 1].ayahs[i - 1];
      if (!verse) {
        return res.status(404).json({ error: `Verse ${i} not found` });
      }
      verses.push({ number: i, text: verse.text });
    }
    
    console.log(`📖 Verse range ${startVerse}-${endVerse} loaded: ${verses.length} verses`);
    
    // For sequential display, we'll create individual text overlays for each verse
    // But first, let's process each verse's text individually
    for (let i = 0; i < verses.length; i++) {
      let verseText = verses[i].text;
      
      // Apply enhanced Unicode normalization to each verse
      verseText = verseText.normalize('NFC');
      
      // Enhanced character replacements for better rendering
      verseText = verseText
        .replace(/ٱلْءَاخِرَةِ/g, 'الْآخِرَةِ') // Fix for "الآخرة"
        .replace(/وَبِٱلْءَاخِرَةِ/g, 'وَبِالْآخِرَةِ') // Fix for "وبالآخرة"
        .replace(/بِٱلْءَاخِرَةِ/g, 'بِالْآخِرَةِ') // Fix for "بالآخرة"
        .replace(/ءَا/g, 'آ') // Hamza followed by Alif -> Alif Madda
        .replace(/ءُا/g, 'ؤا') // Hamza with damma followed by Alif
        .replace(/ءِا/g, 'ئا') // Hamza with kasra followed by Alif
        .replace(/\u0621\u0627/g, '\u0623') // Standalone Hamza + Alif -> Hamza on Alif
        .replace(/\u0621\u064E\u0627/g, '\u0623') // Hamza + Fatha + Alif -> Hamza on Alif
        .replace(/\u0621[\u064E\u064F\u0650\u0652]*\u0627/g, '\u0623') // Hamza + any diacritics + Alif -> Hamza on Alif
        .replace(/\u0621[\u064E\u064F\u0650\u0652]*\u0625/g, '\u0625') // Hamza + diacritics + Hamza-under-Alif
        .replace(/\u0621[\u064E\u064F\u0650\u0652]*\u0622/g, '\u0622') // Hamza + diacritics + Alif-Madda
        .replace(/ٱلْءَ/g, 'الْآ'); // General fix for hamza-alif in definite articles
      
      verses[i].processedText = verseText;
    }
    
    // Load translations for all verses
    const translationId = translation || 'en_sahih';
    const translationFilename = getTranslationFilename(translationId);
    const translationData = JSON.parse(fs.readFileSync(translationFilename, 'utf8'));
    
    for (let i = 0; i < verses.length; i++) {
      const verseNumber = verses[i].number;
      const translation = translationData.data.surahs[surah - 1].ayahs[verseNumber - 1];
      if (!translation) {
        return res.status(404).json({ error: `Translation for verse ${verseNumber} not found` });
      }
      verses[i].translation = translation.text;
    }
    
    console.log(`🎬 Creating sequential video for ${verses.length} verses with individual timing`);
    
    // Audio download will happen first, then we'll create verse timings and overlays
    
    // Download audio - handle verse ranges
    const audioFiles = [];
    for (let i = startVerse; i <= endVerse; i++) {
      const surahStr = surah.toString().padStart(3, '0');
      const ayahStr = i.toString().padStart(3, '0');
      audioFiles.push({ verse: i, surahStr, ayahStr });
    }
    
    console.log(`Downloading ${audioFiles.length} audio file(s) for verses ${startVerse}-${endVerse}`);
    
    // Map frontend reciter names to API directory names
    let reciterDirectory;
    switch (reciter) {
      case 'abdul_basit':
        reciterDirectory = 'Abdul_Basit_Murattal_192kbps';
        break;
      case 'alafasy':
        reciterDirectory = 'Alafasy_128kbps';
        break;
      case 'sudais':
        reciterDirectory = 'Abdurrahmaan_As-Sudais_192kbps';
        break;
      case 'abdullah_basfar':
        reciterDirectory = 'Abdullah_Basfar_192kbps';
        break;
      case 'abu_bakr_shatri':
        reciterDirectory = 'Abu_Bakr_Ash-Shaatree_128kbps';
        break;
      case 'ahmed_neana':
        reciterDirectory = 'Ahmed_Neana_128kbps';
        break;
      case 'ahmed_ajamy':
        reciterDirectory = 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net';
        break;
      case 'akram_alaqimy':
        reciterDirectory = 'Akram_AlAlaqimy_128kbps';
        break;
      case 'ali_hajjaj':
        reciterDirectory = 'Ali_Hajjaj_AlSuesy_128kbps';
        break;
      case 'hani_rifai':
        reciterDirectory = 'Hani_Rifai_192kbps';
        break;
      case 'hudhaify':
        reciterDirectory = 'Hudhaify_128kbps';
        break;
      case 'khalid_qahtani':
        reciterDirectory = 'Khaalid_Abdullaah_al-Qahtaanee_192kbps';
        break;
      case 'minshawy':
        reciterDirectory = 'Minshawy_Murattal_128kbps';
        break;
      case 'tablaway':
        reciterDirectory = 'Mohammad_al_Tablaway_128kbps';
        break;
      case 'muhsin_qasim':
        reciterDirectory = 'Muhsin_Al_Qasim_192kbps';
        break;
      case 'abdullaah_juhaynee':
        reciterDirectory = 'Abdullaah_3awwaad_Al-Juhaynee_128kbps';
        break;
      case 'husary':
        reciterDirectory = 'Husary_128kbps';
        break;
      case 'ghamadi':
        reciterDirectory = 'Ghamadi_40kbps';
        break;
      case 'shuraim':
        reciterDirectory = 'Saood_ash-Shuraym_128kbps';
        break;
      default:
        reciterDirectory = 'Abdul_Basit_Murattal_192kbps';
    }
    
    // Download audio for all verses in range and get their durations
    const audioSegments = [];
    const surahStr = surah.toString().padStart(3, '0');
    
    for (const verse of verses) {
      const verseAyahStr = verse.number.toString().padStart(3, '0');
      const verseAudioUrl = `https://everyayah.com/data/${reciterDirectory}/${surahStr}${verseAyahStr}.mp3`;
      const tempVerseAudioPath = path.join(__dirname, 'temp', `${videoId}_audio_${verse.number}.mp3`);
      
      console.log(`Downloading audio for verse ${verse.number} from:`, verseAudioUrl);
      
      try {
        const audioResponse = await axios({
          method: 'GET',
          url: verseAudioUrl,
          responseType: 'stream',
          timeout: 30000 // 30 second timeout
        });
        
        const audioWriter = fs.createWriteStream(tempVerseAudioPath);
        audioResponse.data.pipe(audioWriter);

        await new Promise((resolve, reject) => {
          audioWriter.on('finish', () => {
            console.log(`Audio downloaded successfully for verse ${verse.number}:`, tempVerseAudioPath);
            resolve();
          });
          audioWriter.on('error', (error) => {
            console.error('Error writing audio file:', error);
            reject(error);
          });
        });
        
        // Get audio duration for this verse
        const duration = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(tempVerseAudioPath, (err, metadata) => {
            if (err) reject(err);
            else resolve(metadata.format.duration);
          });
        });
        
        audioSegments.push({
          verse: verse.number,
          path: tempVerseAudioPath,
          duration: duration,
          arabicText: verse.processedText,
          translation: verse.translation
        });
        
        console.log(`Verse ${verse.number} audio duration: ${duration} seconds`);
      } catch (error) {
        console.error(`Error downloading audio for verse ${verse.number}:`, error.message);
        return res.status(500).json({ error: `Failed to download audio for verse ${verse.number}` });
      }
    }
    
    // Concatenate all audio files
    const finalAudioPath = path.join(__dirname, 'temp', `${videoId}_audio.mp3`);
    
          if (audioSegments.length === 1) {
        // Single verse - just rename the file
        fs.renameSync(audioSegments[0].path, finalAudioPath);
    } else {
      // Multiple verses - concatenate them
      console.log('Concatenating audio files...');
      const audioConcat = ffmpeg();
      audioSegments.forEach(segment => {
        audioConcat.input(segment.path);
      });
      
      await new Promise((resolve, reject) => {
        audioConcat
          .on('end', () => {
            console.log('Audio concatenation completed');
            // Clean up individual audio files
            audioSegments.forEach(segment => {
              if (fs.existsSync(segment.path)) {
                fs.unlinkSync(segment.path);
              }
            });
            resolve();
          })
          .on('error', reject)
          .mergeToFile(finalAudioPath);
      });
    }

    // Now that we have all audio segments with durations, calculate verse timings
    console.log(`🎬 Creating sequential display for ${audioSegments.length} verses`);
    
    let cumulativeTime = 0;
    const verseTimings = [];
    
    // Calculate timing for each verse based on audio durations
    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      const startTime = cumulativeTime;
      const endTime = cumulativeTime + segment.duration;
      
      verseTimings.push({
        verse: segment.verse,
        startTime: startTime,
        endTime: endTime,
        duration: segment.duration,
        arabicText: segment.arabicText,
        translation: segment.translation
      });
      
      cumulativeTime = endTime;
      console.log(`📍 Verse ${segment.verse}: ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s (${segment.duration.toFixed(2)}s)`);
    }
    
    console.log(`🕐 Total video duration: ${cumulativeTime.toFixed(2)} seconds`);

    // Get video background path (videos only)
    let backgroundPath;
    let isVideoBackground = true; // Always video now
    
    if (backgroundType === 'video' && backgroundFilename) {
      backgroundPath = path.join(__dirname, 'videos', backgroundFilename);
    } else {
      // Fallback - use first available video
      const videoDir = path.join(__dirname, 'videos');
      if (fs.existsSync(videoDir)) {
        const videoFiles = fs.readdirSync(videoDir).filter(f => f.match(/\.(mp4|webm|mov|avi)$/i));
        if (videoFiles.length > 0) {
          backgroundPath = path.join(videoDir, videoFiles[0]);
        } else {
          return res.status(400).json({ error: 'No video backgrounds available' });
        }
      } else {
        return res.status(400).json({ error: 'Videos directory not found' });
      }
    }

    console.log('Background path:', backgroundPath);
    console.log('Starting video generation with FFmpeg...');
    console.log('Audio path:', finalAudioPath);
    const tempAudioPath = finalAudioPath; // For compatibility with existing code
    console.log('Output path:', outputPath);
    
    // Set environment variables to avoid fontconfig issues on Windows
    process.env.FONTCONFIG_PATH = '';
    process.env.FONTCONFIG_FILE = '';
    
    // Get audio duration first to ensure exact video length
    console.log('Getting audio duration...');
    const audioDuration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(tempAudioPath, (err, metadata) => {
        if (err) {
          console.error('Error getting audio duration:', err);
          reject(err);
        } else {
          const duration = metadata.format.duration;
          console.log('Audio duration:', duration, 'seconds');
          resolve(duration);
        }
      });
    });

    // Create video with FFmpeg - with scale filter to ensure H.264 compatibility
    console.log('Creating FFmpeg command...');
    let command = ffmpeg();
    
    // Handle background input with proper looping
    if (!isVideoBackground) {
      // For images, loop and set duration to match audio
      command = command.input(backgroundPath).inputOptions(['-loop', '1', `-t`, `${audioDuration}`]);
    } else {
      // For videos, loop the video to match audio duration
      command = command.input(backgroundPath).inputOptions(['-stream_loop', '-1', `-t`, `${audioDuration}`]);
    }
    
    command = command.input(tempAudioPath)
      .outputOptions([
        '-c:v libx264',
        '-preset medium',
        '-crf 18',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-movflags +faststart'
      ])
      .output(outputPath);
    
    // Determine video dimensions based on orientation
    const selectedOrientation = orientation || 'landscape';
    let videoWidth, videoHeight;
    
    switch (selectedOrientation) {
      case 'portrait':
        videoWidth = 1080;
        videoHeight = 1920;
        break;
      case 'landscape':
      default:
        videoWidth = 1920;
        videoHeight = 1080;
        break;
    }
    
    console.log('Video orientation:', selectedOrientation);
    console.log('Video dimensions:', `${videoWidth}x${videoHeight}`);

      // Create text overlay images using Canvas with responsive sizing
  // Scale font size based on video height for better readability
  const baseFontSize = fontSize || Math.floor(videoHeight * 0.045); // 4.5% of video height
  const textColorValue = textColor || '#ffffff';
    
    // Calculate responsive dimensions for text areas
    const maxTextWidth = Math.floor(videoWidth * 0.85); // 85% of video width
    const arabicTextHeight = Math.floor(videoHeight * 0.2); // 20% for Arabic
    
    // Dynamic height allocation based on text length - increase for very long verses
    // Use the first verse's translation to determine height allocation
    const firstVerseTranslation = verseTimings[0]?.translation || '';
    let translationHeightPercent = 0.15; // Default 15%
    if (firstVerseTranslation.length > 1000) {
      translationHeightPercent = 0.25; // 25% for very long verses
      console.log(`📏 Video gen: Very long verse detected (${firstVerseTranslation.length} chars) - using 25% height allocation`);
    } else if (firstVerseTranslation.length > 500) {
      translationHeightPercent = 0.2; // 20% for long verses
      console.log(`📏 Video gen: Long verse detected (${firstVerseTranslation.length} chars) - using 20% height allocation`);
    }
    const translationTextHeight = Math.floor(videoHeight * translationHeightPercent);
    
    console.log(`Text constraints - Width: ${maxTextWidth}, Arabic height: ${arabicTextHeight}, Translation height: ${translationTextHeight}`);
    
    // Function to calculate optimal font size and handle text wrapping
    
    // Map user-friendly font names to correct internal names (with system font fallbacks)
    const fontMapping = {
      'Al Mushaf': 'Al Majeed Quranic Font',
      'Uthmanic Hafs': 'KFGQPC HAFS Uthmanic Script'
    };
    
    // Fallback mapping to system fonts if custom fonts fail
    const systemFontFallback = {
      'KFGQPC HAFS Uthmanic Script': 'Traditional Arabic',
      'Al Majeed Quranic Font': 'Arabic Typesetting',
      'KFGQPC Uthman Taha Naskh': 'Tahoma',
      'KFGQPC Uthmanic Script HAFS': 'Segoe UI'
    };

    // Language-specific font mapping for translations
    const languageFontMapping = {
      'en_sahih': 'Arial',
      'ur_jalandhry': 'Arial',
      'tr_diyanet': 'Arial',
      'fr_hameidullah': 'Arial',
      'es_cortes': 'Arial',
      'de_bubenheim': 'Arial',
      'id_indonesian': 'Arial',
      'fa_ansarian': 'Arial',
'bn_bengali': 'Noto Sans Bengali, Lohit Bengali, Mukta, Arial, sans-serif',
      'zh_jian': 'Microsoft YaHei, SimSun, Arial',
      'ru_kuliev': 'Arial',
      'ms_basmeih': 'Arial',
      'it_piccardo': 'Arial',
      'pt_elhayek': 'Arial',
      'nl_keyzer': 'Arial',
      'hi_hindi': 'Nirmala UI, Segoe UI, Arial',
      'ta_tamil': 'Nirmala UI, Segoe UI, Arial',
      'th_thai': 'Leelawadee UI, Microsoft Sans Serif, Arial',
      'ja_japanese': 'Meiryo, Yu Gothic, Arial',
'ko_korean': 'Noto Sans CJK KR, sans-serif', // i installed this font on my system on linux
    'ha_gumi': 'Arial',
    'sw_barwani': 'Arial'
    };
    
    const requestedFont = fontFamily || 'Uthmanic Hafs';
    let selectedFont = fontMapping[requestedFont] || requestedFont;
    
    console.log('Raw fontFamily from request:', fontFamily);
    console.log('Requested font (user-friendly):', requestedFont);
    console.log('Selected font (internal name):', selectedFont, 'Base size:', baseFontSize);
    
    // List available fonts for debugging
    const availableFonts = Object.keys(fontMapping);
    console.log('Available user-friendly fonts:', availableFonts);
    console.log('Font mapping found:', !!fontMapping[requestedFont]);
    console.log('Will try custom font:', selectedFont);
    
    // Use the font mapping directly without testing - trust node-canvas registration
    console.log(`✅ Using mapped font: ${selectedFont} (from ${requestedFont})`)
    
    // Create individual text overlays for each verse
    const verseOverlays = [];
    
    // Use first verse to determine optimal font sizing for consistency
    const firstVerse = verseTimings[0];
    const arabicTextData = calculateOptimalTextSize(firstVerse.arabicText, selectedFont, baseFontSize, maxTextWidth, arabicTextHeight);
    
    // Get appropriate font for the selected translation
    const translationFont = languageFontMapping[translationId] || 'Arial';
    const translationTextData = calculateOptimalTextSize(firstVerse.translation, translationFont, Math.floor(baseFontSize * 0.7), maxTextWidth, translationTextHeight);
    
    console.log(`📏 Using consistent font sizes: Arabic ${arabicTextData.fontSize}px, Translation ${translationTextData.fontSize}px`);
    
    // Create text overlays for each verse
    for (let i = 0; i < verseTimings.length; i++) {
      const timing = verseTimings[i];
      const verseNum = timing.verse;
      
      const tempArabicTextPath = path.join(__dirname, 'temp', `${videoId}_arabic_v${verseNum}.png`);
      const tempTranslationTextPath = path.join(__dirname, 'temp', `${videoId}_translation_v${verseNum}.png`);
      const tempBlackOverlayPath = path.join(__dirname, 'temp', `${videoId}_black_overlay_v${verseNum}.png`);
      
      console.log(`🎨 Creating text overlays for verse ${verseNum}`);
      
      // Pre-calculate Arabic text wrapping FIRST (needed for both overlay sizing and text drawing)
      const arabicCtxTemp = createCanvas(100, 100).getContext('2d');
      arabicCtxTemp.font = `${arabicTextData.fontSize}px "${selectedFont}"`;
      
      const arabicWords = timing.arabicText.split(' ');
      const arabicWrappedLines = [];
      let currentArabicLine = '';
      
      for (const word of arabicWords) {
        const testLine = currentArabicLine ? `${currentArabicLine} ${word}` : word;
        const testWidth = arabicCtxTemp.measureText(testLine).width;
        
        if (testWidth <= maxTextWidth || !currentArabicLine) {
          currentArabicLine = testLine;
        } else {
          arabicWrappedLines.push(currentArabicLine);
          currentArabicLine = word;
        }
      }
      if (currentArabicLine) arabicWrappedLines.push(currentArabicLine);
      
      console.log(`📏 Arabic text will wrap to ${arabicWrappedLines.length} lines for verse ${verseNum}`);
      
      // Create Arabic text image for this verse
      const arabicCanvas = createCanvas(videoWidth, arabicTextHeight);
      const arabicCtx = arabicCanvas.getContext('2d');
      
      // Set font and style for Arabic text
      arabicCtx.font = `${arabicTextData.fontSize}px "${selectedFont}"`;
      arabicCtx.fillStyle = textColorValue;
      arabicCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      arabicCtx.lineWidth = 2;
      arabicCtx.textAlign = 'center';
      arabicCtx.textBaseline = 'middle';
      
      // Draw Arabic text using pre-calculated wrapped lines
      const lineHeight = arabicTextData.fontSize * 1.3;
      const totalHeight = arabicWrappedLines.length * lineHeight;
      const startY = (arabicTextHeight - totalHeight) / 2 + lineHeight / 2;
      
      console.log(`🎨 Drawing ${arabicWrappedLines.length} lines of Arabic text, total height: ${totalHeight}px`);
      
      arabicWrappedLines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        arabicCtx.strokeText(line, videoWidth / 2, y);
        arabicCtx.fillText(line, videoWidth / 2, y);
      });
      
      // Save Arabic text image
      const arabicBuffer = arabicCanvas.toBuffer('image/png');
      fs.writeFileSync(tempArabicTextPath, arabicBuffer);
      
      // Create translation text image for this verse
      const translationCanvas = createCanvas(videoWidth, translationTextHeight);
      const translationCtx = translationCanvas.getContext('2d');
      
      // Calculate translation text with proper wrapping
      const translationData = calculateOptimalTextSize(timing.translation, translationFont, translationTextData.fontSize, maxTextWidth, translationTextHeight);
      
      translationCtx.font = `${translationData.fontSize}px "${translationFont}"`;
      translationCtx.fillStyle = textColorValue;
      translationCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      translationCtx.lineWidth = 2;
      translationCtx.textAlign = 'center';
      translationCtx.textBaseline = 'middle';
      
      // Draw translation text (multi-line)
      const translationLineHeight = translationData.fontSize * 1.3;
      const totalTranslationHeight = translationData.lines.length * translationLineHeight;
      const translationStartY = (translationTextHeight - totalTranslationHeight) / 2 + translationLineHeight / 2;
      
      console.log(`🎨 Video gen: Rendering ${translationData.lines.length} translation lines for verse ${timing.verse}:`);
      translationData.lines.forEach((line, index) => {
        const y = translationStartY + (index * translationLineHeight);
        console.log(`  Line ${index + 1}: "${line.substring(0, 50)}..." at y=${y}`);
        translationCtx.strokeText(line, videoWidth / 2, y);
        translationCtx.fillText(line, videoWidth / 2, y);
      });
      
      // Save translation text image
      const translationBuffer = translationCanvas.toBuffer('image/png');
      fs.writeFileSync(tempTranslationTextPath, translationBuffer);
      
      // Create rounded black overlay for this verse
      const blackOverlayCanvas = createCanvas(videoWidth, videoHeight);
      const blackOverlayCtx = blackOverlayCanvas.getContext('2d');
      
      // Calculate overlay dimensions based on pre-calculated text wrapping
      // Use the arabicWrappedLines calculated at the beginning of the loop
      const arabicHeight = arabicTextData.fontSize * 1.3 * arabicWrappedLines.length;
      const translationHeight = translationTextData.fontSize * 1.3 * translationData.lines.length;
      const textGap = 20; // Small gap between texts
      const totalContentHeight = arabicHeight + translationHeight + textGap;
      
      // Background overlay dimensions - calculate to match actual text positioning
      const overlayPadding = 60; // Increased padding for better coverage
      const overlayWidth = videoWidth * 0.9; // Slightly wider for better coverage
      
      // Calculate overlay position to match where text will actually be drawn
      const extraGap = Math.floor(videoHeight * 0.05); // Same gap used in positioning
      const arabicOffset = Math.floor(arabicHeight / 2) + extraGap;
      const translationOffset = Math.floor(translationHeight / 2) + extraGap;
      
      // Overlay should cover from top of Arabic text to bottom of translation text
      const overlayTopY = (videoHeight / 2) - arabicOffset - (arabicHeight / 2) - overlayPadding;
      const overlayBottomY = (videoHeight / 2) + translationOffset + (translationHeight / 2) + overlayPadding;
      const overlayHeight = overlayBottomY - overlayTopY;
      
      const overlayX = (videoWidth - overlayWidth) / 2;
      const overlayY = overlayTopY;
      
      // Clear background (transparent)
      blackOverlayCtx.clearRect(0, 0, videoWidth, videoHeight);
      
      // Draw rounded black overlay
      blackOverlayCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      blackOverlayCtx.beginPath();
      blackOverlayCtx.roundRect(overlayX, overlayY, overlayWidth, overlayHeight, 25);
      blackOverlayCtx.fill();
      
      // Save black overlay image
      const blackOverlayBuffer = blackOverlayCanvas.toBuffer('image/png');
      fs.writeFileSync(tempBlackOverlayPath, blackOverlayBuffer);
      
      console.log(`🎯 Verse ${verseNum} overlay: ${overlayWidth}x${overlayHeight} at (${overlayX}, ${overlayY})`);
      
      // Store overlay info for FFmpeg processing (including actual line count for positioning)
      verseOverlays.push({
        verse: verseNum,
        startTime: timing.startTime,
        endTime: timing.endTime,
        arabicPath: tempArabicTextPath,
        translationPath: tempTranslationTextPath,
        blackOverlayPath: tempBlackOverlayPath,
        arabicLineCount: arabicWrappedLines.length // Store actual line count
      });
      
      console.log(`✅ Created text overlays for verse ${verseNum}: ${timing.startTime.toFixed(2)}s - ${timing.endTime.toFixed(2)}s`);
    }
    
    console.log(`🎬 Created ${verseOverlays.length} verse overlays for sequential display`);
    
    // --- ✨ Modern & Professional Watermark ---

console.log('🏷️ Creating modern watermark overlay');
const watermarkCanvas = createCanvas(videoWidth, videoHeight);
const watermarkCtx = watermarkCanvas.getContext('2d');

// 1. Define styling constants for easy adjustments
const brandText = 'Made on SakinahTime.com';
const padding = Math.floor(videoWidth * 0.03); // 3% padding from the edge
const brandFontSize = Math.max(18, Math.floor(videoWidth * 0.015)); // Smaller, subtle size for the brand
const infoFontSize = Math.max(22, Math.floor(videoWidth * 0.02)); // A clear, readable size for the verse info

// 2. Get the verse information text
const watermarkQuranData = JSON.parse(fs.readFileSync('quran-uthmani.json', 'utf8'));
const surahName = watermarkQuranData.data.surahs[surah - 1].englishName;
const watermarkStartVerse = parseInt(ayah);
const watermarkEndVerse = ayahTo ? parseInt(ayahTo) : watermarkStartVerse;
const surahWithVerse = watermarkEndVerse > watermarkStartVerse ?
  `${surahName}, Verses ${watermarkStartVerse}-${watermarkEndVerse}` : // For a range, e.g., "Al-Baqarah, Verses 2-5"
  `${surahName}, Verse ${watermarkStartVerse}`;                  // For a single verse, e.g., "Al-Fatihah, Verse 1"

// 3. Draw the main brand watermark in the bottom-right
watermarkCtx.font = `600 ${brandFontSize}px "Inter", "Lato", sans-serif`; // Use a clean, semi-bold font
watermarkCtx.fillStyle = 'rgba(255, 255, 255, 0.85)'; // Slightly transparent white
watermarkCtx.textAlign = 'right';
watermarkCtx.textBaseline = 'bottom';

// Add a soft drop shadow for legibility
watermarkCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
watermarkCtx.shadowBlur = 8;
watermarkCtx.shadowOffsetY = 2;
watermarkCtx.shadowOffsetX = 0;

watermarkCtx.fillText(brandText, videoWidth - padding, videoHeight - padding);

// 4. Draw the informational Surah/Verse name in the top-left
// Reset shadow for a different, more subtle style for this text
watermarkCtx.shadowColor = 'rgba(0, 0, 0, 0.4)';
watermarkCtx.shadowBlur = 6;

watermarkCtx.font = `400 ${infoFontSize}px "Inter", "Lato", sans-serif`; // Use a regular weight
watermarkCtx.textAlign = 'left';
watermarkCtx.textBaseline = 'top';

watermarkCtx.fillText(surahWithVerse, padding, padding);

// 5. Save the generated watermark image
const tempWatermarkPath = path.join(__dirname, 'temp', `${videoId}_watermark.png`);
const watermarkBuffer = watermarkCanvas.toBuffer('image/png');
fs.writeFileSync(tempWatermarkPath, watermarkBuffer);

console.log('✅ Modern watermark overlay created');
    
    // All text overlays are now created individually for each verse
    // Skip to video generation with sequential overlays
    
    console.log('Video dimensions for overlay positioning:', `${videoWidth}x${videoHeight}`);
    
    // Create sequential verse display using FFmpeg time-based filters
    console.log('🎬 Building sequential verse display with time-based overlays');
    
    // Start with the background video - loop it for the full audio duration
    let videoCommand = ffmpeg(backgroundPath)
      .inputOptions(['-stream_loop', '-1', '-t', cumulativeTime.toString()])
      .input(finalAudioPath)
      .input(tempWatermarkPath); // Add watermark as input
    
    // Add all verse text overlays as inputs
    verseOverlays.forEach(overlay => {
      videoCommand.input(overlay.blackOverlayPath);
      videoCommand.input(overlay.arabicPath);
      videoCommand.input(overlay.translationPath);
    });
    
    // Build complex filter chain for sequential display
    let filterChain = [
      `[0:v]scale=${videoWidth}:${videoHeight}[bg]`,
      `[bg][2:v]overlay=0:0[watermarked]` // Add permanent watermark (input 2 is watermark)
    ];
    let currentOutput = 'watermarked';
    
    // Add each verse overlay with timing
    for (let i = 0; i < verseOverlays.length; i++) {
      const overlay = verseOverlays[i];
      const blackOverlayInputIndex = 3 + (i * 3); // Black overlay input index (offset by watermark)
      const arabicInputIndex = 4 + (i * 3); // Arabic text input index (offset by watermark)
      const translationInputIndex = 5 + (i * 3); // Translation text input index (offset by watermark)
      
      const blackBgOutput = `blackbg_${i}`;
      const arabicOutput = `arabic_${i}`;
      const translationOutput = `verse_${i}`;
      
      // Add rounded black overlay with timing
      filterChain.push(
        `[${currentOutput}][${blackOverlayInputIndex}:v]overlay=0:0:enable='between(t,${overlay.startTime},${overlay.endTime})'[${blackBgOutput}]`
      );
      
      // Calculate dynamic positioning based on actual text sizes
      const arabicLineHeight = arabicTextData.fontSize * 1.3;
      const actualArabicLines = overlay.arabicLineCount; // Use stored actual line count
      const arabicTotalHeight = arabicLineHeight * actualArabicLines;
      
      const translationLineHeight = translationTextData.fontSize * 1.3;
      // Translation lines are calculated properly in the verse creation
      const translationTotalHeight = translationLineHeight * 3; // Conservative estimate
      
      const textGap = Math.floor(videoHeight * 0.02); // 2% of video height as gap
      const totalContentHeight = arabicTotalHeight + textGap + translationTotalHeight;
      
      // Position Arabic text above center, translation below with clear gap
      const extraGap = Math.floor(videoHeight * 0.05); // Additional 5% gap between texts
      const arabicOffset = Math.floor(arabicTotalHeight / 2) + extraGap; // Arabic above center
      const translationOffset = Math.floor(translationTotalHeight / 2) + extraGap; // Translation below center with gap
      
      console.log(`📍 Verse ${overlay.verse} positioning: Arabic offset=${arabicOffset}, Translation offset=${translationOffset}`);
      
      // Add Arabic text overlay with dynamic positioning
      filterChain.push(
        `[${blackBgOutput}][${arabicInputIndex}:v]overlay=(W-w)/2:(H-h)/2-${arabicOffset}:enable='between(t,${overlay.startTime},${overlay.endTime})'[${arabicOutput}]`
      );
      
      // Add translation text overlay with dynamic positioning
      filterChain.push(
        `[${arabicOutput}][${translationInputIndex}:v]overlay=(W-w)/2:(H-h)/2+${translationOffset}:enable='between(t,${overlay.startTime},${overlay.endTime})'[${translationOutput}]`
      );
      
      currentOutput = translationOutput;
    }
    
    // Final output
    filterChain.push(`[${currentOutput}]null[final]`);
    
    console.log('📋 FFmpeg filter chain:');
    filterChain.forEach((filter, index) => {
      console.log(`  ${index + 1}. ${filter}`);
    });
    
    videoCommand
      .complexFilter(filterChain)
      .outputOptions([
        '-map', '[final]',
        '-map', '1:a',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-pix_fmt', 'yuv420p'
      ])
      .output(outputPath);
    
    await new Promise((resolve, reject) => {
      videoCommand
        .on('end', () => {
          console.log('Video generated successfully:', outputPath);
          
          // Clean up temporary files
          verseOverlays.forEach(overlay => {
            if (fs.existsSync(overlay.arabicPath)) {
              fs.unlinkSync(overlay.arabicPath);
            }
            if (fs.existsSync(overlay.translationPath)) {
              fs.unlinkSync(overlay.translationPath);
            }
          });
          
          resolve();
        })
        .on('error', (error, stdout, stderr) => {
          console.error('FFmpeg error:', error);
          console.error('FFmpeg stdout:', stdout);
          console.error('FFmpeg stderr:', stderr);
          reject(error);
        })
        .on('progress', (progress) => {
          console.log('FFmpeg progress:', progress);
        })
        .run();
    });

    // Clean up temp files
    if (fs.existsSync(tempAudioPath)) {
      fs.unlinkSync(tempAudioPath);
    }
    
    // Clean up individual verse overlay files
    verseOverlays.forEach(overlay => {
      if (fs.existsSync(overlay.blackOverlayPath)) {
        fs.unlinkSync(overlay.blackOverlayPath);
      }
      if (fs.existsSync(overlay.arabicPath)) {
        fs.unlinkSync(overlay.arabicPath);
      }
      if (fs.existsSync(overlay.translationPath)) {
        fs.unlinkSync(overlay.translationPath);
      }
    });
    
    // Clean up watermark
    if (fs.existsSync(tempWatermarkPath)) {
      fs.unlinkSync(tempWatermarkPath);
    }
    
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      videoId,
      downloadUrl: `/api/download/${videoId}`
    });

  } catch (error) {
    console.error('Error generating video:', error);
    res.status(500).json({ error: 'Failed to generate video' });
  }
});

// Download video
app.get('/api/download/:videoId', (req, res) => {
  const { videoId } = req.params;
  const videoPath = path.join(__dirname, 'generated', `${videoId}.mp4`);
  
  console.log('Download request for videoId:', videoId);
  console.log('Video path:', videoPath);
  console.log('File exists:', fs.existsSync(videoPath));
  
  if (fs.existsSync(videoPath)) {
    const stats = fs.statSync(videoPath);
    console.log('File size:', stats.size, 'bytes');
    
    // Set proper headers for video download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="sakinahtime-dot-com-${videoId}.mp4"`);
    res.setHeader('Content-Length', stats.size);
    
    // Stream the file
    const fileStream = fs.createReadStream(videoPath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming video file:', error);
      res.status(500).json({ error: 'Error streaming video file' });
    });
  } else {
    console.error('Video file not found:', videoPath);
    res.status(404).json({ error: 'Video not found' });
  }
});


// Clean up old videos (run periodically)
app.post('/api/cleanup', (req, res) => {
  const generatedDir = path.join(__dirname, 'generated');
  const files = fs.readdirSync(generatedDir);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  let cleanedCount = 0;
  files.forEach(file => {
    const filePath = path.join(generatedDir, file);
    const stats = fs.statSync(filePath);
    if (now - stats.birthtime.getTime() > maxAge) {
      fs.removeSync(filePath);
      cleanedCount++;
    }
  });

  res.json({ cleanedCount });
});

// TikTok API Endpoints - Using different path to avoid blocking
// Add CORS support for TikTok endpoints
app.use('/api/tiktok', (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://sakinahtime.com',
    'https://www.sakinahtime.com',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test endpoint to verify TikTok API is working
app.get('/api/tiktok/test', (req, res) => {
  res.json({ 
    status: 'TikTok API endpoints are working',
    timestamp: new Date().toISOString(),
    method: req.method
  });
});

// Simple test endpoint for TikTok token exchange
app.post('/api/tiktok/simple', async (req, res) => {
  try {
    const { client_key, client_secret, code, grant_type, redirect_uri, code_verifier, action, access_token } = req.body;
    
    // Handle user info requests
    if (action === 'userinfo') {
      console.log('TikTok user info request for token:', access_token?.substring(0, 10) + '...');
      
      const userInfoUrl = 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name';
      
      const response = await axios.get(userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });
      
      console.log('TikTok user info response:', response.data);
      res.json(response.data.data.user);
      return;
    }
    
    console.log('Simple TikTok token request:', { client_key, code, grant_type });
    
    // Use the correct TikTok API endpoint for token exchange
    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    console.log('Using TikTok API endpoint:', tokenUrl);
    
    // Log all parameters being sent
    console.log('All parameters being sent to TikTok:', {
      client_key,
      client_secret: client_secret ? '***' + client_secret.slice(-4) : 'missing',
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://sakinahtime.com/posttotiktok/callback.html'
    });
    const tokenData = {
      client_key,
      client_secret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri || 'https://sakinahtime.com/posttotiktok/callback.html'
    };
    
    // Add code_verifier for PKCE if provided
    if (code_verifier) {
      tokenData.code_verifier = code_verifier;
    }
    
    console.log('Sending to TikTok API:', tokenUrl);
    console.log('Token data:', tokenData);
    
    // Use form data format as per TikTok documentation
    const response = await axios.post(tokenUrl, new URLSearchParams(tokenData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    
    console.log('TikTok token response:', response.data);
    res.json(response.data);
    
  } catch (error) {
    console.error('TikTok API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'fetch_error', 
      message: 'Failed to connect to TikTok API',
      details: error.response?.data || error.message
    });
  }
});

// TikTok video upload endpoint with increased body size limit
app.post('/api/tiktok/upload', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    // Add CORS headers
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://sakinahtime.com',
      'https://www.sakinahtime.com',
      'http://localhost:3000',
      'http://localhost:8000',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const { access_token, video_data, caption, privacy_level } = req.body;
    
    console.log('TikTok video upload request:', { 
      has_access_token: !!access_token,
      has_video_data: !!video_data,
      caption: caption,
      privacy_level: privacy_level
    });
    
    // Step 1: Initialize INBOX UPLOAD using TikTok Content Posting API (sandbox compatible)
    const initUrl = 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/';
    
    // Convert base64 to buffer to get accurate size
    const videoBuffer = Buffer.from(video_data, 'base64');
    const actualVideoSize = videoBuffer.length;
    
    const initData = {
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: actualVideoSize,
        chunk_size: actualVideoSize, // Use full video size for single chunk
        total_chunk_count: 1
      }
    };

    console.log('Calling TikTok INBOX UPLOAD API...');
    const uploadResponse = await axios.post(initUrl, initData, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      }
    });

    console.log('TikTok upload response:', uploadResponse.data);
    
    if (uploadResponse.data.error && uploadResponse.data.error.code !== 'ok') {
      console.log('TikTok API Error Details:', uploadResponse.data.error);
      throw new Error(`TikTok upload failed: ${uploadResponse.data.error.message || JSON.stringify(uploadResponse.data.error)}`);
    }

    const publishId = uploadResponse.data.data.publish_id;
    const uploadUrl = uploadResponse.data.data.upload_url;
    
    console.log('Step 1 Complete - Upload initialized:', { publishId, uploadUrl });
    
    // Step 2: Upload the actual video file to TikTok
    console.log('Step 2 - Uploading video file to TikTok...');
    
    // Use the same buffer we created earlier
    const videoSize = actualVideoSize;
    
    // Upload video using PUT request to the upload_url (Direct Post)
    const uploadResult = await axios.put(uploadUrl, videoBuffer, {
      headers: {
        'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
        'Content-Type': 'video/mp4'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('Step 2 Complete - Video uploaded:', uploadResult.status);
    
    // Step 3: Check upload status
    console.log('Step 3 - Checking upload status...');
    
    const statusUrl = 'https://open.tiktokapis.com/v2/post/publish/status/fetch/';
    const statusResponse = await axios.post(statusUrl, {
      publish_id: publishId
    }, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });
    
    console.log('Step 3 Complete - Status check:', statusResponse.data);
    
    res.json({
      success: true,
      message: 'Video uploaded to TikTok inbox successfully',
      publish_id: publishId,
      upload_url: uploadUrl,
      status: statusResponse.data.data?.status || 'posted',
      video_size: videoSize,
      upload_status: uploadResult.status,
      status_check: statusResponse.data,
      api_used: 'TikTok Content Posting API - Inbox Upload (video.upload scope)',
      post_type: 'INBOX_UPLOAD'
    });
    
  } catch (error) {
    console.error('TikTok upload error:', error);
    
    // Log the actual TikTok error response if available
    if (error.response && error.response.data) {
      console.log('TikTok Error Response:', error.response.data);
    }
    
    res.status(500).json({ 
      error: 'upload_failed', 
      message: 'Failed to upload video to TikTok',
      details: error.response?.data || error.message
    });
  }
});

// Handle OPTIONS request for upload endpoint
app.options('/api/tiktok/upload', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://sakinahtime.com',
    'https://www.sakinahtime.com',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Use existing working endpoint for TikTok token exchange
app.post('/api/tiktok/test', async (req, res) => {
  try {
    console.log('=== TikTok API Request Received ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', req.headers);
    console.log('Full request body received:', JSON.stringify(req.body, null, 2));
    const { action, client_key, client_secret, code, grant_type, redirect_uri, code_verifier, access_token } = req.body;
    
    if (action === 'token') {
      // Handle token exchange
      console.log('TikTok token exchange request (via test):', { 
        client_key, 
        code: code ? code.substring(0, 20) + '...' : 'missing', 
        grant_type, 
        has_code_verifier: !!code_verifier,
        code_verifier: code_verifier ? code_verifier.substring(0, 10) + '...' : 'missing',
        redirect_uri
      });
      
      // Validate required parameters (redirect_uri is optional for some flows)
      if (!client_key || !client_secret || !code || !grant_type) {
        return res.status(400).json({ 
          error: 'missing_parameters', 
          message: 'Missing required parameters for token exchange' 
        });
      }
      
      // Use sandbox endpoint for testing
      const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
      
      // Try minimal parameters first - remove redirect_uri to see if that's the issue
      const tokenData = {
        client_key,
        client_secret,
        code,
        grant_type: 'authorization_code'
      };
      
      // Only add redirect_uri if it's provided
      if (redirect_uri) {
        tokenData.redirect_uri = redirect_uri;
      }
      
      // Try without PKCE first to isolate the issue
      // Only add code_verifier if it's provided and not empty
      if (code_verifier && code_verifier.trim() !== '') {
        console.log('Adding PKCE code_verifier');
        tokenData.code_verifier = code_verifier;
      } else {
        console.log('Skipping PKCE code_verifier');
      }
      
      console.log('Sending to TikTok API:', tokenUrl);
      console.log('Token data:', tokenData);
      
      try {
        const response = await axios.post(tokenUrl, new URLSearchParams(tokenData), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
        
        console.log('TikTok token response (via test):', response.data);
        res.json(response.data);
        
      } catch (fetchError) {
        console.error('TikTok API fetch error:', fetchError.response?.data || fetchError.message);
        res.status(500).json({ 
          error: 'fetch_error', 
          message: 'Failed to connect to TikTok API' 
        });
      }
    } else if (action === 'userinfo') {
      // Handle user info
      console.log('TikTok user info request (via test) for token:', access_token?.substring(0, 10) + '...');
      
      // Validate required parameters
      if (!access_token) {
        return res.status(400).json({ 
          error: 'missing_parameters', 
          message: 'Missing access_token for user info request' 
        });
      }
      
      const userInfoUrl = 'https://open.tiktokapis.com/v2/user/info/';
      const userInfoData = {
        access_token,
        fields: 'open_id,union_id,avatar_url,display_name'
      };
      
      try {
        const response = await axios.post(userInfoUrl, new URLSearchParams(userInfoData), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
        
        console.log('TikTok user info response (via test):', response.data);
        res.json(response.data);
        
      } catch (fetchError) {
        console.error('TikTok API fetch error:', fetchError.response?.data || fetchError.message);
        res.status(500).json({ 
          error: 'fetch_error', 
          message: 'Failed to connect to TikTok API' 
        });
      }
    } else {
      res.json({ 
        status: 'TikTok API endpoints are working',
        timestamp: new Date().toISOString(),
        method: req.method,
        message: 'Use action: "token" or "userinfo"'
      });
    }
  } catch (error) {
    console.error('TikTok API error (via test):', error);
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Internal server error' 
    });
  }
});

// Test alternative endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    status: 'Alternative auth endpoints are working',
    timestamp: new Date().toISOString(),
    method: req.method,
    version: '2.0'
  });
});

// Alternative TikTok endpoints using different path
app.post('/api/tiktok/token', async (req, res) => {
  try {
    const { client_key, client_secret, code, grant_type, redirect_uri, code_verifier } = req.body;
    
    console.log('TikTok token exchange request:', { client_key, code, grant_type, has_code_verifier: !!code_verifier });
    
    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    const tokenData = {
      client_key,
      client_secret,
      code,
      grant_type,
      redirect_uri
    };
    
    // Add code_verifier for PKCE if provided
    if (code_verifier) {
      tokenData.code_verifier = code_verifier;
    }
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenData)
    });
    
    const data = await response.json();
    console.log('TikTok token response:', data);
    
    if (response.ok) {
      res.json(data);
    } else {
      res.status(400).json({ 
        error: 'token_exchange_failed', 
        message: data.message || 'Failed to exchange code for token' 
      });
    }
  } catch (error) {
    console.error('TikTok token exchange error:', error);
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Internal server error during token exchange' 
    });
  }
});

app.post('/api/tiktok/userinfo', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    console.log('TikTok user info request for token:', access_token?.substring(0, 10) + '...');
    
    const userInfoUrl = 'https://open.tiktokapis.com/v2/user/info/';
    const userInfoData = {
      access_token,
      fields: 'open_id,union_id,avatar_url,display_name'
    };
    
    const response = await fetch(userInfoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(userInfoData)
    });
    
    const data = await response.json();
    console.log('TikTok user info response:', data);
    
    if (response.ok) {
      res.json(data);
    } else {
      res.status(400).json({ 
        error: 'user_info_failed', 
        message: data.message || 'Failed to get user information' 
      });
    }
  } catch (error) {
    console.error('TikTok user info error:', error);
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Internal server error during user info retrieval' 
    });
  }
});

// Alternative endpoints using different path
app.post('/api/auth/tiktok-token', async (req, res) => {
  try {
    const { client_key, client_secret, code, grant_type, redirect_uri, code_verifier } = req.body;
    
    console.log('TikTok token exchange request (alt):', { client_key, code, grant_type, has_code_verifier: !!code_verifier });
    
    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    const tokenData = {
      client_key,
      client_secret,
      code,
      grant_type,
      redirect_uri
    };
    
    // Add code_verifier for PKCE if provided
    if (code_verifier) {
      tokenData.code_verifier = code_verifier;
    }
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenData)
    });
    
    const data = await response.json();
    console.log('TikTok token response (alt):', data);
    
    if (response.ok) {
      res.json(data);
    } else {
      res.status(400).json({ 
        error: 'token_exchange_failed', 
        message: data.message || 'Failed to exchange code for token' 
      });
    }
  } catch (error) {
    console.error('TikTok token exchange error (alt):', error);
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Internal server error during token exchange' 
    });
  }
});

app.post('/api/auth/tiktok-userinfo', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    console.log('TikTok user info request (alt) for token:', access_token?.substring(0, 10) + '...');
    
    const userInfoUrl = 'https://open.tiktokapis.com/v2/user/info/';
    const userInfoData = {
      access_token,
      fields: 'open_id,union_id,avatar_url,display_name'
    };
    
    const response = await fetch(userInfoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(userInfoData)
    });
    
    const data = await response.json();
    console.log('TikTok user info response (alt):', data);
    
    if (response.ok) {
      res.json(data);
    } else {
      res.status(400).json({ 
        error: 'user_info_failed', 
        message: data.message || 'Failed to get user information' 
      });
    }
  } catch (error) {
    console.error('TikTok user info error (alt):', error);
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Internal server error during user info retrieval' 
    });
  }
});

app.post('/api/tiktok/upload', async (req, res) => {
  try {
    const { access_token, video_data, caption, privacy_level } = req.body;
    
    console.log('TikTok video upload request');
    
    // Step 1: Initialize upload
    const initUrl = 'https://open-api.tiktok.com/share/video/upload/';
    const initData = {
      access_token,
      source_info: JSON.stringify({
        source: 'FILE_UPLOAD',
        video_size: video_data.length,
        chunk_size: 10000000, // 10MB chunks
        total_chunk_count: Math.ceil(video_data.length / 10000000)
      })
    };
    
    const initResponse = await fetch(initUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(initData)
    });
    
    const initResult = await initResponse.json();
    console.log('TikTok upload init response:', initResult);
    
    if (!initResponse.ok) {
      return res.status(400).json({ 
        error: 'upload_init_failed', 
        message: initResult.message || 'Failed to initialize upload' 
      });
    }
    
    // Step 2: Upload video chunks (simplified for demo)
    const uploadUrl = initResult.data.upload_url;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: video_data
    });
    
    if (!uploadResponse.ok) {
      return res.status(400).json({ 
        error: 'upload_failed', 
        message: 'Failed to upload video data' 
      });
    }
    
    // Step 3: Publish video
    const publishUrl = 'https://open-api.tiktok.com/share/video/publish/';
    const publishData = {
      access_token,
      post_info: JSON.stringify({
        title: caption || 'Islamic Content from SakinahTime',
        privacy_level: privacy_level || 'MUTUAL_FOLLOW_FRIEND',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000
      }),
      source_info: JSON.stringify({
        source: 'FILE_UPLOAD',
        video_size: video_data.length,
        chunk_size: 10000000,
        total_chunk_count: Math.ceil(video_data.length / 10000000)
      })
    };
    
    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(publishData)
    });
    
    const publishResult = await publishResponse.json();
    console.log('TikTok publish response:', publishResult);
    
    if (publishResponse.ok) {
      res.json(publishResult);
    } else {
      res.status(400).json({ 
        error: 'publish_failed', 
        message: publishResult.message || 'Failed to publish video' 
      });
    }
    
  } catch (error) {
    console.error('TikTok upload error:', error);
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Internal server error during video upload' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Video generation API available at http://localhost:${PORT}`);
  console.log(`TikTok API endpoints available at http://localhost:${PORT}/api/tiktok/`);
}); 