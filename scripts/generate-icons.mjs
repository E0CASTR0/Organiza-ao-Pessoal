// Gera o conjunto de ícones do PWA a partir de assets-source/logo-source-v2.jpeg.
// Rodar com: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SRC = 'assets-source/logo-source-v2.jpeg'
const OUT = 'public/icons'
const BG = '#050505' // mesmo tom quase-preto do tema escuro do app

mkdirSync(OUT, { recursive: true })

// A imagem original tem o ícone (quadrado preto arredondado com o bloco "R") centralizado
// num fundo cinza — precisa sumir completamente. Passo 1: recorta pro bounding box do
// quadrado preto (medido via varredura de luminância nas linhas/colunas centrais).
// Passo 2: como é um quadrado de cantos MUITO arredondados, só o bounding box ainda deixa
// um triângulo cinza em cada canto (a "sobra" do arredondamento) — um recorte central de
// 78% resolve (testado visualmente: 86%/82% ainda deixavam um resquício de cinza no canto,
// 78% já fica limpo, sem cortar o desenho do bloco).
const BOX_CENTER_X = 632
const BOX_CENTER_Y = 624
const BOX_SIZE = 880
const ZOOM_PCT = 0.78

async function filledSquareSource() {
  const boxed = sharp(SRC).extract({
    left: Math.round(BOX_CENTER_X - BOX_SIZE / 2),
    top: Math.round(BOX_CENTER_Y - BOX_SIZE / 2),
    width: BOX_SIZE,
    height: BOX_SIZE,
  })
  const w = Math.round(BOX_SIZE * ZOOM_PCT)
  const inset = Math.round((BOX_SIZE - w) / 2)
  const boxedBuffer = await boxed.png().toBuffer()
  return sharp(boxedBuffer).extract({ left: inset, top: inset, width: w, height: w })
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
