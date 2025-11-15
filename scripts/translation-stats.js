const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');

function countKeys(obj) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }
  return count;
}

function countEmptyValues(obj) {
  let empty = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      empty += countEmptyValues(obj[key]);
    } else if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
      empty++;
    }
  }
  return empty;
}

console.log('\n📊 ESTATÍSTICAS DE TRADUÇÕES\n');

try {
  const baseFile = path.join(localesDir, 'pt.json');
  const baseLang = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  const totalKeys = countKeys(baseLang);

  console.log(`Total de chaves base (português): ${totalKeys}\n`);

  const files = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json'));

  const languageNames = {
    pt: 'Português',
    en: 'English',
    ts: 'Xitsonga',
    sw: 'Swahili',
    sn: 'Sena',
    nd: 'Ndau',
    lomwe: 'Lomwe',
    chuwabo: 'Chuwabo'
  };

  files.forEach(file => {
    const langCode = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const totalTranslated = countKeys(translations);
    const emptyCount = countEmptyValues(translations);
    const translatedCount = totalTranslated - emptyCount;
    const completion = totalKeys > 0 ? ((translatedCount / totalKeys) * 100).toFixed(1) : 0;

    const langName = languageNames[langCode] || langCode;
    
    console.log(`${langName} (${langCode}):`);
    console.log(`  ✅ Traduzidas: ${translatedCount}/${totalKeys}`);
    console.log(`  ❌ Vazias: ${emptyCount}`);
    console.log(`  📈 Progresso: ${completion}%`);
    console.log(`  ${getProgressBar(completion)}\n`);
  });

  function getProgressBar(percentage) {
    const bars = 20;
    const filled = Math.round((percentage / 100) * bars);
    const empty = bars - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

} catch (error) {
  console.error('❌ Erro:', error.message);
}