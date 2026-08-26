const OUTPUT_SIZE = 640
const JPEG_QUALITY = 0.85

/** Lê um File de imagem e devolve o elemento <img> já carregado (usado pelo ImageCropModal
 * pra exibir o preview e depois recortar). */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'))
      img.onload = () => resolve(img)
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export interface SourceRect {
  x: number
  y: number
  width: number
  height: number
}

/** Recorta uma região (em pixels naturais da imagem) e devolve um data URL JPEG quadrado
 * de tamanho fixo — usado pelo ImageCropModal depois que o usuário ajusta zoom/posição. */
export function cropToBase64(img: HTMLImageElement, source: SourceRect): string {
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível.')
  ctx.drawImage(img, source.x, source.y, source.width, source.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}
