const fs = require('fs');
const https = require('https');

// Function to download JSON data
function downloadJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                resolve(JSON.parse(data));
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Function to save JSON data to file
function saveJson(data, filename) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(data, null, 2), 'utf8', (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

// Main function to download and save Quran data
async function downloadQuranData() {
    try {
        console.log('Downloading Quran data...');
        
        // Download Arabic Quran
        const quranData = await downloadJson('https://api.alquran.cloud/v1/quran/quran-uthmani');
        await saveJson(quranData, 'quran-uthmani.json');
        console.log('Arabic Quran data saved successfully');
        
        // Download English translation
        const translationData = await downloadJson('https://api.alquran.cloud/v1/quran/en.sahih');
        await saveJson(translationData, 'en.sahih.json');
        console.log('English translation data saved successfully');
        
        // Download other translations
        const translations = [
            { code: 'ur.jalandhry', url: 'https://api.alquran.cloud/v1/quran/ur.jalandhry' },
            { code: 'tr.diyanet', url: 'https://api.alquran.cloud/v1/quran/tr.diyanet' },
            { code: 'fr.hameidullah', url: 'https://api.alquran.cloud/v1/quran/fr.hameidullah' },
            { code: 'es.cortes', url: 'https://api.alquran.cloud/v1/quran/es.cortes' },
            { code: 'de.bubenheim', url: 'https://api.alquran.cloud/v1/quran/de.bubenheim' },
            { code: 'id.indonesian', url: 'https://api.alquran.cloud/v1/quran/id.indonesian' },
            { code: 'fa.ansarian', url: 'https://api.alquran.cloud/v1/quran/fa.ansarian' },
            { code: 'bn.bengali', url: 'https://api.alquran.cloud/v1/quran/bn.bengali' },
            { code: 'zh.jian', url: 'https://api.alquran.cloud/v1/quran/zh.jian' },
            { code: 'ru.kuliev', url: 'https://api.alquran.cloud/v1/quran/ru.kuliev' },
            { code: 'ms.basmeih', url: 'https://api.alquran.cloud/v1/quran/ms.basmeih' },
            { code: 'it.piccardo', url: 'https://api.alquran.cloud/v1/quran/it.piccardo' },
            { code: 'pt.elhayek', url: 'https://api.alquran.cloud/v1/quran/pt.elhayek' },
            { code: 'nl.keyzer', url: 'https://api.alquran.cloud/v1/quran/nl.keyzer' },
            { code: 'hi.hindi', url: 'https://api.alquran.cloud/v1/quran/hi.hindi' },
            { code: 'ta.tamil', url: 'https://api.alquran.cloud/v1/quran/ta.tamil' },
            { code: 'th.thai', url: 'https://api.alquran.cloud/v1/quran/th.thai' },
            { code: 'ja.japanese', url: 'https://api.alquran.cloud/v1/quran/ja.japanese' },
            { code: 'ko.korean', url: 'https://api.alquran.cloud/v1/quran/ko.korean' },
            { code: 'ha.gumi', url: 'https://api.alquran.cloud/v1/quran/ha.gumi' },
            { code: 'sw.barwani', url: 'https://api.alquran.cloud/v1/quran/sw.barwani' }
        ];
        
        for (const translation of translations) {
            const data = await downloadJson(translation.url);
            await saveJson(data, `${translation.code}.json`);
            console.log(`${translation.code} translation saved successfully`);
        }
        
        console.log('All Quran data downloaded and saved successfully!');
    } catch (error) {
        console.error('Error downloading Quran data:', error);
    }
}

// Run the download
downloadQuranData(); 