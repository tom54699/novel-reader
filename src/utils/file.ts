const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  const name = file.name || ''
  const isTxt = name.toLowerCase().endsWith('.txt')
  if (!isTxt) return { valid: false, error: '僅支援 .txt' }
  if (file.size > MAX_SIZE) return { valid: false, error: '檔案過大' }
  return { valid: true }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('無法解析文字'))
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.readAsText(file, 'utf-8')
    } catch (e) {
      reject(new Error('無法解析文字'))
    }
  })
}
