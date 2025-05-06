# Contribuindo

## Boas-vindas

Se você quer contribuir com o projeto, seja bem-vindo. Se você é (ou quer ser) um desenvolvedor, fale conosco no Discord (https://discord.gg/wHsR7ASaZ2) que a gente consegue ajudar você a começar.

## Começando

O projeto usa rollup para empacotar os arquivos em uma build para distribuição. Se você quer tentar, siga estes passos:

- Clone o repositório em uma pasta local usando `git clone https://gitlab.com/vizael/Tormenta20.git`

- Dentro da pasta do clone, instale as dependências usando `npm ci`

- Você precisa criar manualmente um link simbólico (symlink) entre a pasta da build ("dist") e a sua pasta "data" do Foundry.

- Execute `npm run build:ci` uma vez para criar a build com os compêndios. Nas próximas vezes, execute `npm run build` para criar a build sem recriar os compêndios.

- Execute `npm run build:watch` para que quaisquer mudanças no código-fonte automaticamente reconstruam o projeto.

- Para atualizar os arquivos de compêndios, com o Foundry fechado, copie os arquivos da pasta `dist/packs` na pasta `packs/` e então execute `node ./utils/packs.mjs package unpack`.

## Como ajudar

Crie um fork do projeto, faça as suas modificações e então envie um Merge Request no Gitlab para a gente.

Tenha certeza que o branch `master` é o mais atual do projeto original, pois é possível que exista algum branch para atualizações futuras.

### Conteúdo de Compêndios

- Aceitamos qualquer conteúdo que estiver sob a licença OGL que for identificado como Conteúdo Open Game.

- Não envie gráficos sem antes receber permissão do dono do copyright.

### Merge Requests

Merge Requests ("MRs" ou "PRs" como são conhecidos no Github) podem ser feitos por qualquer um. Títulos de MRs devem ser escritos no modo imperativo e descrever de forma clara e consica o que está sendo modificado. Uma descrição é geralmente necessária para explicar mais detalhes.
