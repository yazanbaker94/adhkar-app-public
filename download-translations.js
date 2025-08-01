const fs = require('fs');
const https = require('https');

// List of translation files to download from a more reliable source
const translations = [
    {
        id: 'ur_jalandhry',
        url: 'https://api.alquran.cloud/v1/quran/ur.jalandhry',
        filename: 'ur.jalandhry.json'
    },
    {
        id: 'tr_diyanet',
        url: 'https://api.alquran.cloud/v1/quran/tr.diyanet',
        filename: 'tr.diyanet.json'
    },
    {
        id: 'fr_hameidullah',
        url: 'https://api.alquran.cloud/v1/quran/fr.hameidullah',
        filename: 'fr.hameidullah.json'
    },
    {
        id: 'es_cortes',
        url: 'https://api.alquran.cloud/v1/quran/es.cortes',
        filename: 'es.cortes.json'
    },
    {
        id: 'de_bubenheim',
        url: 'https://api.alquran.cloud/v1/quran/de.bubenheim',
        filename: 'de.bubenheim.json'
    },
    {
        id: 'id_indonesian',
        url: 'https://api.alquran.cloud/v1/quran/id.indonesian',
        filename: 'id.indonesian.json'
    },
    {
        id: 'fa_ansarian',
        url: 'https://api.alquran.cloud/v1/quran/fa.ansarian',
        filename: 'fa.ansarian.json'
    },
    {
        id: 'bn_bengali',
        url: 'https://api.alquran.cloud/v1/quran/bn.bengali',
        filename: 'bn.bengali.json'
    },
    {
        id: 'zh_jian',
        url: 'https://api.alquran.cloud/v1/quran/zh.jian',
        filename: 'zh.jian.json'
    },
    {
        id: 'ru_kuliev',
        url: 'https://api.alquran.cloud/v1/quran/ru.kuliev',
        filename: 'ru.kuliev.json'
    },
    {
        id: 'ms_basmeih',
        url: 'https://api.alquran.cloud/v1/quran/ms.basmeih',
        filename: 'ms.basmeih.json'
    },
    {
        id: 'it_piccardo',
        url: 'https://api.alquran.cloud/v1/quran/it.piccardo',
        filename: 'it.piccardo.json'
    },
    {
        id: 'pt_elhayek',
        url: 'https://api.alquran.cloud/v1/quran/pt.elhayek',
        filename: 'pt.elhayek.json'
    },
    {
        id: 'nl_keyzer',
        url: 'https://api.alquran.cloud/v1/quran/nl.keyzer',
        filename: 'nl.keyzer.json'
    },
    {
        id: 'hi_hindi',
        url: 'https://api.alquran.cloud/v1/quran/hi.hindi',
        filename: 'hi.hindi.json'
    },
    {
        id: 'ta_tamil',
        url: 'https://api.alquran.cloud/v1/quran/ta.tamil',
        filename: 'ta.tamil.json'
    },
    {
        id: 'th_thai',
        url: 'https://api.alquran.cloud/v1/quran/th.thai',
        filename: 'th.thai.json'
    },
    {
        id: 'ja_japanese',
        url: 'https://api.alquran.cloud/v1/quran/ja.japanese',
        filename: 'ja.japanese.json'
    },
    {
        id: 'ko_korean',
        url: 'https://api.alquran.cloud/v1/quran/ko.korean',
        filename: 'ko.korean.json'
    },
    {
        id: 'ha_gumi',
        url: 'https://api.alquran.cloud/v1/quran/ha.gumi',
        filename: 'ha.gumi.json'
    },
    {
        id: 'sw_barwani',
        url: 'https://api.alquran.cloud/v1/quran/sw.barwani',
        filename: 'sw.barwani.json'
    }
];

async function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${filename}...`);
        
        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }
            
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                file.close();
                
                // Check if the response is valid JSON and not empty
                try {
                    const jsonData = JSON.parse(data);
                    
                    // Check if the response has the expected structure
                    if (!jsonData.data || !jsonData.data.surahs) {
                        throw new Error('Invalid JSON structure - missing data.surahs');
                    }
                    
                    // Write the valid JSON to file
                    fs.writeFileSync(filename, JSON.stringify(jsonData, null, 2));
                    console.log(`✅ Downloaded ${filename} (${jsonData.data.surahs.length} surahs)`);
                    resolve();
                } catch (error) {
                    // Delete the invalid file
                    fs.unlink(filename, () => {});
                    reject(new Error(`Invalid JSON response for ${filename}: ${error.message}`));
                }
            });
            
            response.on('error', (err) => {
                file.close();
                fs.unlink(filename, () => {});
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function downloadAllTranslations() {
    console.log('🚀 Starting translation downloads from AlQuran.cloud API...\n');
    
    for (const translation of translations) {
        try {
            await downloadFile(translation.url, translation.filename);
        } catch (error) {
            console.error(`❌ Error downloading ${translation.filename}:`, error.message);
        }
    }
    
    console.log('\n🎉 Translation download process completed!');
    console.log('\n📋 Downloaded files:');
    translations.forEach(t => {
        if (fs.existsSync(t.filename)) {
            const stats = fs.statSync(t.filename);
            const fileSize = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`   ✅ ${t.filename} (${fileSize} MB)`);
        } else {
            console.log(`   ❌ ${t.filename} (failed)`);
        }
    });
    
    // Verify downloaded files
    console.log('\n🔍 Verifying downloaded files...');
    translations.forEach(t => {
        if (fs.existsSync(t.filename)) {
            try {
                const content = fs.readFileSync(t.filename, 'utf8');
                const jsonData = JSON.parse(content);
                
                if (jsonData.data && jsonData.data.surahs && jsonData.data.surahs.length > 0) {
                    console.log(`   ✅ ${t.filename} - Valid (${jsonData.data.surahs.length} surahs)`);
                } else {
                    console.log(`   ⚠️  ${t.filename} - Invalid structure`);
                }
            } catch (error) {
                console.log(`   ❌ ${t.filename} - Invalid JSON: ${error.message}`);
            }
        }
    });
}

// Run the download
downloadAllTranslations().catch(console.error); 