const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

class MultiSourceTranslationDownloader {
    constructor() {
        this.localesDir = path.join(__dirname, '..', 'locales');
        this.ensureLocalesDir();
        this.results = [];
    }

    ensureLocalesDir() {
        if (!fs.existsSync(this.localesDir)) {
            fs.mkdirSync(this.localesDir, { recursive: true });
        }
    }

    // 1. DEEPL API (qualidade premium) - Versão gratuita
    async translateWithDeepL(text, targetLang) {
        return new Promise((resolve) => {
            // DeepL Free API (limitações)
            const encodedText = encodeURIComponent(text);
            const url = `https://api-free.deepl.com/v2/translate?auth_key=demo&text=${encodedText}&source_lang=PT&target_lang=${targetLang.toUpperCase()}`;

            https.get(url, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.translations && result.translations[0]) {
                            console.log(`   ✅ DeepL: ${text} → ${result.translations[0].text}`);
                            resolve(result.translations[0].text);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        resolve(null);
                    }
                });
            }).on('error', () => {
                resolve(null);
            });
        });
    }

    // 2. Microsoft/Bing Translator
    async translateWithBing(text, targetLang) {
        return new Promise((resolve) => {
            const encodedText = encodeURIComponent(text);
            const url = `https://api.bing.microsoft.com/v7.0/translate?text=${encodedText}&to=${targetLang}&from=pt`;

            const options = {
                headers: {
                    'Ocp-Apim-Subscription-Key': 'demo-key' // Necessita chave real
                }
            };

            https.get(url, options, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.translations && result.translations[0]) {
                            resolve(result.translations[0].text);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        resolve(null);
                    }
                });
            }).on('error', () => {
                resolve(null);
            });
        });
    }

    // 3. Yandex Translate
    async translateWithYandex(text, targetLang) {
        return new Promise((resolve) => {
            const encodedText = encodeURIComponent(text);
            // Yandex tem suporte bom para línguas africanas
            const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20231115T000000Z.demo&text=${encodedText}&lang=pt-${targetLang}`;

            https.get(url, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.text && result.text[0]) {
                            console.log(`   ✅ Yandex: ${text} → ${result.text[0]}`);
                            resolve(result.text[0]);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        resolve(null);
                    }
                });
            }).on('error', () => {
                resolve(null);
            });
        });
    }

    // 4. Baidu Translate
    async translateWithBaidu(text, targetLang) {
        return new Promise((resolve) => {
            // Baidu tem bom suporte para línguas menos comuns
            const encodedText = encodeURIComponent(text);
            const url = `https://fanyi.baidu.com/transapi?from=pt&to=${targetLang}&query=${encodedText}`;

            https.get(url, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.data && result.data[0]) {
                            resolve(result.data[0].dst);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        resolve(null);
                    }
                });
            }).on('error', () => {
                resolve(null);
            });
        });
    }

    // 5. IBM Watson Language Translator
    async translateWithIBM(text, targetLang) {
        return new Promise((resolve) => {
            // IBM Watson - necessita credenciais
            resolve(null); // Placeholder
        });
    }

    // 6. Amazon Translate
    async translateWithAmazon(text, targetLang) {
        return new Promise((resolve) => {
            // AWS Translate - necessita credenciais AWS
            resolve(null); // Placeholder
        });
    }

    // 7. OpenAI ChatGPT Translation
    async translateWithOpenAI(text, targetLang) {
        return new Promise((resolve) => {
            // Necessita API key do OpenAI
            resolve(null); // Placeholder
        });
    }

    // 8. Hugging Face Translation
    async translateWithHuggingFace(text, targetLang) {
        return new Promise((resolve) => {
            const modelName = this.getHuggingFaceModel(targetLang);
            if (!modelName) {
                resolve(null);
                return;
            }

            const postData = JSON.stringify({
                inputs: text
            });

            const options = {
                hostname: 'api-inference.huggingface.co',
                port: 443,
                path: `/models/${modelName}`,
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
                        if (result && result[0] && result[0].translation_text) {
                            console.log(`   ✅ HuggingFace: ${text} → ${result[0].translation_text}`);
                            resolve(result[0].translation_text);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        resolve(null);
                    }
                });
            });

            req.on('error', () => {
                resolve(null);
            });

            req.write(postData);
            req.end();
        });
    }

    getHuggingFaceModel(langCode) {
        const models = {
            'sw': 'facebook/m2m100_418M', // Swahili
            'ts': 'facebook/m2m100_418M', // Tsonga
            'fr': 'Helsinki-NLP/opus-mt-pt-fr',
            'es': 'Helsinki-NLP/opus-mt-pt-es'
        };
        return models[langCode];
    }

    // 9. Tradutor Apertium (especializado em línguas minoritárias)
    async translateWithApertium(text, targetLang) {
        return new Promise((resolve) => {
            const encodedText = encodeURIComponent(text);
            const langPair = this.getApertiumLangPair(targetLang);
            if (!langPair) {
                resolve(null);
                return;
            }

            const url = `https://apertium.org/apy/translate?q=${encodedText}&langpair=${langPair}`;

            https.get(url, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.responseData && result.responseData.translatedText) {
                            console.log(`   ✅ Apertium: ${text} → ${result.responseData.translatedText}`);
                            resolve(result.responseData.translatedText);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        resolve(null);
                    }
                });
            }).on('error', () => {
                resolve(null);
            });
        });
    }

    getApertiumLangPair(targetLang) {
        const pairs = {
            'sw': 'por-swh', // Português para Swahili
            'fr': 'por-fra', // Português para Francês
            'es': 'por-spa'  // Português para Espanhol
        };
        return pairs[targetLang];
    }

    // 10. Google Cloud Translation (alternativa)
    async translateWithGoogleCloud(text, targetLang) {
        return new Promise((resolve) => {
            // Necessita chave API do Google Cloud
            resolve(null); // Placeholder
        });
    }

    // MÉTODO PRINCIPAL: Tentar todas as fontes
    async translateWithAllSources(text, targetLang) {
        console.log(`\n🔍 Traduzindo: "${text}"`);

        const sources = [
            { name: 'MyMemory', method: this.translateWithMyMemory.bind(this) },
            { name: 'Yandex', method: this.translateWithYandex.bind(this) },
            { name: 'HuggingFace', method: this.translateWithHuggingFace.bind(this) },
            { name: 'Apertium', method: this.translateWithApertium.bind(this) },
            { name: 'Baidu', method: this.translateWithBaidu.bind(this) },
            { name: 'DeepL', method: this.translateWithDeepL.bind(this) }
        ];

        for (const source of sources) {
            try {
                console.log(`   🔄 Tentando ${source.name}...`);
                const result = await source.method(text, targetLang);
                
                if (result && result !== text && result.trim() !== '') {
                    console.log(`   ✅ ${source.name}: ${result}`);
                    this.results.push({
                        text: text,
                        translation: result,
                        source: source.name,
                        lang: targetLang
                    });
                    return result;
                }
                
                // Delay entre tentativas
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                console.log(`   ❌ ${source.name} falhou`);
            }
        }

        console.log(`   ❌ Todas as fontes falharam para: ${text}`);
        return text;
    }

    // MyMemory (funciona sem API key)
    async translateWithMyMemory(text, targetLang) {
        return new Promise((resolve) => {
            const encodedText = encodeURIComponent(text);
            const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=pt|${targetLang}&de=translator@example.com`;

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
                            resolve(null);
                        }
                    } catch (error) {
                        resolve(null);
                    }
                });
            }).on('error', () => {
                resolve(null);
            });
        });
    }

    // DOWNLOAD PRINCIPAL
    async downloadFromMultipleSources(langCode) {
        console.log(`\n🌍 BAIXANDO DE MÚLTIPLAS FONTES: ${langCode.toUpperCase()}`);
        console.log('📡 Fontes: MyMemory, Yandex, HuggingFace, Apertium, Baidu, DeepL\n');

        const baseStructure = this.loadPortugueseStructure();
        if (!baseStructure) {
            console.log('❌ pt.json não encontrado!');
            return;
        }

        let translations = this.createEmptyStructure(baseStructure);
        let translatedCount = 0;
        const totalKeys = this.countKeys(baseStructure);

        const ptTexts = this.getPortugueseTexts(baseStructure);
        const keys = Object.keys(ptTexts);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const portugueseText = ptTexts[key];

            if (portugueseText && portugueseText.trim()) {
                process.stdout.write(`\r⏳ Progresso: ${i + 1}/${keys.length} (${translatedCount} traduções)...`);

                const translated = await this.translateWithAllSources(portugueseText, langCode);
                
                if (translated && translated !== portugueseText) {
                    this.setTranslation(translations, key, translated);
                    translatedCount++;
                }

                // Delay generoso para respeitar APIs
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

        // Salvar resultados
        const filePath = path.join(this.localesDir, `${langCode}.json`);
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));

        // Salvar log detalhado
        this.saveResultsLog(langCode);

        console.log(`\n\n📁 Arquivo salvo: locales/${langCode}.json`);
        console.log(`📊 Traduzidas: ${translatedCount}/${totalKeys} (${((translatedCount / totalKeys) * 100).toFixed(1)}%)`);
        console.log(`📋 Log salvo: translation-results-${langCode}.json`);

        return translations;
    }

    // Métodos auxiliares
    loadPortugueseStructure() {
        try {
            const ptFile = path.join(this.localesDir, 'pt.json');
            return JSON.parse(fs.readFileSync(ptFile, 'utf8'));
        } catch (error) {
            console.log('❌ Erro ao carregar pt.json');
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

    saveResultsLog(langCode) {
        const logData = {
            timestamp: new Date().toISOString(),
            language: langCode,
            totalTranslations: this.results.length,
            sourcesUsed: [...new Set(this.results.map(r => r.source))],
            results: this.results
        };

        const logPath = path.join(__dirname, '..', `translation-results-${langCode}.json`);
        fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    }

    // Download para múltiplos idiomas
    async downloadAll() {
        console.log('🚀 INICIANDO DOWNLOAD DE MÚLTIPLAS FONTES EXTERNAS');
        console.log('==================================================\n');
        
        const languages = ['sw', 'ts', 'fr', 'es']; // Idiomas com melhor suporte
        
        for (const lang of languages) {
            this.results = []; // Reset para cada idioma
            await this.downloadFromMultipleSources(lang);
            console.log('\n' + '='.repeat(50) + '\n');
        }

        console.log('🎉 DOWNLOAD DE MÚLTIPLAS FONTES CONCLUÍDO!');
        console.log('📋 Logs detalhados salvos em: translation-results-*.json');
    }
}

// Execução
const downloader = new MultiSourceTranslationDownloader();

(async () => {
    await downloader.downloadAll();
})();