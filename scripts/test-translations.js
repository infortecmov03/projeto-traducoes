const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

console.log('\n🧪 TESTANDO TRADUÇÕES\n');

try {
  const files = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json'));

  // Carregar todas as traduções
  const translations = {};
  files.forEach(file => {
    const langCode = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    translations[langCode] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });

  // Testar algumas chaves importantes
  const testKeys = [
    'auth.sign_in',
    'auth.sign_up', 
    'auth.username',
    'auth.password',
    'dashboard.overview',
    'commerce.add_to_cart',
    'errors.404'
  ];

  console.log('🔍 Testando chaves principais:\n');

  testKeys.forEach(key => {
    console.log(`Key: ${key}`);
    
    Object.keys(translations).forEach(lang => {
      const value = getNestedValue(translations[lang], key.split('.'));
      const status = value && value !== '' ? '✅' : '❌';
      console.log(`  ${status} ${lang}: ${value || '(vazio/não encontrado)'}`);
    });
    console.log('');
  });

  // Testar parâmetros
  console.log('🔍 Testando parâmetros:\n');
  const ptTerms = getNestedValue(translations.pt, 'auth.terms_agree'.split('.'));
  if (ptTerms && ptTerms.includes('{')) {
    console.log('✅ Português suporta parâmetros:', ptTerms);
  }

  function getNestedValue(obj, path) {
    return path.reduce((current, key) => current?.[key], obj);
  }

  console.log('🎉 Testes concluídos!');

} catch (error) {
  console.error('❌ Erro nos testes:', error.message);
}