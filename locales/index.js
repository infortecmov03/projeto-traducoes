const translations = {
  pt: require('./pt.json'),
  en: require('./en.json'),
  ts: require('./ts.json'),
  sw: require('./sw.json'),
  sn: require('./sn.json'),
  nd: require('./nd.json'),
  lomwe: require('./lomwe.json'),
  chuwabo: require('./chuwabo.json')
};

class Translator {
  constructor(defaultLang = 'pt') {
    this.currentLang = defaultLang;
    this.fallbackLang = 'pt';
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
    } else {
      console.warn(`Idioma ${lang} não encontrado. Usando ${this.fallbackLang}`);
      this.currentLang = this.fallbackLang;
    }
  }

  t(key, params = {}) {
    const keys = key.split('.');
    let value = translations[this.currentLang];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (value === undefined) {
      value = translations[this.fallbackLang];
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
    }
    
    if (value && typeof value === 'string') {
      return value.replace(/{(w+)}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }
    
    return value || key;
  }

  getAvailableLanguages() {
    return Object.keys(translations).map(code => ({
      code,
      name: this.getLanguageName(code)
    }));
  }

  getLanguageName(code) {
    const names = {
      pt: 'Português',
      en: 'English',
      ts: 'Xitsonga',
      sw: 'Swahili',
      sn: 'Sena',
      nd: 'Ndau',
      lomwe: 'Lomwe',
      chuwabo: 'Chuwabo'
    };
    return names[code] || code;
  }
}

module.exports = new Translator();
