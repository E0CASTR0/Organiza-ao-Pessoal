# Rômulo — Organização Pessoal

App pessoal (uso individual) de organização: agenda, metas do dia, prioridades do mês,
lista de compras, investimentos, treino, dieta, trabalho e contas fixas. Tema escuro
"old money" por padrão, com tema claro alternável. Funciona como PWA — pode ser
instalado na tela de início do iPhone.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Build de produção

```bash
npm run build
npm run preview   # pra testar o build localmente antes de publicar
```

## Onde os dados ficam salvos

Tudo é salvo **localmente no navegador** (IndexedDB, via Dexie.js) — não existe
servidor nem login. Nada é apagado automaticamente: toda exclusão vai primeiro pra
Lixeira (Configurações → Lixeira), de onde dá pra restaurar ou apagar de vez.

Nas Configurações também tem:
- **Exportar backup** — baixa um `.json` com tudo (inclusive fotos), pra guardar no
  iCloud/Drive.
- **Importar backup** — restaura os dados de um arquivo exportado anteriormente.
- **Resetar aplicativo** — apaga tudo permanentemente; exige digitar `EXCLUIR` pra
  confirmar.

## Publicando no GitHub Pages

1. Crie um repositório no GitHub (pode ser privado) e suba este projeto:
   ```bash
   git remote add origin <url-do-seu-repo>
   git branch -M main
   git push -u origin main
   ```
2. Em **Settings → Pages** do repositório, em "Source" escolha **GitHub Actions**.
3. O workflow em `.github/workflows/deploy.yml` builda e publica automaticamente a
   cada push na `main`. A variável `VITE_BASE_PATH` do workflow já usa o nome do
   repositório — não precisa editar `vite.config.ts` manualmente.
4. O site fica em `https://<seu-usuário>.github.io/<nome-do-repo>/`.

> **Nota sobre privacidade**: mesmo com o repositório privado, o site publicado no
> GitHub Pages fica acessível a qualquer pessoa que tiver o link (sem exigir login) —
> é assim que o GitHub Pages funciona numa conta normal. Guarde o link só com você.

## Instalando no iPhone

Depois de publicado, abra o link no **Safari** do iPhone → botão de compartilhar →
**"Adicionar à Tela de Início"**. O app abre em tela cheia, com o ícone próprio.

## Ícone do app (logo)

O ícone que aparece na tela de início ainda precisa ser gerado a partir do arquivo
real da logo. Coloque a imagem em `assets-source/logo-source.png` (quadrada, ideal
≥1024×1024) e gere o conjunto de ícones em `public/icons/` antes de publicar.
