const fs = require('fs');
const path = require('path');
const https = require('https');

class RealTranslationDownloader {
    constructor() {
        this.localesDir = path.join(__dirname, '..', 'locales');
        this.ensureLocalesDir();
    }

    ensureLocalesDir() {
        if (!fs.existsSync(this.localesDir)) {
            fs.mkdirSync(this.localesDir, { recursive: true });
        }
    }

    // Baixar do LibreTranslate (gratuito)
    async translateWithLibreTranslate(text, targetLang) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
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
                    'Content-Length': data.length
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const result = JSON.parse(responseData);
                        resolve(result.translatedText || text);
                    } catch (error) {
                        resolve(text); // Fallback
                    }
                });
            });

            req.on('error', (error) => {
                console.log(`❌ Erro LibreTranslate: ${error.message}`);
                resolve(text); // Fallback
            });

            req.write(data);
            req.end();
        });
    }

    // Baixar traduções do projeto Tatoeba (base de dados aberta)
    async downloadFromTatoeba(langCode) {
        // Tatoeba tem frases traduzidas por humanos
        const languages = {
            'sw': 'swa', // Swahili
            'ts': 'tso', // Tsonga
            'pt': 'por'  // Português
        };

        const tatoebaLang = languages[langCode];
        if (!tatoebaLang) return {};

        try {
            const translations = {};
            // Aqui você implementaria o download do dataset Tatoeba
            // O dataset é grande, então focamos em frases comuns
            
            console.log(`📥 Verificando Tatoeba para ${langCode}...`);
            return translations;
        } catch (error) {
            console.log(`❌ Tatoeba erro: ${error.message}`);
            return {};
        }
    }

    // Traduções básicas de dicionários abertos
    getDictionaryTranslations(langCode) {
        const dictionaries = {
            'sw': { // Swahili - Dicionário aberto
                'auth.sign_in': 'Ingia',
                'auth.sign_up': 'Jisajili', 
                'auth.sign_out': 'Toka',
                'auth.username': 'Jina la mtumiaji',
                'auth.password': 'Nenosiri',
                'auth.email': 'Barua pepe',
                'auth.forgot_password': 'Umesahau nenosiri?',
                'common.save': 'Hifadhi',
                'common.cancel': 'Ghairi',
                'common.delete': 'Futa',
                'common.edit': 'Hariri',
                'common.search': 'Tafuta',
                'common.loading': 'Inapakia',
                'navigation.home': 'Nyumbani',
                'navigation.profile': 'Wasifu',
                'navigation.settings': 'Mipangilio',
                'navigation.logout': 'Toka',
                'errors.404': 'Ukurasa haupo',
                'errors.500': 'Hitilafu ya seva',
                'errors.network_error': 'Hitilafu ya mtandao',
                'errors.unauthorized': 'Hauna ruhusa'
            },
            'ts': { // Xitsonga - Traduções comuns
                'auth.sign_in': 'Nghena',
                'auth.sign_up': 'Tumbela',
                'auth.sign_out': 'Humela',
                'auth.username': 'Vito ra mutirhisi',
                'auth.password': 'Xivuriso',
                'auth.email': 'Imeyili',
                'auth.forgot_password': 'Xana u rivalile xivuriso?',
                'common.save': 'Hlayisa',
                'common.cancel': 'Kansela',
                'common.delete': 'Sula',
                'common.edit': 'Lulama',
                'common.search': 'Lava',
                'common.loading': 'Ku layicha',
                'navigation.home': 'Kaya',
                'navigation.profile': 'Profayili',
                'navigation.settings': 'Swivangelo',
                'navigation.logout': 'Humela',
                'errors.404': 'Pheji a yi kumiwi',
                'errors.500': 'Xihoxo xa seva',
                'errors.network_error': 'Xihoxo xa netiweke',
                'errors.unauthorized': 'A wu na mvume'
            }
        };

        return dictionaries[langCode] || {};
    }

    // Gerar traduções completas
    async generateRealTranslations(langCode, useAPI = false) {
        console.log(`\n🌍 BAIXANDO TRADUÇÕES PARA: ${langCode.toUpperCase()}`);

        // 1. Carregar estrutura base do Português
        const baseStructure = this.loadPortugueseStructure();
        if (!baseStructure) {
            console.log('❌ Estrutura base não encontrada!');
            return;
        }

        // 2. Começar com dicionário básico
        const dictionary = this.getDictionaryTranslations(langCode);
        let translations = this.createEmptyStructure(baseStructure);

        // 3. Aplicar traduções do dicionário
        let translatedCount = 0;
        for (const [key, value] of Object.entries(dictionary)) {
            this.setTranslation(translations, key, value);
            translatedCount++;
        }

        console.log(`✅ ${translatedCount} traduções do dicionário`);

        // 4. Tentar API para traduções restantes (opcional)
        if (useAPI && translatedCount < this.countKeys(baseStructure)) {
            console.log(`⏳ Usando API para traduções restantes...`);
            translations = await this.translateRemainingWithAPI(translations, baseStructure, langCode);
        }

        // 5. Salvar arquivo
        const filePath = path.join(this.localesDir, `${langCode}.json`);
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
        
        const finalCount = this.countTranslatedKeys(translations);
        const totalCount = this.countKeys(baseStructure);
        
        console.log(`📁 Arquivo salvo: locales/${langCode}.json`);
        console.log(`📊 Progresso: ${finalCount}/${totalCount} (${((finalCount/totalCount)*100).toFixed(1)}%)`);

        return translations;
    }

    async translateRemainingWithAPI(translations, baseStructure, langCode) {
        const ptTexts = this.getPortugueseTexts();
        let apiTranslated = 0;

        for (const [key, value] of this.getAllTranslationPairs(translations)) {
            if (!value && ptTexts[key]) {
                try {
                    const translated = await this.translateWithLibreTranslate(ptTexts[key], langCode);
                    if (translated && translated !== ptTexts[key]) {
                        this.setTranslation(translations, key, translated);
                        apiTranslated++;
                        process.stdout.write(`\r⏳ API: ${apiTranslated} traduções...`);
                    }
                    // Delay para não sobrecarregar
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    // Continua sem esta tradução
                }
            }
        }

        if (apiTranslated > 0) {
            console.log(`\n✅ ${apiTranslated} traduções da API`);
        }

        return translations;
    }

    loadPortugueseStructure() {
        try {
            const ptFile = path.join(this.localesDir, 'pt.json');
            return JSON.parse(fs.readFileSync(ptFile, 'utf8'));
        } catch (error) {
            console.log('❌ Erro ao carregar pt.json');
            return null;
        }
    }

    getPortugueseTexts() {
        const base = this.loadPortugueseStructure();
        const texts = {};
        
        if (base) {
            for (const [key, value] of this.getAllTranslationPairs(base)) {
                texts[key] = value;
            }
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

    countTranslatedKeys(obj) {
        let count = 0;
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                count += this.countTranslatedKeys(obj[key]);
            } else if (obj[key] && obj[key] !== "") {
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
    async downloadAll(useAPI = false) {
        console.log('🚀 INICIANDO DOWNLOAD DE TRADUÇÕES REAIS\n');
        
        // Idiomas com dicionários disponíveis
        const languages = ['sw', 'ts']; // Comece com esses
        
        for (const lang of languages) {
            await this.generateRealTranslations(lang, useAPI);
        }

        console.log('\n🎉 DOWNLOAD CONCLUÍDO!');
        console.log('💡 Agora você tem traduções reais para trabalhar!');
    }
}

// Execução
const args = process.argv.slice(2);
const downloader = new RealTranslationDownloader();

(async () => {
    if (args.includes('--api')) {
        console.log('🔧 MODO: Dicionário + API (mais lento)');
        await downloader.downloadAll(true);
    } else {
        console.log('🔧 MODO: Apenas dicionário (rápido)');
        await downloader.downloadAll(false);
    }
})();