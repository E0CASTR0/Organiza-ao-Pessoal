// Gera o conjunto de ícones do PWA a partir de assets-source/logo-source-v2.jpeg.
// Rodar com: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SRC = 'assets-source/logo-source-v2.jpeg'
const OUT = 'public/icons'
const BG = { r: 34, g: 34, b: 34, alpha: 1 } // preto amostrado do próprio fundo do ícone original

mkdirSync(OUT, { recursive: true })

// A imagem original tem o ícone (quadrado preto arredondado com o bloco "R") centralizado
// num fundo cinza. Passo 1: recorta pro bounding box do quadrado preto (medido via
// varredura de luminância nas linhas/colunas centrais). Passo 2: como o quadrado tem
// cantos MUITO arredondados, o bounding box ainda deixa um triângulo cinza em cada canto
// (a "sobra" do arredondamento) — em vez de dar zoom pra cortar isso (o que também
// cortava a margem do desenho, deixando o bloco grande e colado na borda, diferente da
// proporção "respirada" de referência, tipo o ícone do Notion), aplicamos uma máscara
// arredondada e preenchemos só os cantos com o preto real do ícone. Isso preserva a
// proporção original do desenho (bloco centralizado, com bastante margem preta ao redor).
const BOX_CENTER_X = 632
const BOX_CENTER_Y = 624
const BOX_SIZE = 880
const CORNER_RADIUS = 190 // testado visualmente: raios menores (130-160) ainda deixavam cinza no canto

async function filledSquareSource() {
  const boxed = await sharp(SRC)
    .extract({
      left: Math.round(BOX_CENTER_X - BOX_SIZE / 2),
      top: Math.round(BOX_CENTER_Y - BOX_SIZE / 2),
      width: BOX_SIZE,
      height: BOX_SIZE,
    })
    .png()
    .toBuffer()

  const mask = await sharp(
    Buffer.from(`<svg width="${BOX_SIZE}" height="${BOX_SIZE}"><rect width="${BOX_SIZE}" height="${BOX_SIZE}" rx="${CORNER_RADIUS}" ry="${CORNER_RADIUS}" fill="#fff"/></svg>`),
  )
    .png()
    .toBuffer()

  const masked = await sharp(boxed).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()

  // compositing e resize precisam ser passos separados — o sharp aplica resize no canvas
  // base antes de validar as dimensões do composite, o que dá erro se feito na mesma cadeia
  const composited = await sharp({ create: { width: BOX_SIZE, height: BOX_SIZE, channels: 4, background: BG } })
    .composite([{ input: masked }])
    .png()
    .toBuffer()

  return sharp(composited)
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
