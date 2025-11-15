const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

class ExternalTranslationDownloader {
    constructor() {
        this.localesDir = path.join(__dirname, '..', 'locales');
        this.ensureLocalesDir();
    }

    ensureLocalesDir() {
        if (!fs.existsSync(this.localesDir)) {
            fs.mkdirSync(this.localesDir, { recursive: true });
        }
    }

    // 1. Baixar do Google Translate (não oficial)
    async translateWithGoogle(text, targetLang) {
        return new Promise((resolve, reject) => {
            const encodedText = encodeURIComponent(text);
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodedText}`;

            https.get(url, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result && result[0] && result[0][0] && result[0][0][0]) {
                            resolve(result[0][0][0]);
                        } else {
                            resolve(text);
                        }
                    } catch (error) {
                        resolve(text);
                    }
                });
            }).on('error', (error) => {
                console.log(`❌ Google Translate erro: ${error.message}`);
                resolve(text);
            });
        });
    }

    // 2. Baixar do LibreTranslate (API aberta)
    async translateWithLibreTranslate(text, targetLang) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                q: text,
                source: 'pt',
                target: targetLang,
                format: 'text'
            });

            const options = {
                hostname: 'libretranslate.com',
                port: 443,
                path: '/translate',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        resolve(result.translatedText || text);
                    } catch (error) {
                        resolve(text);
                    }
                });
            });

            req.on('error', (error) => {
                console.log(`❌ LibreTranslate erro: ${error.message}`);
                resolve(text);
            });

            req.write(postData);
            req.end();
        });
    }

    // 3. Baixar do MyMemory Translation
    async translateWithMyMemory(text, targetLang) {
        return new Promise((resolve, reject) => {
            const encodedText = encodeURIComponent(text);
            const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=pt|${targetLang}`;

            https.get(url, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.responseData && result.responseData.translatedText) {
                            resolve(result.responseData.translatedText);
                        } else {
                            resolve(text);
                        }
                    } catch (error) {
                        resolve(text);
                    }
                });
            }).on('error', (error) => {
                console.log(`❌ MyMemory erro: ${error.message}`);
                resolve(text);
            });
        });
    }

    // 4. Tentar múltiplas APIs
    async translateWithMultipleAPIs(text, targetLang) {
        console.log(`   Traduzindo: "${text.substring(0, 30)}..."`);

        // Tenta MyMemory primeiro (mais confiável para línguas africanas)
        try {
            const result = await this.translateWithMyMemory(text, targetLang);
            if (result && result !== text) {
                return result;
            }
        } catch (error) {}

        // Tenta LibreTranslate
        try {
            const result = await this.translateWithLibreTranslate(text, targetLang);
            if (result && result !== text) {
                return result;
            }
        } catch (error) {}

        // Tenta Google Translate como fallback
        try {
            const result = await this.translateWithGoogle(text, targetLang);
            if (result && result !== text) {
                return result;
            }
        } catch (error) {}

        return text; // Retorna original se todas falharem
    }

    // 5. Baixar de projetos open source
    async downloadFromOpenSource(langCode) {
        const openSourceUrls = {
            'sw': [
                'https://raw.githubusercontent.com/translate/translate/master/translate/lang/data/sw.txt',
                'https://raw.githubusercontent.com/unicode-org/cldr/main/common/main/sw.xml'
            ],
            'ts': [
                'https://raw.githubusercontent.com/tsonga/tsonga-dictionary/main/translations.json'
            ]
        };

        console.log(`🔍 Procurando em repositórios open source para ${langCode}...`);

        const urls = openSourceUrls[langCode] || [];
        for (const url of urls) {
            try {
                const translations = await this.downloadFromURL(url);
                if (translations) {
                    console.log(`✅ Encontrado em: ${url}`);
                    return translations;
                }
            } catch (error) {
                console.log(`❌ Não encontrado em: ${url}`);
            }
        }

        return {};
    }

    async downloadFromURL(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                if (response.statusCode === 200) {
                    let data = '';
                    response.on('data', (chunk) => {
                        data += chunk;
                    });
                    response.on('end', () => {
                        resolve(data);
                    });
                } else {
                    resolve(null);
                }
            }).on('error', (error) => {
                resolve(null);
            });
        });
    }

    // 6. Download principal
    async downloadTranslations(langCode, useAPIs = true) {
        console.log(`\n🌍 BAIXANDO TRADUÇÕES EXTERNAS PARA: ${langCode.toUpperCase()}`);

        // Carregar estrutura base do Português
        const baseStructure = this.loadPortugueseStructure();
        if (!baseStructure) {
            console.log('❌ Arquivo pt.json não encontrado!');
            return;
        }

        let translations = this.createEmptyStructure(baseStructure);
        let translatedCount = 0;
        const totalKeys = this.countKeys(baseStructure);

        // Primeiro tenta baixar de open source
        console.log(`📥 Tentando fontes open source...`);
        const openSourceTranslations = await this.downloadFromOpenSource(langCode);
        
        if (Object.keys(openSourceTranslations).length > 0) {
            // Processar traduções open source
            console.log(`✅ Encontradas traduções open source`);
        }

        // Depois usa APIs para o restante
        if (useAPIs) {
            console.log(`🤖 Usando APIs de tradução...`);
            
            const ptTexts = this.getPortugueseTexts(baseStructure);
            let apiCount = 0;

            for (const [key, portugueseText] of Object.entries(ptTexts)) {
                if (!this.getTranslation(translations, key)) {
                    try {
                        const translated = await this.translateWithMultipleAPIs(portugueseText, langCode);
                        if (translated && translated !== portugueseText) {
                            this.setTranslation(translations, key, translated);
                            translatedCount++;
                            apiCount++;
                            process.stdout.write(`\r⏳ APIs: ${apiCount} traduções...`);
                        }
                        
                        // Delay para não sobrecarregar as APIs
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        // Continua para a próxima
                    }
                }
            }

            if (apiCount > 0) {
                console.log(`\n✅ ${apiCount} traduções das APIs`);
            }
        }

        // Salvar arquivo final
        const filePath = path.join(this.localesDir, `${langCode}.json`);
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
        
        console.log(`📁 Arquivo salvo: locales/${langCode}.json`);
        console.log(`📊 Total traduzido: ${translatedCount}/${totalKeys} (${((translatedCount/totalKeys)*100).toFixed(1)}%)`);

        return translations;
    }

    // Métodos auxiliares
    loadPortugueseStructure() {
        try {
            const ptFile = path.join(this.localesDir, 'pt.json');
            return JSON.parse(fs.readFileSync(ptFile, 'utf8'));
        } catch (error) {
            return null;
        }
    }

    getPortugueseTexts(baseStructure) {
        const texts = {};
        for (const [key, value] of this.getAllTranslationPairs(baseStructure)) {
            texts[key] = value;
        }
        return texts;
    }

    createEmptyStructure(obj) {
        const empty = {};
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                empty[key] = this.createEmptyStructure(obj[key]);
            } else {
                empty[key] = "";
            }
        }
        return empty;
    }

    setTranslation(obj, key, value) {
        const keys = key.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return true;
    }

    getTranslation(obj, key) {
        const keys = key.split('.');
        let current = obj;
        for (const k of keys) {
            if (current[k] === undefined) return undefined;
            current = current[k];
        }
        return current;
    }

    countKeys(obj) {
        let count = 0;
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                count += this.countKeys(obj[key]);
            } else {
                count++;
            }
        }
        return count;
    }

    *getAllTranslationPairs(obj, path = []) {
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = [...path, key];
            if (typeof value === 'object' && value !== null) {
                yield* this.getAllTranslationPairs(value, currentPath);
            } else {
                yield [currentPath.join('.'), value];
            }
        }
    }

    // Download para múltiplos idiomas
    async downloadAll(useAPIs = true) {
        console.log('🚀 INICIANDO DOWNLOAD DE FONTES EXTERNAS\n');
        
        const languages = ['sw', 'ts', 'sn', 'nd'];
        
        for (const lang of languages) {
            await this.downloadTranslations(lang, useAPIs);
        }

        console.log('\n🎉 DOWNLOAD EXTERNO CONCLUÍDO!');
        console.log('💡 As traduções foram baixadas de:');
        console.log('   • MyMemory Translation API');
        console.log('   • LibreTranslate (Open Source)');
        console.log('   • Google Translate');
        console.log('   • Repositórios Open Source');
    }
}

// Execução
const downloader = new ExternalTranslationDownloader();
const args = process.argv.slice(2);

(async () => {
    if (args.includes('--no-api')) {
        console.log('🔧 MODO: Apenas open source (sem APIs)');
        await downloader.downloadAll(false);
    } else {
        console.log('🔧 MODO: Open source + APIs (completo)');
        await downloader.downloadAll(true);
    }
})();