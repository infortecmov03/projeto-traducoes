const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

function findMissingKeys(obj, base, currentPath = []) {
  let missing = [];
  
  for (const key in base) {
    const newPath = [...currentPath, key];
    const pathString = newPath.join('.');
    
    if (typeof base[key] === 'object' && base[key] !== null) {
      if (!obj || !obj[key]) {
        missing.push(pathString);
      } else {
        missing = missing.concat(findMissingKeys(obj[key], base[key], newPath));
      }
    } else {
      if (!obj || obj[key] === undefined || obj[key] === "") {
        missing.push(pathString);
      }
    }
  }
  
  return missing;
}

console.log('\n🔍 VALIDAÇÃO DE TRADUÇÕES\n');

try {
  const baseFile = path.join(localesDir, 'pt.json');
  const baseLang = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  
  const files = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json') && file !== 'pt.json');

  let hasErrors = false;

  files.forEach(file => {
    const langCode = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const missing = findMissingKeys(translations, baseLang);
    
    if (missing.length > 0) {
      hasErrors = true;
      console.log(`❌ ${langCode}: ${missing.length} traduções faltando`);
      missing.slice(0, 10).forEach(key => console.log(`   - ${key}`));
      if (missing.length > 10) {
        console.log(`   ... e mais ${missing.length - 10}`);
      }
    } else {
      console.log(`✅ ${langCode}: Completo`);
    }
  });

  if (hasErrors) {
    console.log('\n🚨 Algumas traduções estão faltando!');
    process.exit(1);
  } else {
    console.log('\n🎉 Todas as traduções estão completas!');
  }

} catch (error) {
  console.error('❌ Erro durante validação:', error.message);
  process.exit(1);
}