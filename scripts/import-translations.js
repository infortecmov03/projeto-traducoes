const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const importDir = path.join(__dirname, '..', 'imports');

console.log('\n📥 IMPORTANDO TRADUÇÕES\n');

try {
  // Verificar se pasta de imports existe
  if (!fs.existsSync(importDir)) {
    console.log('❌ Pasta "imports/" não encontrada');
    console.log('💡 Crie a pasta "imports/" e coloque os arquivos JSON lá');
    process.exit(1);
  }

  const files = fs.readdirSync(importDir)
    .filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    console.log('❌ Nenhum arquivo JSON encontrado na pasta "imports/"');
    process.exit(1);
  }

  files.forEach(file => {
    const sourcePath = path.join(importDir, file);
    const destPath = path.join(localesDir, file);
    
    // Verificar se é um JSON válido
    try {
      const content = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      fs.writeFileSync(destPath, JSON.stringify(content, null, 2));
      console.log(`✅ ${file} importado com sucesso`);
    } catch (error) {
      console.log(`❌ Erro em ${file}: ${error.message}`);
    }
  });

  console.log('\n🎉 Importação concluída!');

} catch (error) {
  console.error('❌ Erro na importação:', error.message);
}