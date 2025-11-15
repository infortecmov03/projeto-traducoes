# 1. Navegar para sua pasta do projeto
cd caminho/para/seu/projeto

# 2. Criar pasta scripts (se não existir)
mkdir scripts

# 3. Agora execute o script
node scripts/generate-locales.js


# 5. Resultado Esperado
# Após executar, você verá no terminal:

📁 Criada pasta: locales
📁 Criada pasta: scripts  
📁 Criada pasta: .github/workflows
✅ Criado: locales/pt.json
✅ Criado: locales/en.json
✅ Criado: locales/ts.json
✅ Criado: locales/sw.json
✅ Criado: locales/sn.json
✅ Criado: locales/nd.json
✅ Criado: locales/lomwe.json
✅ Criado: locales/chuwabo.json
🎉 Estrutura criada com sucesso!

# 6. No VS Code (Mais Fácil): Se estiver usando VS Code:

# Abra sua pasta do projeto no VS Code

Pressione Ctrl + J (Windows) ou Cmd + J (Mac) para abrir o terminal integrado

Execute os comandos diretamente lá

Precisa de ajuda com algum passo específico? Posso guiar você através de qualquer dificuldade!









# 🌍 Sistema de Traduções Multi-idioma

Sistema completo de gerenciamento de traduções para línguas nacionais de Moçambique, com interface web para teste e validação.

## 📋 Idiomas Suportados

| Código | Idioma | Status |
|--------|---------|---------|
| `pt` | Português | ✅ Completo |
| `en` | English | ✅ Completo |
| `ts` | Xitsonga/Changana | 🔄 Em progresso |
| `sw` | Swahili | 🔄 Em progresso |
| `sn` | Sena | 🔄 Em progresso |
| `nd` | Ndau | 🔄 Em progresso |
| `lomwe` | Lomwe | 🔄 Em progresso |
| `chuwabo` | Chuwabo | 🔄 Em progresso |

## 🚀 Começando

### Pré-requisitos
- Node.js 16+ 
- Navegador web moderno

### Instalação

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd multi-language-translations
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Acesse no navegador:**
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
locales/
├── pt.json          # Português (base)
├── en.json          # Inglês
├── ts.json          # Xitsonga
├── sw.json          # Swahili
├── sn.json          # Sena
├── nd.json          # Ndau
├── lomwe.json       # Lomwe
├── chuwabo.json     # Chuwabo
└── index.js         # Gerenciador de traduções

scripts/
├── generate-locales.js      # Gerar estrutura inicial
├── validate-locales.js      # Validar traduções
├── find-missing.js          # Encontrar faltantes
├── translation-stats.js     # Estatísticas
├── export-translations.js   # Exportar traduções
├── import-translations.js   # Importar traduções
└── test-translations.js     # Testar traduções

index.html           # Página principal de testes
translator.html      # Tradutor interativo
package.json         # Configuração do projeto
README.md            # Este arquivo
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Servidor local na porta 3000
npm start           # Servidor Express
```

### Gerenciamento de Traduções
```bash
npm run locales:generate    # Gerar estrutura inicial
npm run locales:validate    # Validar traduções completas
npm run locales:missing     # Encontrar traduções vazias
npm run locales:stats       # Ver estatísticas de progresso
npm run locales:export      # Exportar para pasta exports/
npm run locales:import      # Importar da pasta imports/
```

### Utilitários
```bash
npm test            # Testar todas as traduções
npm run build       # Criar build de produção
```

## 🎯 Como Usar

### 1. Testador Web (`index.html`)
Interface completa para visualizar e testar todas as traduções:
- Navegação por categorias
- Filtro por idioma
- Visualização em tempo real
- Estatísticas de progresso

### 2. Tradutor Interativo (`translator.html`)
Funciona como Google Tradutor:
- **Tradução automática** enquanto digita
- **Botão manual** para forçar tradução
- **Detecção inteligente** de chaves vs texto
- **Pesquisa instantânea** em todas as traduções
- **Troca rápida** entre idiomas

### 3. Linha de Comando
```bash
# Ver estatísticas
node scripts/translation-stats.js

# Validar traduções
node scripts/validate-locales.js

# Exportar para CSV/JSON
node scripts/export-translations.js
```

## 📝 Estrutura das Traduções

As traduções seguem estrutura hierárquica organizada por contexto:

```json
{
  "auth": {
    "sign_in": "Iniciar Sessão",
    "sign_up": "Criar Conta"
  },
  "dashboard": {
    "overview": "Visão Geral",
    "statistics": "Estatísticas"
  }
}
```

### Parâmetros Suportados
Use `{var}` para valores dinâmicos:
```json
{
  "auth": {
    "terms_agree": "Ao registar-se, concorda com os nossos {terms} e {privacy}"
  }
}
```

## 🔧 Desenvolvimento

### Adicionar Novo Idioma

1. **Crie o arquivo JSON:**
```bash
cp locales/pt.json locales/novo_idioma.json
```

2. **Atualize o gerenciador:**
Edite `locales/index.js` para incluir o novo idioma.

3. **Preencha as traduções** seguindo a estrutura do português.

### Adicionar Novas Chaves

1. **Adicione em todos os idiomas** para manter consistência
2. **Execute a validação:**
```bash
npm run locales:validate
```

### Convenções
- **Chaves**: `categoria.subcategoria.chave` (snake_case)
- **Valores**: Texto completo com pontuação
- **Parâmetros**: `{nome_parametro}` entre chaves
- **Consistência**: Manter mesma estrutura em todos os idiomas

## 📊 Monitoramento de Progresso

Use o script de estatísticas para acompanhar:

```bash
node scripts/translation-stats.js
```

**Saída exemplo:**
```
📊 ESTATÍSTICAS DE TRADUÇÕES

Português (pt):
  ✅ Traduzidas: 215/215
  ❌ Vazias: 0
  📈 Progresso: 100.0%
  ████████████████████

English (en):
  ✅ Traduzidas: 210/215
  ❌ Vazias: 5
  📈 Progresso: 97.7%
  ██████████████████░░

Xitsonga (ts):
  ✅ Traduzidas: 150/215
  ❌ Vazias: 65
  📈 Progresso: 69.8%
  ████████████░░░░░░░░
```

## 🚀 Deploy

### GitHub Pages
1. Habilite GitHub Pages nas configurações do repositório
2. O site estará disponível em: `https://seu-usuario.github.io/multi-language-translations`

### Servidor Próprio
```bash
npm run build
# Copie a pasta build/ para seu servidor
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-traducao`
3. Commit suas mudanças: `git commit -am 'Adiciona traduções Xitsonga'`
4. Push para a branch: `git push origin feature/nova-traducao`
5. Abra um Pull Request

### Guidelines para Traduções
- Mantenha o contexto cultural
- Use linguagem natural e idiomática
- Preserve placeholders `{...}`
- Teste no tradutor interativo
- Valide com `npm run locales:validate`

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Problemas comuns:

**❌ "Erro de CORS ao carregar JSON"**
- Use um servidor local: `npm run dev`
- Não abra o HTML diretamente no navegador

**❌ "Traduções não carregam"**
- Verifique se os arquivos JSON estão em `locales/`
- Execute `npm run locales:validate`

**❌ "Scripts não funcionam"**
- Verifique se Node.js está instalado: `node --version`
- Instale dependências: `npm install`

## 📞 Contato

Para questões sobre traduções ou colaboração, abra uma issue no repositório.

---

**Desenvolvido para preservar e promover as línguas nacionais de Moçambique** 🇲🇿




# Primeiro, instale as dependências:
bash
npm install axios cheerio