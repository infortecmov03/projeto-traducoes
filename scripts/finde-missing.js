const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

function getEmptyKeys(obj, currentPath = []) {
  let empty = [];
  
  for (const key in obj) {
    const newPath = [...currentPath, key];
    const pathString = newPath.join('.');
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      empty = empty.concat(getEmptyKeys(obj[key], newPath));
    } else if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
      empty.push(pathString);
    }
  }
  
  return empty;
}

console.log('\n📋 TRADUÇÕES VAZIAS/FALTANTES\n');

try {
  const files = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json'));

  files.forEach(file => {
    const langCode = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const emptyKeys = getEmptyKeys(translations);
    
    if (emptyKeys.length > 0) {
      console.log(`\n${langCode.toUpperCase()}: ${emptyKeys.length} vazias`);
      emptyKeys.forEach(key => console.log(`   ${key}`));
    } else {
      console.log(`\n${langCode.toUpperCase()}: ✅ Nenhuma tradução vazia`);
    }
  });

} catch (error) {
  console.error('❌ Erro:', error.message);
}