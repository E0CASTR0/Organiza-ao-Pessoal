// Gera o conjunto de ícones do PWA a partir de assets-source/logo-source.jpeg.
// Rodar com: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SRC = 'assets-source/logo-source.jpeg'
const OUT = 'public/icons'
const BG = '#050505' // mesmo tom quase-preto do tema escuro do app

mkdirSync(OUT, { recursive: true })

async function square(size, outName) {
  await sharp(SRC).resize(size, size, { fit: 'cover' }).png().toFile(`${OUT}/${outName}`)
  console.log(`✓ ${outName} (${size}x${size})`)
}

async function maskable(size, outName) {
  // Ícone maskable: logo ocupando ~72% do canvas, centralizado, com fundo sólido —
  // dá margem de segurança pra launchers Android que recortam em círculo/squircle.
  const inner = Math.round(size * 0.72)
  const logo = await sharp(SRC).resize(inner, inner, { fit: 'cover' }).png().toBuffer()
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
