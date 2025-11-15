const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const exportDir = path.join(__dirname, '..', 'exports');

console.log('\n📤 EXPORTANDO TRADUÇÕES\n');

try {
  // Criar pasta de exports se não existir
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const files = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json'));

  // Exportar cada arquivo individualmente
  files.forEach(file => {
    const sourcePath = path.join(localesDir, file);
    const destPath = path.join(exportDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ ${file}`);
  });

  // Exportar bundle combinado
  const bundle = {};
  files.forEach(file => {
    const langCode = file.replace('.json', '');
    const content = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
    bundle[langCode] = content;
  });

  const bundlePath = path.join(exportDir, 'all-translations.json');
  fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2));
  console.log('✅ all-translations.json');

  // Exportar para CSV (opcional)
  const csvPath = path.join(exportDir, 'translations.csv');
  let csvContent = 'Key;Portuguese;English;Xitsonga;Swahili;Sena;Ndau;Lomwe;Chuwabo\n';
  
  function generateCSVRows(obj, currentPath = []) {
    for (const key in obj) {
      const newPath = [...currentPath, key];
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        generateCSVRows(obj[key], newPath);
      } else {
        const keyPath = newPath.join('.');
        const row = [
          keyPath,
          bundle.pt ? getNestedValue(bundle.pt, newPath) || '' : '',
          bundle.en ? getNestedValue(bundle.en, newPath) || '' : '',
          bundle.ts ? getNestedValue(bundle.ts, newPath) || '' : '',
          bundle.sw ? getNestedValue(bundle.sw, newPath) || '' : '',
          bundle.sn ? getNestedValue(bundle.sn, newPath) || '' : '',
          bundle.nd ? getNestedValue(bundle.nd, newPath) || '' : '',
          bundle.lomwe ? getNestedValue(bundle.lomwe, newPath) || '' : '',
          bundle.chuwabo ? getNestedValue(bundle.chuwabo, newPath) || '' : ''
        ].join(';');
        
        csvContent += row + '\n';
      }
    }
  }

  function getNestedValue(obj, path) {
    return path.reduce((current, key) => current?.[key], obj);
  }

  if (bundle.pt) {
    generateCSVRows(bundle.pt);
    fs.writeFileSync(csvPath, csvContent);
    console.log('✅ translations.csv');
  }

  console.log(`\n🎉 Exportação concluída! Verifique a pasta 'exports/'`);

} catch (error) {
  console.error('❌ Erro na exportação:', error.message);
}