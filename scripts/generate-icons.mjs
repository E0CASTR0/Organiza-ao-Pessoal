// Gera o conjunto de ícones do PWA a partir de assets-source/logo-source.jpeg.
// Rodar com: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SRC = 'assets-source/logo-source.jpeg'
const OUT = 'public/icons'
const BG = '#050505' // mesmo tom quase-preto do tema escuro do app

mkdirSync(OUT, { recursive: true })

// A imagem original já vem renderizada como um "mockup" de ícone (cartão arredondado
// com brilho/reflexo), com uma margem preta ao redor. Se usada crua, o iOS aplica a
// MÁSCARA DELE por cima disso e sobra uma borda preta dupla, com a arte não preenchendo
// o quadrado todo. Corrigimos em 2 passos: 1) trim() remove a margem preta externa da
// imagem; 2) um recorte central de 86% "dá zoom" o suficiente pra empurrar os cantos
// arredondados do próprio cartão pra fora do quadro, sem cortar a coroa nem o texto
// "RÔMULO" (validado visualmente — 90% ainda mostrava um resto de canto preto, 82%
// já cortava a coroa rente demais).
async function filledSquareSource() {
  const trimmed = await sharp(SRC).trim({ threshold: 15 }).toBuffer({ resolveWithObject: true })
  const { width, height } = trimmed.info
  const pct = 0.86
  const w = Math.round(width * pct)
  const h = Math.round(height * pct)
  const left = Math.round((width - w) / 2)
  const top = Math.round((height - h) / 2)
  return sharp(trimmed.data).extract({ left, top, width: w, height: h })
}

async function square(size, outName) {
  const src = await filledSquareSource()
  await src.resize(size, size, { fit: 'cover' }).png().toFile(`${OUT}/${outName}`)
  console.log(`✓ ${outName} (${size}x${size})`)
}

async function maskable(size, outName) {
  // Ícone maskable: logo ocupando ~72% do canvas, centralizado, com fundo sólido —
  // dá margem de segurança pra launchers Android que recortam em círculo/squircle.
  const inner = Math.round(size * 0.72)
  const src = await filledSquareSource()
  const logo = await src.resize(inner, inner, { fit: 'cover' }).png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(`${OUT}/${outName}`)
  console.log(`✓ ${outName} (${size}x${size}, maskable)`)
}

await square(32, 'favicon-32.png')
await square(180, 'apple-touch-icon-180.png')
await square(192, 'icon-192.png')
await square(512, 'icon-512.png')
await maskable(512, 'icon-512-maskable.png')

console.log('\nÍcones gerados em public/icons/')
