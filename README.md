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

Os ícones em `public/icons/` já foram gerados a partir da logo. Pra trocar a logo no
futuro, coloque a nova imagem (quadrada, ideal ≥1024×1024) em
`assets-source/logo-source.jpeg` (ou ajuste o caminho em `scripts/generate-icons.mjs`)
e rode:

```bash
npm run icons
```

Isso regenera favicon, ícone da tela de início do iPhone (apple-touch-icon) e os
ícones do manifest PWA (192, 512 e 512 maskable, esse último com margem de segurança
pra não cortar a coroa/texto quando o Android recorta em círculo).
